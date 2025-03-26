'use client';

import { Application } from './types';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquareText,
  Zap,
  Pencil
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressBar from '@/components/ui/progress-bar';
import {
  acceptApplication,
  rejectApplication,
  scheduleInterview
} from '@/lib/api';
import { useState } from 'react';

const updateScreeningScore = async (id: string, score: number, comment: string) => {
  try {
    const res = await fetch(`/api/applications/${id}/screening-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, comment })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};

const StatusPopup = ({
  application,
  type,
  onClose,
  refreshApplications
}: {
  application: Application;
  type: 'screening' | 'interview';
  onClose: () => void;
  refreshApplications: () => Promise<void>;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<'hire' | 'reject' | 'schedule' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedScore, setEditedScore] = useState<number | null>(null);
  const [editComment, setEditComment] = useState('');

  const isActionable = application.application_status === 'pending';
  const hasInterviewScheduled =
    application.interview &&
    ['scheduled', 'completed', 'flagged'].includes(application.interview.interview_status);

  const handleScheduleInterview = async () => {
    try {
      setIsProcessing(true);
      setCurrentAction('schedule');
      setError(null);

      const result = await scheduleInterview(application._id);
      if (!result.success) throw new Error(result.error || 'Failed to schedule interview');

      await refreshApplications();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview');
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const handleHire = async () => {
    try {
      setIsProcessing(true);
      setCurrentAction('hire');
      setError(null);

      const result = await acceptApplication(application._id);
      if (!result.success) throw new Error(result.error || 'Failed to accept application');

      await refreshApplications();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to accept application');
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      setCurrentAction('reject');
      setError(null);

      const result = await rejectApplication(application._id);
      if (!result.success) throw new Error(result.error || 'Failed to reject application');

      await refreshApplications();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject application');
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const renderInterviewContent = () => {
    if (!application.interview)
      return (
        <div className="p-4 bg-[#364957]/5 rounded-lg text-center text-[#364957]/80">
          <Clock className="w-8 h-8 mx-auto mb-2 text-[#364957]/50" />
          Interview not scheduled yet
        </div>
      );

    return (
      <div className="space-y-6">
        {application.interview.interview_status === 'completed' && application.interview.score && (
          <div className="p-4 bg-[#364957]/5 rounded-lg">
            <div className="flex items-center gap-2 text-lg font-semibold text-[#364957] mb-2">
              <FileText className="w-5 h-5 text-[#FF8A00]" />
              <h3>Interview Results</h3>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-bold text-[#364957]">
                {application.interview?.score?.toFixed(1) || 'N/A'}
              </div>
              <span className="text-[#364957]/80">Overall Score</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#364957]/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {application.interview.interview_status === 'completed' ? (
                <>
                  {application.interview.hiring_decision === 'Hire' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-semibold text-[#364957]">
                    {application.interview.hiring_decision}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-[#FF8A00]" />
                  <span className="font-semibold text-[#364957] capitalize">
                    {application.interview.interview_status.replace(/_/g, ' ')}
                  </span>
                </>
              )}
            </div>
            {application.interview.interview_date && (
              <p className="text-sm text-[#364957]/80">
                {new Date(application.interview.interview_date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {application.interview.interview_status === 'flagged' &&
            application.interview.violations && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Violations Detected</span>
                </div>
                <div className="space-y-2">
                  {application.interview.violations.split('\n').map((violation, i) => {
                    const isMajor = violation.startsWith('MAJOR');
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-2 text-sm ${
                          isMajor ? 'text-red-600' : 'text-[#364957]/80'
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full mt-1 ${
                            isMajor ? 'bg-red-500' : 'bg-[#364957]/50'
                          }`}
                        />
                        {violation.replace('MAJOR: ', '').replace('MINOR: ', '')}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {application.interview.interview_status === 'completed' &&
          application.interview.skill_assessment && (
            <div className="p-4 bg-[#364957]/5 rounded-lg">
              <div className="flex items-center gap-2 text-[#364957] mb-4">
                <FileText className="w-5 h-5 text-[#FF8A00]" />
                <span className="font-medium">Skill Assessment</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(application.interview.skill_assessment).map(([skill, data]) => (
                  <div
                    key={skill}
                    className="p-4 bg-white rounded-lg border border-[#364957]/20"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[#364957] capitalize">{skill}</span>
                      <span className="text-sm text-[#364957]/80">
                        {(data.rating ?? data.score ?? 'N/A')}/10
                      </span>
                    </div>
                    <ProgressBar
                      value={((data.rating ?? data.score) / 10) * 100}
                      color="#FF8A00"
                      className="h-2 rounded-full"
                    />
                    <div className="mt-2 text-sm text-[#364957]/80">
                      <div>Required: {data.required_level}</div>
                      <div className="mt-1">Evidence: {data.evidence}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {application.interview.interview_reasoning && (
          <div className="p-4 bg-[#364957]/5 rounded-lg">
            <div className="flex items-center gap-2 text-[#364957] mb-2">
              <MessageSquareText className="w-5 h-5 text-[#FF8A00]" />
              <span className="font-medium">Evaluation Reasoning</span>
            </div>
            <div className="space-y-4">
              {application.interview.interview_reasoning
                .split(/\d+\)\s+/)
                .slice(1)
                .map((section, index) => {
                  const [title, ...contentParts] = section.split(': ');
                  const content = contentParts.join(': ');

                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#FF8A00] mt-1" />
                        <div className="w-px h-full bg-[#364957]/20" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#364957] mb-1">
                          {title.replace(/^\d+\)\s*/, '')}
                        </h4>
                        <p className="text-[#364957]/80 leading-relaxed">{content}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };
}

export default StatusPopup;

