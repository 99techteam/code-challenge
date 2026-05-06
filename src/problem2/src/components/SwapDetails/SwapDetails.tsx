type Props = {
  exchangeRateText: string;
  networkFeeText: string;
};

const SwapDetails = ({ exchangeRateText, networkFeeText }: Props) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailLine accent="violet">{exchangeRateText}</DetailLine>
      <DetailLine accent="teal">{networkFeeText}</DetailLine>
    </div>
  );
};

function DetailLine({
  children,
  accent,
}: {
  children: string;
  accent: "violet" | "teal";
}) {
  const bar =
    accent === "violet"
      ? "from-violet-500 via-indigo-500 to-fuchsia-500"
      : "from-teal-400 via-cyan-500 to-indigo-500";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/95 to-indigo-50/20 p-[0.65rem_0.75rem_0.65rem_0.95rem] shadow-panel-inset dark:border-slate-600 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 dark:shadow-none">
      <div className="flex gap-2.5">
        <span
          className={`mt-1 h-auto min-h-[2.75rem] w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b ${bar}`}
          aria-hidden
        />
        <p className="m-0 text-[0.82rem] font-medium leading-snug text-slate-700 dark:text-slate-200">{children}</p>
      </div>
    </div>
  );
}

export default SwapDetails;
