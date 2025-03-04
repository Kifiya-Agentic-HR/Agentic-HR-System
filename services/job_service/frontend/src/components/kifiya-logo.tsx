"use-client";

import Image from "next/image";

const KifiyaLogo = ({ className }: { className?: string }) => {
  return (
    <Image
      src="/logo.png" 
      alt="Kifiya Logo"
      width={250}
      height={200} 
      className={className}
      priority
    />
  );
};

export default KifiyaLogo;
