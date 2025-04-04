// components/applications/ShortlistPopup.tsx
"use client";

import { useState } from "react";
import { Application } from "@/components/jobs/types";
import { updateShortlist } from "@/lib/api";
import { FiThumbsUp } from "react-icons/fi";

interface ShortlistPopupProps {
  application: Application;
  onClose: () => void;
  refreshApplications: () => Promise<void>;
}

export default function ShortlistPopup({
  application,
  onClose,
  refreshApplications,
}: ShortlistPopupProps) {
  const [note, setNote] = useState(application.shortlist_note || "");
  const [isShortlisted, setIsShortlisted] = useState(
    application.shortlisted ?? false
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const result = await updateShortlist(application._id, {
        shortlisted: isShortlisted,
        shortlist_note: note,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to update shortlist status");
      }
      await refreshApplications();
      onClose();
    } catch (error) {
      console.error("Error updating shortlist status:", error);
      alert("Failed to update shortlist status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
          <FiThumbsUp className="mr-2" />
          Shortlist Candidate
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIsShortlisted(true)}
              className={`flex-1 py-2 rounded-xl ${
                isShortlisted
                  ? "bg-[#4CAF50] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setIsShortlisted(false)}
              className={`flex-1 py-2 rounded-xl ${
                !isShortlisted
                  ? "bg-[#F44336] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
            rows={4}
            placeholder="Add shortlist notes..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#FF6A00] text-white rounded-lg hover:bg-[#FF8A00]"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
