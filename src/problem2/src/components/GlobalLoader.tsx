import { useAppState } from "@/store/useAppState";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const GlobalLoader = () => {
  const { isLoading } = useAppState();

  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 bg-slate-300 bg-opacity-80 z-[9999] flex items-center justify-center">
      <DotLottieReact
        src="https://lottie.host/ffc8ce44-9402-4d1c-827e-fff9cbd81e2c/9piJiVyrYo.lottie"
        autoplay
        loop
        style={{ width: 100, height: 100 }}
      />
    </div>
  );
};

export default GlobalLoader;
