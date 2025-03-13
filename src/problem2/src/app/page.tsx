'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const formSchema = z.object({
  amountToSend: z.string().refine((v) => parseInt(v) > 0, {
    message: 'Amount to send must be greater than 0',
  }),
  amountToReceive: z.string().refine((v) => parseInt(v) > 0, {
    message: 'Amount to receive must be greater than 0',
  }),
  token: z.string().nonempty('Token is required'),
});

type Price = {
  currency: string;
  date: string;
  price: number;
};
/**
 * Index page of the app.
 *
 * This page has a basic form with two fields: amount to send and amount to receive.
 * The form is validated with zod and react-hook-form.
 * When the form is submitted, it will log the values to the console and show a loading indicator.
 *
 * This page is a good starting point for building a simple form.
 */
export default function Index() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prices, setPrices] = useState<Price[]>([]);
  const tokens = prices.map((price) => ({
    ...price,
    value: price.currency,
    label: price.currency,
    icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${price.currency}.svg`,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountToSend: '0',
      amountToReceive: '0',
      token: '',
    },
  });

  useEffect(() => {
    axios.get('https://interview.switcheo.com/prices.json').then((response) => {
      const uniquePrices = response.data.filter(
        (price: Price, index: number) =>
          index ===
          response.data.findIndex((p: Price) => p.currency === price.currency)
      );
      setPrices(uniquePrices);
    });
  }, []);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.toast({
        title: 'Success',
        description: 'Transaction successful',
      });
    }, 3000);
    form.reset();
  };
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 p-7 flex justify-center h-screen items-center"
      >
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Swap Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="amountToSend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to send</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Amount to send"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the amount you want to send.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountToReceive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to receive</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Amount to receive"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the amount you will receive.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>  
                      <SelectContent>
                        {tokens.map((price, index) => (
                          <SelectItem key={index} value={price.value.toString()}>
                            <div className="flex w-full items-center cursor-pointer">
                            <Avatar className="mr-2 w-6 h-6">
                              <AvatarImage src={price.icon} alt={price.label} />
                              <AvatarFallback>{price.label.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                              <div className="flex-1">{price.label} - ${price.price}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    This is the token you will receive.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Confirm Swap
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
