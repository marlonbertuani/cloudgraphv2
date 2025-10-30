// ---------- src/components/SectionCard.tsx ----------
import React from 'react'

export default function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border">
      {children}
    </div>
  )
}