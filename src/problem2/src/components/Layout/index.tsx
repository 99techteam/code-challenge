import type { PropsWithChildren } from "react"

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-1/5 -left-[10%] size-[70%] rounded-full bg-white/60 blur-[120px] mix-blend-overlay"></div>
        <div className="absolute top-2/5 right-[10%] w-2/5 h-2/5 rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      {children}
    </div>
  )
}

