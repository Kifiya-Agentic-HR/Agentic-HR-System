// src/components/site-footer.tsx
import KifiyaLogoWhite from '@/components/kifiya-logo-white'

export default function SiteFooter() {
  return (
    <footer className="bg-[#364957] text-white mt-12 py-8">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-start">
          <KifiyaLogoWhite className="h-16 w-auto text-white mb-4" />
          <p className="text-sm">
            Empowering Financial Innovation
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-sm">info@kifiyatech.com</p>
          <p className="text-sm">+251 912 345 678</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold mb-2">Address</h3>
          <p className="text-sm">
            Bole Road
            <br />
            Addis Ababa, Ethiopia
          </p>
        </div>
      </div>
      
      <div className="container mt-8 pt-8 border-t border-primary/30">
        <p className="text-center text-sm">
          © 2024 Kifiya Financial Technologies. All rights reserved.
        </p>
      </div>
    </footer>
  )
}