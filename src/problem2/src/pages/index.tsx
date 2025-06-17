import { Controller, useForm } from "react-hook-form";
import DecimalInput from "../components/DecimaInput";
import type { Price } from "types/price";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "../services/form";
import Select, { components } from "react-select";
import type { OptionProps } from "react-select";
import * as z from "zod";

const BALANCE = 100;
const CONVERTED_BALANCE = 200;

interface IMainPage {
  prices: Price[];
}

interface ISelectCurrency {
  value: string;
  label: string;
  data: Price;
}

const CustomOption = (props: OptionProps<ISelectCurrency>) => {
  return (
    <div className="flex items-center justify-between">
      <img
        src={props.data.data.icon}
        alt={props.data.label}
        className="w-5 h-5 ml-1"
      />
      <components.Option {...props} />
    </div>
  );
};

const MainPage = ({ prices }: IMainPage) => {
  const {
    register,
    control,
    getValues,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      target: 0,
      targetBalance: BALANCE,
      converted: 0,
      convertedBalance: CONVERTED_BALANCE,
      fee: 10,
      currency: prices?.[0]?.currency,
    },
    resolver: zodResolver(formSchema),
  });
  const { convertedBalance, targetBalance, fee } = getValues();
  const currency = watch("currency");
  const currentCurrency = prices.find((p) => p.currency === currency);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setValue("target", 0);
    setValue("targetBalance", data.targetBalance - data.target);
    setValue("converted", 0);
    setValue(
      "convertedBalance",
      data.convertedBalance +
        (data.target * (100 - data.fee) * (currentCurrency?.price ?? 1)) / 100
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="static bg-white rounded-lg p-6 shadow-md w-100"
      >
        <div className="mx-auto border border-gray-300 rounded-lg p-2 mb-6 w-full relative">
          <DecimalInput
            {...register("target")}
            placeholder="0.00"
            errors={errors}
          />
          <p>Balance: {targetBalance} USD</p>
          <div className="absolute top-18 left-[calc(50%-25px)] w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow mx-auto">
            <span>&#11015;</span>
          </div>
        </div>
        <div className="mx-auto border border-gray-300 rounded-lg p-2 mt-6 w-full">
          <div className="flex justify-between">
            <DecimalInput
              {...register("converted")}
              placeholder="0.00"
              errors={errors}
            />
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select<ISelectCurrency>
                  value={
                    prices
                      .map((price) => ({
                        value: price.currency,
                        label: price.currency,
                        data: price,
                      }))
                      .find((option) => option.value === field.value) || null
                  }
                  components={{
                    Option: CustomOption,
                  }}
                  options={prices.map((price) => ({
                    value: price.currency,
                    label: price.currency,
                    data: price,
                  }))}
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      fontSize: 13,
                      padding: "4px 8px",
                    }),
                  }}
                  className="w-48"
                  onChange={(option) => {
                    field.onBlur();
                    field.onChange(option ? option.value : "");
                  }}
                />
              )}
            />
          </div>
          <p>Balance: {convertedBalance * (currentCurrency?.price ?? 1)} </p>
        </div>

        <div className="w-full flex justify-center mt-4 text-gray-400">
          <p className="text-sm">
            1 USD = <b>{currentCurrency?.price}</b> {currentCurrency?.currency}
          </p>
        </div>

        <div className="my-4 border-t border-gray-200 w-full" />
        <div className="flex justify-between mb-1">
          <div>You will pay by</div>
          <div>
            <b>USD</b>
          </div>
        </div>
        <div className="flex justify-between mb-1">
          <div>You will receive by</div>
          <div>
            <b>{currentCurrency?.currency}</b>
          </div>
        </div>
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <p>Service Fee</p>
            <span className="ml-2 cursor-pointer group relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="white"
                />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                >
                  i
                </text>
              </svg>
              <span className="absolute left-6 top-1/2 -translate-y-1/2 w-48 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                The service fee covers transaction processing and platform
                maintenance.
              </span>
            </span>
          </div>
          <div>
            <b>{fee}%</b>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white rounded-full mt-4 p-3 text-lg"
        >
          Convert
        </button>
      </form>
    </div>
  );
};

export default MainPage;
