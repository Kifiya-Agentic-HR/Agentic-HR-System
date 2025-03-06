"use-client";

import Image from "next/image";

const KifiyaLogoWhite = ({ className }: { className?: string }) => {
  return (
    <Image
      src="/Logo(white).svg" 

    
      alt="Kifiya Logo"
      width={250} 
      height={200}
      className={className}
      priority
    />
  );
};

export default KifiyaLogoWhite;
