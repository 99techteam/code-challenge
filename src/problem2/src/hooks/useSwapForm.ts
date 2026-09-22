import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useController, useForm, useWatch } from 'react-hook-form';

import { formatAmount, parseAmount, sanitizeAmountInput } from '@/lib/format';
import { exchangeRate } from '@/lib/prices';
import { swapRequestSchema, type SwapRequest } from '@/lib/schema';
import type { SwapSide, Token } from '@/types';

/** Pair the converter opens on when the feed offers it. */
const PREFERRED_PAIR = ['ETH', 'USDC'] as const;
/** Amount the converter opens on, matching the design's resting state. */
const INITIAL_AMOUNT = '1.25';
/**
 * The values the card renders from besides the amount, which has a controller
 * of its own. Kept at module level so `useWatch` sees the same list every render.
 */
const WATCHED_FIELDS = ['fromCode', 'toCode', 'source'] as const;

export interface SwapForm {
  from: Token | null;
  to: Token | null;
  /** What the "From" field shows: raw while focused, grouped otherwise. */
  fromValue: string;
  /** What the "To" field shows. */
  toValue: string;
  /** Validation message for the "From" field, or `null`. */
  fromError: string | null;
  /** Validation message for the "To" field, or `null`. */
  toError: string | null;
  /** How many `to` one `from` buys, or `null` before prices arrive. */
  rate: number | null;
  /** Increments on every swap; the swap button rotates 180° per step. */
  swapCount: number;
  setAmount: (side: SwapSide, raw: string) => void;
  focusField: (side: SwapSide) => void;
  blurField: () => void;
  selectToken: (side: SwapSide, code: string) => void;
  swapSides: () => void;
}

function seedPair(tokens: Token[]): Pick<SwapRequest, 'fromCode' | 'toCode'> {
  const codes = tokens.map((token) => token.code);
  const [preferredFrom, preferredTo] = PREFERRED_PAIR;

  const fromCode = codes.includes(preferredFrom) ? preferredFrom : (codes[0] ?? '');
  const toCode = codes.includes(preferredTo)
    ? preferredTo
    : (codes.find((code) => code !== fromCode) ?? '');

  return { fromCode, toCode };
}

/**
 * The converter's form state, held by react-hook-form.
 *
 * The form's values are the swap request itself, validated by
 * `swapRequestSchema`: two assets, an amount, and `source`, the side that
 * amount was typed into. Only one amount is ever stored; the opposite field is
 * recomputed from the live rate on every render. Keeping one number rather than
 * two is what stops the two fields from drifting apart when prices refresh or
 * assets change.
 *
 * Focus is not part of the request, so it stays in React state. It decides how
 * each field is displayed, and when an empty amount is worth mentioning.
 */
