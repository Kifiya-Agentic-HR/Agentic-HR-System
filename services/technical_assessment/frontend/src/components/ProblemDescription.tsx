"use client";

import React, { useEffect, useState } from "react";

export default function ProblemDescription({ problemId }: {problemId: string}) {
  const [problemTitle, setProblemTitle] = useState("Loading...");
  const [description, setDescription] = useState("...");

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setProblemTitle(`Sample Problem #${problemId}`);
      setDescription(`
        This is a sample problem description for problem ID: ${problemId}.
        Write a function that returns the sum of two numbers.
      `);
    }, 1000);
  }, [problemId]);

  return (
    <div className="problemdescription p-4 rounded-lg shadow-md transition-all">
      <h2
        className="
          text-2xl font-bold pb-2
          underline underline-offset-8
          decoration-orange-500 dark:decoration-white
        "
      >
        {problemTitle}
      </h2>

      <p className="text-gray-900 dark:text-white mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
