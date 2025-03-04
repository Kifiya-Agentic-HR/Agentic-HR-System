import React from "react";
import StatusBadge from "./StatusBadge"; // ✅ Correct import
import { Button } from "./Button"; // Ensure this import is also correct

export const ResultModal = ({
  title,
  status,
  reasoning,
  onClose,
}: {
  title: string;
  status: string;
  reasoning: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-background p-6 rounded-lg max-w-md w-full">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Status:</label>
          <StatusBadge status={status} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Details:</label>
          <p className="mt-1 text-sm">{reasoning || "No details available"}</p>
        </div>
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  </div>
);