export function useSwapForm(tokens: Token[]): SwapForm {
  const { control, setValue, setValues } = useForm<SwapRequest>({
    defaultValues: { ...seedPair(tokens), source: 'from', amount: INITIAL_AMOUNT },
    resolver: zodResolver(swapRequestSchema),
    // A bad amount is reported as it is typed, not only once the field is left.
    // Nothing is validated before the first edit, so the form opens quiet.
    mode: 'onChange',
  });
  const [fromCode, toCode, source] = useWatch({ control, name: WATCHED_FIELDS });
  const {
    field: { value: amount, onChange: onAmountChange, onBlur: onAmountBlur },
    fieldState: { error: amountIssue },
  } = useController({ control, name: 'amount' });
  const [focused, setFocused] = useState<SwapSide | null>(null);
  const [swapCount, setSwapCount] = useState(0);

  const byCode = useMemo(
    () => new Map(tokens.map((token) => [token.code, token] as const)),
    [tokens],
  );

  // Re-seed whenever the selected pair is not quotable from the current feed —
  // on first load, and if a refresh ever drops an asset.
  useEffect(() => {
    if (tokens.length === 0) return;

    setValues((current) => {
      const stillPriced =
        byCode.has(current.fromCode) &&
        byCode.has(current.toCode) &&
        current.fromCode !== current.toCode;

      return stillPriced ? current : { ...current, ...seedPair(tokens) };
    });
  }, [byCode, setValues, tokens]);

  const from = byCode.get(fromCode) ?? null;
  const to = byCode.get(toCode) ?? null;
  const rate = from && to ? exchangeRate(from, to) : null;

  // The resolver decides what is wrong with the amount; this decides when to
  // say so. An emptied field is work in progress while the cursor is in it.
  const amountError =
    amount.trim() === '' && focused !== null ? null : (amountIssue?.message ?? null);

  /** The numeric value of one side, converting across the pair when needed. */
  const valueOf = useCallback(
    (side: SwapSide): number => {
      const typed = parseAmount(amount);
      if (source === side) return typed;
      if (!from || !to) return 0;

      return source === 'from' ? typed * exchangeRate(from, to) : typed * exchangeRate(to, from);
    },
    [amount, from, source, to],
  );

  /** The string one side renders: raw text while being edited, grouped when not. */
  const displayOf = useCallback(
    (side: SwapSide): string => {
      const token = side === 'from' ? from : to;
      if (!token) return '';

      if (source === side) {
        if (focused === side) return amount;
        // What the user typed stays as typed — grouped, but not padded to `2.00000`.
        return amount === '' ? '' : formatAmount(parseAmount(amount), token.decimals, false);
      }

      // The derived side keeps fixed precision so its digits hold still as rates refresh.
      return formatAmount(valueOf(side), token.decimals);
    },
    [amount, focused, from, source, to, valueOf],
  );

  const setAmount = useCallback(
    (side: SwapSide, raw: string) => {
      setFocused(side);
      setValue('source', side);
      onAmountChange(sanitizeAmountInput(raw));
    },
    [onAmountChange, setValue],
  );

  const focusField = useCallback(
    (side: SwapSide) => {
      setFocused(side);
      if (source === side) return;

      // Moving the cursor to the derived field makes it the source: seed it
      // with the number it is already showing, minus the grouping commas, and
      // check that number the way a typed one would be.
      const token = side === 'from' ? from : to;
      const value = valueOf(side);
      const seeded = token && value ? String(Number(value.toFixed(token.decimals))) : '';

      setValues({ source: side, amount: seeded }, { shouldValidate: true });
    },
    [from, setValues, source, to, valueOf],
  );

  const blurField = useCallback(() => {
    setFocused(null);
    onAmountBlur();
  }, [onAmountBlur]);

  const selectToken = useCallback(
    (side: SwapSide, code: string) => {
      setValues((current) => {
        if (side === 'from') {
          // Picking the asset already on the other side trades places with it
          // rather than leaving the converter quoting an asset against itself.
          const toCode = code === current.toCode ? current.fromCode : current.toCode;
          return { ...current, fromCode: code, toCode };
        }

        const fromCode = code === current.fromCode ? current.toCode : current.fromCode;
        return { ...current, toCode: code, fromCode };
      });
    },
    [setValues],
  );

  const swapSides = useCallback(() => {
    setValues((current) => ({
      ...current,
      fromCode: current.toCode,
      toCode: current.fromCode,
      // The amount moves with its field, so both numbers stay where they are.
      source: current.source === 'from' ? 'to' : 'from',
    }));
    setSwapCount((count) => count + 1);
  }, [setValues]);

  return {
    from,
    to,
    fromValue: displayOf('from'),
    toValue: displayOf('to'),
    // The message sits on the field that holds the typed amount, so it
    // travels with that amount through a swap.
    fromError: source === 'from' ? amountError : null,
    toError: source === 'to' ? amountError : null,
    rate,
    swapCount,
    setAmount,
    focusField,
    blurField,
    selectToken,
    swapSides,
  };
}
