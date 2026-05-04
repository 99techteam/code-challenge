1. Logic Errors

    - "lhsPriority"  is undefined, should be "balancePriority"

    - this code below is wrong in logic:
        if (balance.amount <= 0) {
		    return true;
		}

        issues:  the logic is wrong, it should be "balance.amount > 0"
        correct: balance.amount > 0 is right logic
    
    - this code below is wrong in logic:
       rows = sortedBalances.map((balance: FormattedWalletBalance, index: number)) => {}

       issues: rows constant maps over sortedBalances, but the type is declared as FormattedWalletBalance. However, sortedBalances hasn't been formatted yet; that happens in formattedBalances
       correct: 
       rows = formattedBalances.map((balance: FormattedWalletBalance, index: number)) => {}


2. Performance Inefficiencies

    - Unnecessary Dependency, in code below:
          const sortedBalances = useMemo(() => {
            return balances.filter((balance: WalletBalance) => {
               ...
            });
        }, [balances, prices]);

        issues:  useMemo for sortedBalances depends on prices, but prices are never used inside that calculation. This causes the entire list to re-sort whenever price data updates
        correct: Remove prices from the dependency array

    - constant re-declaration of PRIORITY_MAP:  
    
        issues: PRIORITY_MAP is a constant that doesn't change. 
        correct: Declare it outside the component to avoid re-declaring it on every render.    

    - overuse iteration: map over the data three times (filter/sort, then map for formatting, then map for rows)
    
    - Hardcoded Keys: Using index as a key in React is an anti-pattern when the list can be re-sorted or filtered. It leads to UI glitches and poor performance. Use a unique identifier (like currency).



 3. Typescript  Anti-patterns

    - Usage of any
    - Missing Interface Properties: The WalletBalance interface is missing the blockchain property, yet the code attempts to access balance.blockchain
