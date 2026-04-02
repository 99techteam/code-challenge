type SwapModalRow = {
  label: string;
  value: string;
};

type SwapModalProps = {
  eyebrow: string;
  title: string;
  description?: string;
  rows: SwapModalRow[];
  primaryText: string;
  secondaryText?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  completed?: boolean;
};

export default function SwapModal({
  eyebrow,
  title,
  description,
  rows,
  primaryText,
  secondaryText,
  onPrimaryClick,
  onSecondaryClick,
  primaryDisabled = false,
  secondaryDisabled = false,
  completed = false,
}: SwapModalProps) {
  return (
    <div className="modal-overlay">
      <div className={`modal-card ${completed ? "completed" : ""}`}>
        {completed && <div className="success-badge">✓</div>}

        <p className="modal-eyebrow">{eyebrow}</p>
        <h2 className="modal-title">{title}</h2>
        {description && <p className="modal-description">{description}</p>}

        <div className="modal-summary">
          {rows.map((row) => (
            <div className="modal-summary-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>

        <div className={`modal-actions ${secondaryText ? "" : "single"}`}>
          {secondaryText && (
            <button
              type="button"
              className="modal-secondary-button"
              onClick={onSecondaryClick}
              disabled={secondaryDisabled}
            >
              {secondaryText}
            </button>
          )}

          <button
            type="button"
            className="modal-primary-button"
            onClick={onPrimaryClick}
            disabled={primaryDisabled}
          >
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  );
}
