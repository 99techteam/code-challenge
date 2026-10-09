import { toggleIsLogin } from '../store/index.js'
import SwapForm from './SwapForm.jsx'
import {useDispatch,useSelector} from 'react-redux'
function Layout() {
  const dispatch = useDispatch()
    const isLogin = useSelector((state) => state.isLogin)
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0b0c12] text-slate-200">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_52%_36%,rgba(114,82,255,0.12),transparent_43%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      <header className="relative z-10 mx-auto flex h-[76px] w-full max-w-7xl items-center justify-end px-5 sm:px-8">
        <button onClick={()=>dispatch(toggleIsLogin())} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white transition hover:border-violet-400/40 hover:bg-white/[0.07] sm:px-4" type="button">
          <span className={`size-2 rounded-full ${isLogin ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]' : 'bg-slate-500'}`} />
          {isLogin ? 'Wallet connected' : 'Connect wallet'}
        </button>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-5 py-4 sm:px-8 sm:py-6">
        <SwapForm />
      </section>
    </main>
  )
}

export default Layout
