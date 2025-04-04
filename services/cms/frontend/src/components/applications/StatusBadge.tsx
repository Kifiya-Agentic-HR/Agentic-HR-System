"use client";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    hired: "bg-[#4CAF50]/10 text-[#4CAF50]",
    rejected: "bg-[#F44336]/10 text-[#F44336]",
    pending: "bg-primary/10 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
        statusStyles[status as keyof typeof statusStyles] ||
        statusStyles.pending
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
