"use client";

import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

export default function ProblemEditor({ problemId }: {problemId: string;}) {
  const [code, setCode] = useState(`// Write your solution for Problem #${problemId}\n`);

  const handleRun = () => {
    alert("Running code:\n\n" + code);
  };

  const handleSubmit = () => {
    alert("Submitting solution:\n\n" + code);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <CodeMirror
        value={code}
        height="300px"
        theme={oneDark}
        extensions={[javascript()]}
        onChange={(value) => setCode(value)}
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          onClick={handleRun}
        >
          Run
        </button>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
