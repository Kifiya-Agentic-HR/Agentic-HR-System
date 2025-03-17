"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Code } from "lucide-react";

export default function TopBar() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="topbar flex items-center justify-between px-6 py-3 
                    bg-white dark:bg-[#1e1e1e] border-b border-gray-300 dark:border-gray-700
                    transition-all shadow-md z-50">
      
      <div className="flex items-center gap-6">
        <img
          src={isDarkMode ? "/logo.svg" : "https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"}
          alt="Kifiya Logo"
          className="h-10 transition-all object-contain"
        />
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-gray-900 dark:text-white" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Technical Interview
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          ⏳ {formatTime(timeLeft)}
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 
                     bg-gray-300 dark:bg-gray-500 
                     text-gray-900 dark:text-white 
                     border border-gray-400 dark:border-gray-600 
                     rounded-md shadow-md transition 
                     hover:bg-gray-400 dark:hover:bg-gray-700"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
