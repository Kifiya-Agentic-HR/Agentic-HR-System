"use client";

import { RecommendationResponse } from "@/components/jobs/types";
import Link from "next/link";
import { FiCalendar, FiFileText, FiStar, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { useState } from "react";

interface RecommendationTableProps {
  recommendations: RecommendationResponse[];
}

export default function RecommendationTable({
  recommendations,
}: RecommendationTableProps) {
  const [selectedReasoning, setSelectedReasoning] = useState<RecommendationResponse | null>(null);
  const [invitedRecommendations, setInvitedRecommendations] = useState<Set<string>>(new Set());

  const handleInviteClick = (recommendationId: string) => {
    setInvitedRecommendations(prev => new Set(prev.add(recommendationId)));
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
                  <Link
                    href={rec.cv_link}
                    className="flex items-center text-secondary"
                  >
                    <FiFileText className="mr-2" />
                    View CV
                  </Link>
                </td>
                <td className="pr-8 pl-6 py-4">
                <button
                    onClick={() => handleInviteClick(rec._id)}
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
              {selectedReasoning.reasoning.map((criterion, index) => (
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
                    {criterion.evidence?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {criterion.evidence.map((item, i) => (
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
                    {criterion.missing_elements?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {criterion.missing_elements.map((item, i) => (
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
    </div>
  );
}