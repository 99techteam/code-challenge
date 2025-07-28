import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import {
    Container,
    Title,
    SwapCard,
    InputGroup,
    Label,
    InputContainer,
    Select,
    Input,
    SwapButtonContainer,
    SwapButton,
    ErrorMessage,
    LoadingSpinner,
    OutputInfo,
    OutputText,
    LoadingContainer,
    LoadingText,
    SwapIcon
} from './swap.styled';
import { TokenData, TradeType, ValidationErrors } from 'types/swap';

const SwapForm: React.FC = () => {
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sourceToken, setSourceToken] = useState<string>('');
    const [targetToken, setTargetToken] = useState<string>('');
    const [sourceAmount, setSourceAmount] = useState<string>('');
    const [targetAmount, setTargetAmount] = useState<string>('');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [calculating, setCalculating] = useState<boolean>(false);
    const [tradeType, setTradeType] = useState<TradeType>('EXACT_INPUT');

    // Create token lookup map for O(1) access
    const tokenMap = useMemo(() => {
        return tokens.reduce((acc, token) => {
            acc[token.currency] = token;
            return acc;
        }, {} as Record<string, TokenData>);
    }, [tokens]);

    // Fetch token data
    useEffect(() => {
        fetchTokens();
    }, []);

    // Debounced calculation effect for input amount (EXACT_INPUT)
    useEffect(() => {
        if (tradeType !== 'EXACT_INPUT') return;
        
        if (!sourceAmount || !sourceToken || !targetToken) {
            setTargetAmount('');
            setCalculating(false);
            return;
        }

        setCalculating(true);

        const delayDebounceFn = setTimeout(() => {
            const sourceTokenData = tokenMap[sourceToken];
            const targetTokenData = tokenMap[targetToken];

            if (!sourceTokenData || !targetTokenData) {
                setTargetAmount('');
                setCalculating(false);
                return;
            }

            const exchangeRate = sourceTokenData.price / targetTokenData.price;
            const converted = parseFloat(sourceAmount) * exchangeRate;
            setTargetAmount(converted.toFixed(6));
            setCalculating(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [sourceAmount, sourceToken, targetToken, tokenMap, tradeType]);

    // Debounced calculation effect for output amount (EXACT_OUTPUT)
    useEffect(() => {
        if (tradeType !== 'EXACT_OUTPUT') return;
        
        if (!targetAmount || !sourceToken || !targetToken) {
            setSourceAmount('');
            setCalculating(false);
            return;
        }

        setCalculating(true);

        const delayDebounceFn = setTimeout(() => {
            const sourceTokenData = tokenMap[sourceToken];
            const targetTokenData = tokenMap[targetToken];

            if (!sourceTokenData || !targetTokenData) {
                setSourceAmount('');
                setCalculating(false);
                return;
            }

            const exchangeRate = targetTokenData.price / sourceTokenData.price;
            const converted = parseFloat(targetAmount) * exchangeRate;
            setSourceAmount(converted.toFixed(6));
            setCalculating(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [targetAmount, sourceToken, targetToken, tokenMap, tradeType]);

    const fetchTokens = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch('https://interview.switcheo.com/prices.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TokenData[] = await response.json();

            // Filter tokens with prices and remove duplicates
            const tokensWithPrices = data
                .filter((item: TokenData) => item.price && item.price > 0)
                .reduce((acc: TokenData[], current: TokenData) => {
                    const existing = acc.find(item => item.currency === current.currency);
                    if (!existing || new Date(current.date) > new Date(existing.date)) {
                        return [...acc.filter(item => item.currency !== current.currency), current];
                    }
                    return acc;
                }, [])
                .sort((a: TokenData, b: TokenData) => a.currency.localeCompare(b.currency));

            setTokens(tokensWithPrices);
        } catch (error) {
            console.error('Error fetching tokens:', error);
            setErrors({ api: 'Failed to load token data' });
        } finally {
            setLoading(false);
        }
    };

    // Calculate exchange rate for display
    const exchangeRate = useMemo(() => {
        if (!sourceToken || !targetToken) return null;

        const sourceTokenData = tokenMap[sourceToken];
        const targetTokenData = tokenMap[targetToken];

        if (!sourceTokenData || !targetTokenData) return null;

        return sourceTokenData.price / targetTokenData.price;
    }, [sourceToken, targetToken, tokenMap]);

    // Validation with useMemo
    const validationErrors = useMemo((): ValidationErrors => {
        const newErrors: ValidationErrors = {};

        if (!sourceToken) {
            newErrors.sourceToken = 'Please select a source token';
        }

        if (!targetToken) {
            newErrors.targetToken = 'Please select a target token';
        }

        if (sourceToken === targetToken && sourceToken && targetToken) {
            newErrors.sameToken = 'Source and target tokens must be different';
        }

        if (tradeType === 'EXACT_INPUT') {
            if (!sourceAmount) {
                newErrors.sourceAmount = 'Please enter an amount';
            } else if (isNaN(parseFloat(sourceAmount)) || parseFloat(sourceAmount) <= 0) {
                newErrors.sourceAmount = 'Please enter a valid positive number';
            }
        } else {
            if (!targetAmount) {
                newErrors.targetAmount = 'Please enter an amount';
            } else if (isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
                newErrors.targetAmount = 'Please enter a valid positive number';
            }
        }

        return newErrors;
    }, [sourceToken, targetToken, sourceAmount, targetAmount, tradeType]);

    // Update errors when validation changes
    useEffect(() => {
        setErrors(validationErrors);
    }, [validationErrors]);

    // Handle input changes with useCallback
    const handleSourceAmountChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setSourceAmount(value);
            setTradeType('EXACT_INPUT');
        }
    }, []);

    const handleTargetAmountChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setTargetAmount(value);
            setTradeType('EXACT_OUTPUT');
        }
    }, []);

    const handleSourceTokenChange = useCallback((e: ChangeEvent<HTMLSelectElement>): void => {
        setSourceToken(e.target.value);
    }, []);

    const handleTargetTokenChange = useCallback((e: ChangeEvent<HTMLSelectElement>): void => {
        setTargetToken(e.target.value);
    }, []);

    // Swap tokens with useCallback
    const handleSwap = useCallback((): void => {
        const tempToken = sourceToken;
        const tempAmount = sourceAmount;
        const tempTargetAmount = targetAmount;

        setSourceToken(targetToken);
        setTargetToken(tempToken);
        setSourceAmount(tempTargetAmount);
        setTargetAmount(tempAmount);
        
        // Swap trade type as well
        setTradeType(tradeType === 'EXACT_INPUT' ? 'EXACT_OUTPUT' : 'EXACT_INPUT');
        setCalculating(false);
    }, [sourceToken, targetToken, sourceAmount, targetAmount, tradeType]);

    // Handle form submission
    const handleSubmit = useCallback((): void => {
        if (Object.keys(validationErrors).length === 0) {
            if (tradeType === 'EXACT_INPUT') {
                alert(`Swap ${sourceAmount} ${sourceToken} for approximately ${targetAmount} ${targetToken}`);
            } else {
                alert(`Swap approximately ${sourceAmount} ${sourceToken} for exactly ${targetAmount} ${targetToken}`);
            }
        }
    }, [validationErrors, sourceAmount, sourceToken, targetAmount, targetToken, tradeType]);

    if (loading) {
        return (
            <Container>
                <Title>Token Swap</Title>
                <SwapCard>
                    <LoadingContainer>
                        <LoadingSpinner size="32px" />
                        <LoadingText>Loading tokens...</LoadingText>
                    </LoadingContainer>
                </SwapCard>
            </Container>
        );
    }

    return (
        <Container>
            <Title>Token Swap</Title>
            <SwapCard>
                <div>
                    {/* Source Token */}
                    <InputGroup>
                        <Label>From</Label>
                        <InputContainer>
                            <Select
                                value={sourceToken}
                                onChange={handleSourceTokenChange}
                                hasError={!!(errors.sourceToken || errors.sameToken)}
                            >
                                <option value="">Select token</option>
                                {tokens.map((token: TokenData) => (
                                    <option key={token.currency} value={token.currency}>
                                        {token.currency}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                type="text"
                                placeholder="0.0"
                                value={
                                    tradeType === 'EXACT_OUTPUT' && calculating 
                                        ? 'Calculating...' 
                                        : sourceAmount
                                }
                                onChange={handleSourceAmountChange}
                                hasError={!!errors.sourceAmount}
                                readOnly={tradeType === 'EXACT_OUTPUT' && calculating}
                            />
                            {tradeType === 'EXACT_OUTPUT' && calculating && <LoadingSpinner />}
                        </InputContainer>
                        {errors.sourceToken && <ErrorMessage>{errors.sourceToken}</ErrorMessage>}
                        {errors.sourceAmount && <ErrorMessage>{errors.sourceAmount}</ErrorMessage>}
                    </InputGroup>

                    {/* Swap Button */}
                    <SwapButtonContainer>
                        <SwapIcon type="button" onClick={handleSwap}>
                            ⇅
                        </SwapIcon>
                    </SwapButtonContainer>

                    {/* Target Token */}
                    <InputGroup>
                        <Label>To</Label>
                        <InputContainer>
                            <Select
                                value={targetToken}
                                onChange={handleTargetTokenChange}
                                hasError={!!(errors.targetToken || errors.sameToken)}
                            >
                                <option value="">Select token</option>
                                {tokens.map((token: TokenData) => (
                                    <option key={token.currency} value={token.currency}>
                                        {token.currency}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                type="text"
                                placeholder="0.0"
                                value={
                                    tradeType === 'EXACT_INPUT' && calculating 
                                        ? 'Calculating...' 
                                        : targetAmount
                                }
                                onChange={handleTargetAmountChange}
                                hasError={!!errors.targetAmount}
                                readOnly={tradeType === 'EXACT_INPUT' && calculating}
                            />
                            {tradeType === 'EXACT_INPUT' && calculating && <LoadingSpinner />}
                        </InputContainer>
                        {errors.targetToken && <ErrorMessage>{errors.targetToken}</ErrorMessage>}
                        {errors.targetAmount && <ErrorMessage>{errors.targetAmount}</ErrorMessage>}
                        {errors.sameToken && <ErrorMessage>{errors.sameToken}</ErrorMessage>}
                    </InputGroup>

                    {/* Conversion Info */}
                    {sourceToken && targetToken && sourceAmount && targetAmount && !errors.sameToken && exchangeRate && (
                        <OutputInfo>
                            <OutputText>Exchange Rate</OutputText>
                            <OutputText highlight style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                            }}>
                                <span style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.25rem' 
                                }}>
                                    1
                                    <img 
                                        src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${sourceToken}.svg`}
                                        alt={sourceToken}
                                        style={{ 
                                            width: '16px', 
                                            height: '16px',
                                            borderRadius: '50%'
                                        }}
                                        onError={(e) => {
                                            // Fallback to hide icon if it doesn't exist
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    {sourceToken}
                                </span>
                                =
                                <span style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.25rem' 
                                }}>
                                    {exchangeRate.toFixed(6)}
                                    <img 
                                        src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${targetToken}.svg`}
                                        alt={targetToken}
                                        style={{ 
                                            width: '16px', 
                                            height: '16px',
                                            borderRadius: '50%'
                                        }}
                                        onError={(e) => {
                                            // Fallback to hide icon if it doesn't exist
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    {targetToken}
                                </span>
                            </OutputText>
                        </OutputInfo>
                    )}

                    {errors.api && <ErrorMessage>{errors.api}</ErrorMessage>}

                    {/* Submit Button */}
                    {sourceAmount && targetAmount && Object.keys(validationErrors).length === 0 && (
                        <SwapButtonContainer>
                            <SwapButton 
                                type="button" 
                                onClick={handleSubmit}
                            >
                                Execute Swap
                            </SwapButton>
                        </SwapButtonContainer>
                    )}
                </div>
            </SwapCard>
        </Container>
    );
};

export default SwapForm;