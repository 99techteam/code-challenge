import Task from '../../components/Task'
import WalletPage from './wallet_page'
import refactoredPreview from './problem3_refactored.png'

const ORIGINAL_CODE = `interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':  return 100
      case 'Ethereum': return 50
      case 'Arbitrum': return 30
      case 'Zilliqa':  return 20
      case 'Neo':      return 20
      default:         return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      if (lhsPriority > -99) {         // ❌ bug: lhsPriority is undefined
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      // ❌ missing: no return for equal priorities (undefined)
    });
  }, [balances, prices]);  // ❌ prices not used inside — spurious dependency

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()  // ❌ toFixed() → no decimal precision
    }
  })  // ❌ formattedBalances computed but never used in rows

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // ❌ iterating sortedBalances (WalletBalance), typed as FormattedWalletBalance
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index}            // ❌ array index as key — unstable on re-sort
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}  // ❌ .formatted does not exist on WalletBalance
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}`

export default function Problem3() {
  return (
    <div className='problem-content'>
      {/* ── Task statement ─────────────────────────────────────────────── */}
      <Task title='Problem 3 — Messy React'>
        <p>
          List out the computational inefficiencies and anti-patterns found in
          the code block below.
        </p>
        <ol>
          <li>
            This code block uses:
            <ol type='a'>
              <li>ReactJS with TypeScript.</li>
              <li>Functional components.</li>
              <li>React Hooks.</li>
            </ol>
          </li>
          <li>
            You should also provide a refactored version of the code, but more
            points are awarded to accurately stating the issues and explaining
            correctly how to improve them.
          </li>
        </ol>
        <pre>
          <code>{ORIGINAL_CODE}</code>
        </pre>
      </Task>

      {/* ── Solution preview ───────────────────────────────────────────── */}
      <div className='mb-8 max-w-lg'>
        <h3 className='m-0 mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-h)]'>
          Solution Preview
        </h3>
        <img
          src={refactoredPreview}
          alt='Problem 3 refactored solution'
          className='w-full rounded-xl border border-[var(--border)] shadow-[var(--shadow)]'
        />
      </div>

      {/* ── Refactored output ──────────────────────────────────────────── */}
      <WalletPage />
    </div>
  )
}
