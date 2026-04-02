type SwapSummaryProps = {
  fromToken: string;
  toToken: string;
  rateText: string;
  priceUrl: string;
};

export default function SwapSummary({
  fromToken,
  toToken,
  rateText,
  priceUrl,
}: SwapSummaryProps) {
  return (
    <div className="summary">
      <div className="summary-row">
        <span>Rate</span>
        <span>
          1 {fromToken} = {rateText} {toToken}
        </span>
      </div>

      <div className="summary-row">
        <div className="link-row">
          <a
            href={priceUrl}
            target="_blank"
            rel="noreferrer"
            className="price-link"
          >
            Price Link
          </a>
        </div>
      </div>
    </div>
  );
}
