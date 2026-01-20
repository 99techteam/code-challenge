import { CircleQuestionMark } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="w-full px-8 py-4 grid grid-cols-3 justify-between items-end text-neutral-400 z-50 mt-auto">
      <div className="flex gap-4 text-xs font-medium tracking-wide">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Ethereum Mainnet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(82,224,224,0.6)]"></span> Block 1849201
        </span>
      </div>

      <div className="gap-4 text-xs font-medium tracking-wide text-center">imliam.se@gmail.com</div>

      <div className="flex gap-4 justify-end">
        <div className="relative group/help">
          <button
            type="button"
            className="size-8 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
          >
            <CircleQuestionMark className='size-[18px]' />
          </button>
          <div
            className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all duration-300 z-50 transform origin-bottom-right scale-95 group-hover/help:scale-100">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-1">Need help?</h4>
            <p className="text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              Our support team is available 24/7 to assist with your transactions. Check our documentation for detailed
              guides.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}