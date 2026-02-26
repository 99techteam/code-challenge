import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/presentation/ui-toolkit/ui/card";
import { useSwap } from "@/presentation/swap/hooks/useSwap";
import { SwapForm } from "@/presentation/swap/components/SwapForm";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
      <Card className="bg-slate-900/90 border-slate-700/30 w-full max-w-md">
        <CardContent className="flex flex-col items-center py-16">
          <Loader2 className="h-9 w-9 animate-spin text-sky-400" />
          <p className="text-slate-400 mt-4 text-sm">Loading markets…</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AppShell() {
  const { loading } = useSwap();
  if (loading) return <LoadingScreen />;
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4 py-6 relative overflow-hidden font-sans">
      {/* Background orbs */}
      <div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none -top-36 -left-24"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="fixed w-[400px] h-[400px] rounded-full pointer-events-none -bottom-24 -right-20"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)" }}
      />
      <SwapForm />
      <style>{`
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20% { transform:translateX(-5px); }
          40% { transform:translateX(5px); }
          60% { transform:translateX(-4px); }
          80% { transform:translateX(4px); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}