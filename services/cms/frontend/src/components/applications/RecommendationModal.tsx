// components/RecommendationModal.tsx
"use client";

import { Recommendation } from "@/components/jobs/types";
import { FiBriefcase, FiMapPin, FiClock, FiCheckCircle } from "react-icons/fi";

interface RecommendationModalProps {
  recommendations: Recommendation[] | null;
  recommendationError: string | null;
  onClose: () => void;
}

export default function RecommendationModal({
  recommendations,
  recommendationError,
  onClose,
}: RecommendationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-primary flex items-center">
            <FiBriefcase className="mr-3 text-[#FF8A00]" />
            Recommended Positions
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-primary p-1 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {recommendationError ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">
            {recommendationError}
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations?.map((rec, index) => (
              <div
                key={index}
                className="bg-[#FFF7F0] rounded-xl p-5 border border-[#FFE8D5]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-semibold text-primary mb-2">
                      {rec.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiMapPin className="mr-2 text-[#FF8A00]" />
                        {rec.location}
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2 text-[#FF8A00]" />
                        {rec.type.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-primary">
                  <FiCheckCircle className="text-[#FF8A00]" />
                  <span className="font-medium">Reason:</span>
                  <p className="text-gray-600">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No matching positions found
          </div>
        )}
      </div>
    </div>
  );
}
