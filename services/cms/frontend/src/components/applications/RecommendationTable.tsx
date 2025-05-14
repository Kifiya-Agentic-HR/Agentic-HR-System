"use client";

import { RecommendationResponse } from "@/components/jobs/types";
import Link from "next/link";
import { FiCalendar, FiFileText, FiStar, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { useState } from "react";
import { getJobApplications, inviteRecommendation } from "@/lib/api";

interface RecommendationTableProps {
  recommendations: RecommendationResponse[];
  jobId: string;
}

export const extractUserData = (rec: RecommendationResponse): { name: string; email: string } => {
  const { full_name, email } = rec;
  return { name: full_name, email };
};

export default function RecommendationTable({
  recommendations,
  jobId
}: RecommendationTableProps) {
  const [selectedReasoning, setSelectedReasoning] = useState<RecommendationResponse | null>(null);
  const [invitedRecommendations, setInvitedRecommendations] = useState<Set<string>>(new Set());
  const [showCvPopup, setShowCvPopup] = useState(false);
  const [selectedCvLink, setSelectedCvLink] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  const handleInviteClick = async (recommendation: RecommendationResponse) => {
    
    const payload = {
      to: recommendation.email ,
      title: jobId,          
      type: "application_invite" as const,
      subject: "We would like to invite you to apply to an open Job role at Kifiya Financial Technologies.",
      name: recommendation.full_name,      // Replace with the candidate's name
      apply_link: jobId //
    };
    
    await inviteRecommendation(payload);
    
    setInvitedRecommendations(prev => new Set(prev.add(recommendation._id)));

  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr className="text-left text-sm font-semibold">
              <th className="pl-8 pr-6 py-5 rounded-tl-2xl">Candidate</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Reasoning</th>
              <th className="px-6 py-5">Score</th>
              <th className="px-6 py-5">CV</th>
              <th className="pr-8 pl-6 py-5 rounded-tr-2xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recommendations.map((rec) => (
              <tr key={rec._id} className="hover:bg-[#364957]/5">
                <td className="pl-8 pr-6 py-4 font-medium text-primary text-lg">
                  {rec.full_name}
                </td>
                <td className="px-6 py-4 text-gray-600">{rec.email}</td>
                <td className="px-6 py-4">
                <button
                    onClick={() => setSelectedReasoning(rec)}
                    className="text-center w-full max-w-xs truncate text-[#FF8A00] px-4 py-2 rounded-lg hover:bg-[#2c3a4d] transition-colors disabled:opacity-50"
                    >
                    View Evaluation
                </button>

                </td>
                <td className="px-6 py-4 text-gray-800 flex items-center">
                  <FiStar className="mr-2 text-[#FF8A00]" />
                  {rec.score.toFixed(1)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedCvLink(rec.cv_link);
                      setShowCvPopup(true);
                      setIsPdfLoading(true);
                    }}
                    className="flex items-center text-secondary hover:text-[#FF6A00] transition-colors"
                  >
                    <FiFileText className="mr-2" />
                    View CV
                  </button>
                </td>
                <td className="pr-8 pl-6 py-4">
                <button
                    onClick={() => handleInviteClick(rec)}
                    disabled={invitedRecommendations.has(rec._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                        invitedRecommendations.has(rec._id)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-[#FF8A00] text-white hover:bg-[#e07c00]'
                    }`}
                    >
                    {invitedRecommendations.has(rec._id) ? 'Invitation Sent!' : 'Invite to Apply'}
                    </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reasoning Modal */}
      {selectedReasoning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#364957]">
                Evaluation Reasoning for {selectedReasoning.full_name}
              </h3>
              <button
                onClick={() => setSelectedReasoning(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              {Array.isArray(selectedReasoning.reasoning) && selectedReasoning.reasoning.map((criterion: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg border border-[#364957]/20"
                >
                  <div className="flex items-center gap-2 text-[#364957] mb-3">
                    <span className="font-medium">{criterion.criterion}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                      <FiCheckCircle className="w-4 h-4" />
                      <span>Supporting Evidence</span>
                    </div>
                    {Array.isArray(criterion.evidence) && criterion.evidence.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {criterion.evidence.map((item: string, i: number) => (
                          <li key={i} className="text-[#364957]/80">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#364957]/60 italic">
                        No supporting evidence found
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                      <FiAlertTriangle className="w-4 h-4" />
                      <span>Missing Elements</span>
                    </div>
                    {Array.isArray(criterion.missing_elements) && criterion.missing_elements.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {criterion.missing_elements.map((item: string, i: number) => (
                          <li key={i} className="text-[#364957]/80">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#364957]/60 italic">
                        All required elements present
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CV Popup */}
      {showCvPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 relative max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Candidate CV</h3>
              <button
                onClick={() => setShowCvPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span style={{fontSize: 24}}>&times;</span>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto">
                <iframe
                src={selectedCvLink}
                className="w-full h-full border-0"
                onLoad={() => setIsPdfLoading(false)}
                title="CV Preview"
                ></iframe>
              {isPdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <a
                href={selectedCvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
              >
                <FiFileText className="mr-2" />
                Download CV
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}