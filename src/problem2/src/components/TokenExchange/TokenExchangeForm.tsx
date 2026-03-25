import { ArrowDownUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { NumberInput, TokenSelect } from '@/components/TokenExchange'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useSwapTokens } from '@/hooks'
import type { IToken } from '@/types'
import { validateExchange } from '@/utils'

interface Props {
  tokens: IToken[]
  isSubmitting: boolean
  onExchange: (fromToken: IToken, toToken: IToken, amount: number) => void
}

export function TokenExchangeForm({ tokens, isSubmitting, onExchange }: Props) {
  const [errors, setErrors] = useState<Record<string, string> | null>(null)

  const tokenByCurrency = useMemo(() => {
    return tokens.reduce((acc, token) => {
      acc[token.currency] = token
      return acc
    }, {} as Record<string, IToken>)
  }, [tokens])

  const [state, dispatch] = useSwapTokens()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors(null);
  }, [state])

  function handleSelectFromToken(value: string) {
    dispatch({ type: "SET_FROM_TOKEN", payload: tokenByCurrency[value] })
  }

  function handleSelectToToken(value: string) {
    dispatch({ type: "SET_TO_TOKEN", payload: tokenByCurrency[value] })
  }

  function handleTokenSendChange(value: number) {
    dispatch({ type: "SET_TOKEN_SEND", payload: value })
  }

  function handleTokenReceiveChange(value: number) {
    dispatch({ type: "SET_TOKEN_RECEIVE", payload: value })
  }

  function handleRevert() {
    dispatch({ type: "SWAP_TOKENS" })
  }

  function handleSubmit() {
    const newErrors = validateExchange(state.fromToken, state.toToken, state.tokenSend, state.tokenReceive)
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    onExchange(state.fromToken!, state.toToken!, state.tokenSend)
  }

  return (
    <div className='flex flex-col gap-4 w-full max-w-xs items-center'>
      <Field>
        <FieldLabel>From Token</FieldLabel>
        <TokenSelect
          data={tokens}
          value={state.fromToken?.currency || ''}
          onSelect={handleSelectFromToken}
        />
        <FieldError errors={[{ message: errors?.fromToken }]} />
      </Field>

      <Field>
        <FieldLabel>Amount to Send</FieldLabel>
        <NumberInput value={state.tokenSend} onChange={handleTokenSendChange} />
        <FieldError errors={[{ message: errors?.tokenSend }]} />
      </Field>

      <Button className='rounded-full w-fit bg-gray-500 w-12 h-12 hover:bg-gray-700 hover:cursor-pointer' onClick={handleRevert}>
        <ArrowDownUp />
      </Button>

      <Field>
        <FieldLabel>To Token</FieldLabel>
        <TokenSelect
          data={tokens}
          value={state.toToken?.currency || ''}
          onSelect={handleSelectToToken}
        />
        <FieldError errors={[{ message: errors?.toToken }]} />
      </Field>

      <Field>
        <FieldLabel>Amount to Receive</FieldLabel>
        <NumberInput value={state.tokenReceive} onChange={handleTokenReceiveChange} />
        <FieldError errors={[{ message: errors?.tokenReceive }]} />
      </Field>

      <Button className='py-5 rounded-xl mt-5 w-full' disabled={isSubmitting || Object.keys(errors || {}).length > 0} onClick={handleSubmit}>
        {isSubmitting ? 'EXCHANGING...' : 'EXCHANGE'}
      </Button>
    </div>
  )
}
