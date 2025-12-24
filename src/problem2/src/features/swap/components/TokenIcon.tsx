import { useEffect, useState } from "react";

interface Props {
  symbol: string;
  size?: number;
}

const BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export function TokenIcon({ symbol, size = 20 }: Props) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch(`${BASE_URL}/${symbol}.svg`)
      .then((r) => (r.ok ? r.text() : null))
      .then((t) => active && setSvg(t))
      .catch(() => active && setSvg(null));

    return () => {
      active = false;
    };
  }, [symbol]);

  if (!svg) {
    return (
      <div
        className="bg-slate-700 rounded-full text-xs flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {symbol[0]}
      </div>
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
