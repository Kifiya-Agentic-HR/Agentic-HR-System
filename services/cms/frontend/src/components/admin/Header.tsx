"use client"; 

import Image from "next/image";

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 border-b bg-white z-10">
      <div className="flex items-center h-full px-6">
        <Image
          src="/logo.svg"
          alt="Company Logo"
          width={40}
          height={40}
          className="mr-4"
        />
        <h1 className="text-2xl font-bold text-primary">HR Admin System</h1>
      </div>
    </header>
  );
}
