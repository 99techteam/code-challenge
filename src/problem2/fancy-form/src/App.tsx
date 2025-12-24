import { useMemo, useState } from "react";
import "./App.css";
import styles from "./App.module.css";
import { Rate, RATES } from "./rates";
import type { RateEntry } from "./rates";
import CurrencySelect from "./CurrencySelect";

function getLatestRate(currency: Rate) {
  const matches = RATES.filter((r) => r.currency === currency);
  if (!matches.length) return null;
  return matches.reduce((a, b) =>
    new Date(a.date) > new Date(b.date) ? a : b
  );
}

function App() {
  const currencies = useMemo(
    () => Array.from(new Set(RATES.map((r) => r.currency))),
    []
  );
  const [amount, setAmount] = useState<string>("");
  const [selected, setSelected] = useState<Rate>(currencies[0]);
  const [selectedOut, setSelectedOut] = useState<Rate>(currencies[0]);

  const latestSend = getLatestRate(selected) as RateEntry | null;
  const latestOut = getLatestRate(selectedOut) as RateEntry | null;

  // compute output: amount_in_send * price_send(USD) / price_out(USD) => amount_in_out
  const outputValue = useMemo(() => {
    const n = parseFloat(amount as string);
    if (Number.isNaN(n)) return null;
    if (!latestSend || !latestOut) return null;
    return (n * latestSend.price) / latestOut.price;
  }, [amount, latestSend, latestOut]);

  const formattedOutput =
    outputValue == null
      ? "N/A"
      : new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(
          outputValue
        );

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <h5>Swap</h5>

      <label className={styles.label} htmlFor="input-amount">Amount to send</label>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          id="input-amount"
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className={styles.currencyPickerFixed}>
          <CurrencySelect
            id="receive-currency"
            currencies={currencies as Rate[]}
            selected={selected}
            onSelect={(r) => setSelected(r)}
          />
        </div>
      </div>

      <label className={styles.label} htmlFor="output-amount">Amount to receive</label>
      <div className={styles.inputRow}>
        <input className={styles.input} id="output-amount" readOnly value={formattedOutput} />

        <div className={styles.currencyPickerFixed}>
          <CurrencySelect
            id="output-currency"
            currencies={currencies as Rate[]}
            selected={selectedOut}
            onSelect={(r) => setSelectedOut(r)}
          />
        </div>
      </div>

      <button className={styles.button}>CONFIRM SWAP</button>
    </form>
  );
}

export default App;
