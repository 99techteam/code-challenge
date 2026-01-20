import { Infinity as InfinityIcon, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWalletStore, walletService } from "@/services/wallet/wallet.service"

export const Header = () => {
  const { isConnected, address, connect, disconnect } = useWalletStore()

  const handleConnect = async () => {
    try {
      if (isConnected) return

      const data = await walletService.connect()
      connect(data.address, data.chainId)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (!isConnected) return

      await walletService.disconnect()
      disconnect()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="w-full px-8 py-6 flex justify-between items-center z-50">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="size-8 rounded-lg bg-black text-white flex items-center justify-center shadow-lg">
          <InfinityIcon className="size-5" />
        </div>

        <span className="text-xl font-bold tracking-tight text-neutral-900">AvantSwap</span>
      </div>

      <div className='h-11'>
        {!isConnected ? (
          <button
            type="button"
            className="relative overflow-hidden group rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 px-6 py-2.5 transition-all duration-300 shadow-sm backdrop-blur-sm"
            onClick={handleConnect}
          >
            <div
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative text-sm font-bold text-neutral-800 tracking-wide">
            Connect Wallet
          </span>
          </button>
        ) : (
          <div className="flex gap-2 items-center px-6 py-2.5 border border-transparent">
            {address?.slice(0, 6)}...{address?.slice(-4)}

            <Button size="icon-lg" variant="destructive" onClick={handleDisconnect}>
              <Unplug />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
