import { SparkleIcon } from "@phosphor-icons/react"

interface QuoteStripProps {
  label: string
}

export function QuoteStrip({ label }: QuoteStripProps) {
  return (
    <div className="quote-strip" aria-live="polite">
      <SparkleIcon aria-hidden size={18} weight="fill" />
      <span>{label}</span>
    </div>
  )
}
