interface SwapSummaryProps {
  estimatedValue: string
}

const summaryRows = [
  { label: "Network fee", value: "Included" },
  { label: "Settlement", value: "Preview only" },
]

export function SwapSummary({ estimatedValue }: SwapSummaryProps) {
  return (
    <dl className="swap-summary" aria-label="Quote summary">
      <div>
        <dt>Estimated value</dt>
        <dd>{estimatedValue}</dd>
      </div>
      {summaryRows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
