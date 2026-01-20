import { Fragment, type PropsWithChildren, type ReactNode } from "react"

export const Card = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative w-full max-w-lg bg-glass-surface glass-panel border border-white/50 shadow-monolith rounded-4xl overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 rounded-4xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none opacity-50"></div>
      <div className="absolute top-0 left-1/5 right-1/5 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      <div className="relative p-2">{children}</div>
    </div>
  )
}

type TCardHeaderProps = { title: string; extra?: ReactNode }

export const CardHeader = ({ title, extra }: TCardHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-6 pb-2">
      <h2 className="text-sm font-bold text-neutral-400 tracking-widest uppercase">{title}</h2>

      {extra}
    </div>
  )
}

export const CardFooter = ({ children }: PropsWithChildren) => {
  return (
    <Fragment>
      <div className="relative w-full h-px px-6 opacity-80">
        <div className="absolute inset-x-6 h-px bg-gradient-to-r from-transparent via-accent-prism/50 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.3)]"></div>
      </div>

      <div className="p-8 pt-6">{children}</div>
    </Fragment>
  )
}
