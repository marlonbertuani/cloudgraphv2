// ---------- src/components/ExportButton.tsx ----------
import React from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function ExportButton({ rootRef }: { rootRef: React.RefObject<HTMLElement | null> }) {
  const handleExport = async () => {
    const el = document.getElementById('report-root') as HTMLElement | null
    if (!el) return

    // Use html2canvas to capture
    const canvas = await html2canvas(el, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')

    const imgProps = (pdf as any).getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('relatorio-tripla.pdf')
  }

  return (
    <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow text-sm">Exportar PDF</button>
  )
}