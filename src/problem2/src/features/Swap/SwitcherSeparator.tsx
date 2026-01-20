import { ArrowLeftRight } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"

export const SwitcherSeparator = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <div className="relative h-[2px] z-30 flex justify-center items-center my-2">
      <div className="absolute inset-x-6 h-[1px] bg-gradient-to-r from-neutral-200/30 via-neutral-200 to-neutral-200/30"></div>

      <button type="button" className="absolute group/orb cursor-pointer" {...props}>
        <div className="w-14 h-14 rounded-full bg-white/80 border border-white shadow-orb backdrop-blur-xl flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(82,224,224,0.6)]">
          <ArrowLeftRight className="text-primary text-[28px] transition-transform duration-700 group-hover/orb:rotate-[180deg]" />
        </div>

        <div className="absolute inset-0 rounded-full border border-primary/30 scale-100 opacity-0 group-hover/orb:scale-150 group-hover/orb:opacity-100 transition-all duration-700"></div>
      </button>
    </div>
  )
}
