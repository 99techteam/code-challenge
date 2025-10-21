// missing hooks and libraries imports
import React, { useMemo } from "react";
import { useWalletBalances } from "./hooks/useWalletBalances";
import { usePrices } from "./hooks/usePrices";

// we can also move the WalletBalance and FormattedWalleetBalance types into a file specifically for declaring types instead
// for cleaner code
export interface WalletBalance {
  // the WalletBalance type is missing the blockchain attribute
  blockchain: string;
  currency: string;
  amount: number;
}

// down below i see that fotmattedBalance variable has these 4 attributes 
// formatted: string;
// blockchain: string;
// currency: string;
// amount: number;
// so instead of declaring a type with the same attribute with WalletBalance with the exception of the formatted field 
// we can just extends WalletBalance from FormattedWalletBalance for cleaner code
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// missing box props 
// seem to contain React.ButtonHTMLAttributes<HTMLDivElement> props
type BoxProps = React.ButtonHTMLAttributes<HTMLDivElement>
// React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

interface Props extends BoxProps {
  // missing props attributes 
  children: React.ReactNode
}

// forgot to export the WalletPage component to render the page or use in other files as component
export const WalletPage: React.FC<Props> = ({ children, ...rest }: Props) => {
  // unnecessary destructuring. we can do that in the function props instead
  // const { children, ...rest } = props;
  // missing balances and prices hooks (i assumed this is a hook for fetching data from an API)
  // balances has a data type of WalletBalance array
  const balances: WalletBalance[] = useWalletBalances();
  // prices also has a data type of Record<string,number>
  const prices: Record<string, number> = usePrices();

  // getPriority doesnt have any state variable or variable wrapped by useMemo so we can move it even outside of the
  // functional component to a utility file instead for cleaner code
  // also enforce type on blockchain variable instead of any to ensure type safety
  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }

  // enforce typeeeeee i cant stand seeing a variable without declaring a type for it XD
  const sortedBalances: WalletBalance[] = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // the lhsPriority variable isn't even initialize but the balancePriority is initialized and not used.
      // so we can replace lhsPriority with balancePriority 
      if (balancePriority > -99) {
        // im pretty sure that crypto wallet amount cannot be less than 0
        if (balance.amount >= 0) {
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      // if the first argument is less than the second argument it should return a negative value
      // (it's literally from MDN web docs or you can just look at the sort function description in lib.es5.d.ts)
      if (leftPriority < rightPriority) {
        return -1;
        // the opposite also apply
      } else if (leftPriority > rightPriority) {
        return 1
      }
      // The sort() method expects a comparator function that takes two arguments of type WalletBalance and always returns a WalletBalance
      // this is TypeScript type safety check, It returns -1 and 1 in 2 condition checks but implicitly returns undefined in all other cases.
      // if both value are equal then we also have to return 0 outside the conditional checks
      return 0
    });
    // the prices variable isn't used in sortedBalances computation so we don't need to add it to the  
    // dependency array to avoid unnecessary computation if it changes every time
  }, [balances]);


  // should be wrapped in useMemo to avoid unecessary computation when sortedBalances variable change
  // enforce type also
  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      return {
        ...balance,
        formatted: balance.amount.toFixed()
      }
    })
  }, [sortedBalances])

  // we should use the formattedBalances variable for rendering instead of sortedBalances variable 
  // since we also need the formatted attribute as prop for each WalletRow component and the balance item 
  // inside already has FormattedWalletBalance type
  const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      // where is the WalletRow component go?
      <WalletRow
        // classes.row is undefined idk what to do yet
        className={''}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })
  console.log(sortedBalances)
  return (
    <div {...rest}>
      {rows}
      {/* use children */}
      {children}
    </div>
  )
}

interface WalletRowProps {
  className: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

const WalletRow = (props: WalletRowProps) => {
  return <>{JSON.stringify(props)}</>
}

// thanks you for reading my ramblings XD