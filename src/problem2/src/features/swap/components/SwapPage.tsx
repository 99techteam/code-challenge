import { SwapPanel } from "./SwapPanel"

import "../styles/swap.css"

const trustSignals = [
  { label: "Quote model", value: "Live from local prices" },
  { label: "Interaction", value: "Editable in one view" },
  { label: "Review", value: "Rate visible before swap" },
]

const details = [
  {
    title: "Focused scope",
    description: "Core swap actions stay in one compact surface.",
  },
  {
    title: "Design pattern",
    description: "White canvas, quiet chrome, blue primary action.",
  },
  {
    title: "UX baseline",
    description: "Accessible labels, disabled states, and inline feedback.",
  },
]

export function SwapPage() {
  return (
    <>
      <section className="swap-stage" id="swap">
        <div className="swap-copy">
          <p className="eyebrow">Token exchange</p>
          <h1>Convert digital currencies with a clearer quote flow.</h1>
          <p className="swap-copy__lead">
            Select a pair, enter an amount, and review the rate before the
            simulated swap is submitted.
          </p>

          <dl className="trust-grid" aria-label="Swap capabilities">
            {trustSignals.map((item) => (
              <div key={item.label} className="trust-grid__item">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <SwapPanel />
      </section>

      <section className="detail-band" id="details" aria-label="Assignment details">
        {details.map((detail) => (
          <div key={detail.title}>
            <span>{detail.title}</span>
            <p>{detail.description}</p>
          </div>
        ))}
      </section>
    </>
  )
}
