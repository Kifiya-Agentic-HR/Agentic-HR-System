import { getMe, updateShortlist } from "@/lib/api";
import { Application } from "../jobs/types";
import { useState } from "react";
import { FiThumbsUp } from "react-icons/fi";

interface ShortlistPopupProps {
  application: Application; 
  currentUser: string; // Added currentUser prop for alignment
  onClose: () => void;
  refreshApplications: () => Promise<void>;
}

export default function ShortlistPopup({
  application,
  currentUser,
  onClose,
  refreshApplications,
}: ShortlistPopupProps) {
  const [note, setNote] = useState('');
  const [isShortlisted, setIsShortlisted] = useState(application.shortlisted ?? false);
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

  console.log("Current User:", currentUser);
  console.log("Application Shortlist Comments:", application.shortlist_comments);
  console.log("Application Shortlisted:", application.shortlisted);

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
                  ? "bg-[#FF6A00] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {application.shortlist_comments && application.shortlist_comments.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {application.shortlist_comments.map((comment, index) => {
                const isCurrentUser = comment.user === currentUser;
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-xl p-3 max-w-[80%] ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{comment.comment}</p>
                      <p className="text-xs mt-1">
                        {isCurrentUser ? 'You' : comment.user} on{' '}
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
            rows={4}
            placeholder="Type your notes..."
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
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}