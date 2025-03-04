"use-client";

// src/components/site-header.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import KifiyaLogo from '@/components/kifiya-logo'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between bg-white/80">
        <Link href="/" className="flex items-center gap-3">
          <KifiyaLogo className="h-12 w-auto text-primary" />
          <span className="text-xl font-semibold text-primary">
          Careers
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Button
            asChild
           // variant="outline"
            className="border-secondary/30 text-secondary hover:bg-secondary/5"
          >
          </Button>
        </nav>
      </div>
    </header>
  )
}