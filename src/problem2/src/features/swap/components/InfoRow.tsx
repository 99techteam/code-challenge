interface Props {
  label: string;
  value: string | React.ReactNode;
}

export function InfoRow({ label, value }: Props) {
  return (
    <div className="flex justify-between text-sm text-white/60">
      <span>{label}</span>
      <span className="text-white flex-1 text-right truncate">{value}</span>
    </div>
  );
}
