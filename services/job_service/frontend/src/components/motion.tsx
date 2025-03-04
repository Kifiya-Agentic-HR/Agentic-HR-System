// src/components/motion.tsx
'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'

export function Motion({ children, ...props }: any) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div {...props}>{children}</m.div>
    </LazyMotion>
  )
}