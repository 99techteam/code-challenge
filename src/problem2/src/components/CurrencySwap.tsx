import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetTokenPrices } from '@/api/useGetTokenPrice';
import { ArrowDownUp, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import TokenCombobox from '@/components/TokenCombobox';
import { toast } from 'sonner';
import {
  CurrencySwapSchema,
  type CurrencySwapForm,
} from '@/schema/CurrencySwap';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { convertTokenAmount } from '@/utils/convertTokenAmount';

export default function CurrencySwap() {
  const [fromToken, setFromToken] = useState<string>('USDC');
  const [toToken, setToToken] = useState<string>('ETH');

  const {
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CurrencySwapForm>({
    resolver: zodResolver(CurrencySwapSchema),
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      fromAmount: '',
    },
  });

  const { data: prices = {}, isLoading } = useGetTokenPrices();

  const tokens = useMemo(() => Object.keys(prices), [prices]);

  const fromAmount = watch('fromAmount');

  const toAmount = useMemo(() => {
    if (!isValid) return '';
    return convertTokenAmount({
      fromAmount,
      fromToken,
      toToken,
      prices,
    });
  }, [fromAmount, fromToken, toToken, prices, isValid]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <Card className='w-full max-w-lg bg-white p-0'>
      <div>
        <div className='p-4 mb-5'>
          <h2 className='text-3xl font-black mb-5'>💰 Token Swap</h2>
          <div className='flex items-center justify-between'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <input
                    className={`h-10 w-full focus:outline-0 text-2xl border-b-[1px] border-gray-400 mr-4 ${
                      errors.fromAmount && 'border-red-500 text-red-500'
                    }`}
                    type='text'
                    {...register('fromAmount')}
                    placeholder='Enter amount'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Enter some invalid amount to test validation (string,
                    negative numbers or zero)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TokenCombobox
              value={fromToken}
              onChange={setFromToken}
              tokens={tokens}
              bgColor='bg-white'
            />
          </div>
          {errors.fromAmount && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.fromAmount.message}
            </p>
          )}
        </div>
        <div className='bg-background p-4 relative rounded-br-md rounded-bl-md'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='noShadow'
                  className='absolute top-[-20px] cursor-pointer left-0 right-0 m-auto z-10 outline-4 outline-white group transition-all'
                  onClick={handleSwapTokens}
                >
                  <ArrowDownUp className='group-hover:rotate-180 transition-transform duration-300' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This swaps between current tokens</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className='flex items-center justify-between mt-5'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <input
                    className='h-10 w-full focus:outline-0 text-2xl border-b-[1px] border-gray-400 mr-4'
                    type='text'
                    value={toAmount}
                    readOnly
                    placeholder='Converted amount'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is read-only</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TokenCombobox
              value={toToken}
              onChange={setToToken}
              tokens={tokens}
            />
          </div>

          <div className='mt-2'>
            <div className='flex items-center gap-1 mb-5'>
              <Info />
              <p className='text-sm'>
                1 {fromToken} ={' '}
                {prices[toToken] && prices[fromToken]
                  ? (prices[toToken] / prices[fromToken]).toFixed(6)
                  : 'N/A'}{' '}
                {toToken}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isLoading || !fromAmount}
                  className='w-[300px] mx-auto block cursor-pointer h-14 text-2xl group'
                >
                  {isLoading ? 'Loading...' : 'Swap'}
                  <span className='hidden group-hover:inline-block ml-2'>
                    🤑
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className='my-5'>
                    You are swapping{' '}
                    <span className='font-bold'>
                      {fromAmount} {fromToken}
                    </span>{' '}
                    to receive{' '}
                    <span className='font-bold'>
                      {toAmount} {toToken}
                    </span>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className='cursor-pointer'>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className='cursor-pointer'
                    onClick={() => {
                      toast.success(
                        `Successfully swapped ${fromAmount} ${fromToken} to ${toAmount} ${toToken}.`
                      );
                      setValue('fromAmount', '');
                    }}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
}
