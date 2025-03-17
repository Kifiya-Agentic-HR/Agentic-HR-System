import React from "react";
import ProblemDescription from "@/components/ProblemDescription";
import ProblemEditor from "@/components/ProblemEditor";

export default function Page({
  params,
}: {
  params: { problemId: string };
}) {  return (
    <div className="leetcode-container flex flex-col lg:flex-row w-full h-screen">
      <div className="mt-16 flex flex-col lg:flex-row w-full h-full">
        {/* Problem Description (left half) */}
        <div className="w-full lg:w-1/2 border-b lg:border-r border-gray-300 dark:border-gray-700 p-4">
          <ProblemDescription problemId={params.problemId} />
        </div>

        {/* Code Editor (right half) */}
        <div className="w-full lg:w-1/2 p-4">
          <ProblemEditor problemId={params.problemId} />
        </div>
      </div>
    </div>
  );
}
