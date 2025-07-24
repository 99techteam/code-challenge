import { useSwapAction, useSwapState } from '@/hooks/swap'
import InputNumber from '../input-number'
import SelectToken from '../select-token'
import { Container, IconButton } from '@radix-ui/themes'
import { DECIMAL, DefaultIcon, TokenMap } from '@/constants'
import styles from './styles.module.css'
import Button from '../button'
import clsx from 'clsx'
import { IconArrowsSort } from '@tabler/icons-react'
import Text from '../text'
import { getBigNumber } from '@/utils'
import { useBalancesState } from '@/hooks/balances'
import ToggleDarkModeButton from '../toggle-dark-mode-button'
import WalletButton from '../wallet-button'

const Swap = () => {
  const { data: balances } = useBalancesState()
  const { changeFromAmount, changeFromToken, changeToToken, swap, revert, setMaxFromAmount } =
    useSwapAction()
  const {
    fromAmount,
    fromToken,
    fromTokens,
    toAmount,
    toToken,
    toTokens,
    isDisabledInputAmount,
    isDisabledTransaction,
    isSwapping,
    canRevert,
    beforeSwapFromAmount,
    beforeSwapToAmount,
    afterSwapFromAmount,
    afterSwapToAmount,
  } = useSwapState()

  const formatFromToken = fromToken.toUpperCase()

  return (
    <div className={styles.wrapper}>
      <Container className={styles.wrapperContainer} size="2">
        <div className={styles.toggleDarkModeButtonContainer}>
          <Text as="p" size="5" weight="bold" className={styles.inputLabel} variant="highlight">
            Swap App
          </Text>

          <div className={styles.toggleDarkModeButton}>
            <WalletButton />
            <ToggleDarkModeButton />
          </div>
        </div>

        <div className={styles.container}>
          <div className={clsx(styles.inputContainer, styles.inputContainerFrom)}>
            <div className={styles.inputLabelContainer}>
              <Text as="p" size="5" weight="bold" className={styles.inputLabel} variant="highlight">
                From
              </Text>

              {fromToken && (
                <div className={styles.balanceContainer}>
                  <Text size="2" weight="medium" as="div" variant="secondary">
                    <b>{formatFromToken}</b> balance:{' '}
                    {getBigNumber(balances?.[fromToken] ?? '0')
                      .decimalPlaces(5)
                      .toString()}
                  </Text>

                  <Button size="1" onClick={setMaxFromAmount}>
                    Max
                  </Button>
                </div>
              )}
            </div>

            <InputNumber
              wrapperClassName={styles.wrapperInput}
              className={styles.input}
              fullWidth
              placeholder="0.0"
              value={fromAmount}
              decimalScale={DECIMAL}
              isAllowed={(values) => {
                const { floatValue } = values

                if (!floatValue) {
                  return true
                }
                return getBigNumber(floatValue.toString()).isLessThanOrEqualTo(
                  balances?.[fromToken] ?? '0',
                )
              }}
              max={balances?.[fromToken]}
              disabled={isDisabledInputAmount}
              leftSlot={
                <SelectToken
                  title="Select input token"
                  selectedToken={fromToken}
                  tokens={fromTokens}
                  onSelect={changeFromToken}
                />
              }
              onValueChange={(e) => {
                changeFromAmount(e.floatValue === 0 ? '0' : (e.floatValue?.toString() ?? ''))
              }}
            />

            <Text
              size="2"
              weight="medium"
              as="div"
              variant="secondary"
              className={styles.inputHint}
            >
              You can only input amount after selecting token!
            </Text>

            <div className={styles.revertButtonContainer}>
              <IconButton
                className={styles.revertButton}
                size="3"
                radius="full"
                disabled={!canRevert}
                onClick={revert}
              >
                <IconArrowsSort size={25} />
              </IconButton>
            </div>
          </div>

          <div className={styles.inputContainerTo}>
            <Text as="p" size="5" weight="bold" className={styles.inputLabel} variant="highlight">
              To
            </Text>

            <InputNumber
              wrapperClassName={styles.wrapperInput}
              className={styles.input}
              fullWidth
              placeholder="0.0"
              value={toAmount}
              disabled
              leftSlot={
                <SelectToken
                  title="Select output token"
                  selectedToken={toToken}
                  tokens={toTokens}
                  onSelect={changeToToken}
                />
              }
            />
          </div>

          {beforeSwapFromAmount && afterSwapToAmount && (
            <div className={styles.swapInfoContainer}>
              <div className={styles.swapInfo}>
                <Text size="3" weight="medium" as="div">
                  Before swap
                </Text>
                <div className={styles.swapInfoItems}>
                  <div className={styles.swapInfoItem}>
                    <div className={styles.swapInfoItemIcon}>
                      {TokenMap[fromToken]?.icon ?? DefaultIcon} {fromToken.toUpperCase()}
                    </div>
                    <div className={styles.swapInfoItemValue}>
                      <Text size="2" weight="medium" as="div" variant="secondary">
                        {beforeSwapFromAmount}
                      </Text>
                    </div>
                  </div>

                  <div className={styles.swapInfoItem}>
                    <div className={styles.swapInfoItemIcon}>
                      {TokenMap[toToken]?.icon ?? DefaultIcon} {toToken.toUpperCase()}
                    </div>
                    <div className={styles.swapInfoItemValue}>
                      <Text size="2" weight="medium" as="div" variant="secondary">
                        {beforeSwapToAmount}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.swapInfo}>
                <Text size="3" weight="medium" as="div">
                  After swap
                </Text>
                <div className={styles.swapInfoItems}>
                  <div className={styles.swapInfoItem}>
                    <div className={styles.swapInfoItemIcon}>
                      {TokenMap[fromToken]?.icon ?? DefaultIcon} {fromToken.toUpperCase()}
                    </div>
                    <div className={styles.swapInfoItemValue}>
                      <Text size="2" weight="medium" as="div" variant="error">
                        {afterSwapFromAmount}
                      </Text>
                    </div>
                  </div>
                  <div className={styles.swapInfoItem}>
                    <div className={styles.swapInfoItemIcon}>
                      {TokenMap[toToken]?.icon ?? DefaultIcon} {toToken.toUpperCase()}
                    </div>
                    <div className={styles.swapInfoItemValue}>
                      <Text size="2" weight="medium" as="div" variant="success">
                        {afterSwapToAmount}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={styles.swapButtonContainer}>
            <Button
              fullWidth
              disabled={isDisabledTransaction}
              onClick={swap}
              loading={isSwapping}
              size="4"
            >
              Swap
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Swap
