import { motion } from "framer-motion";
import SwapForm from "./components/SwapForm";

const App = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background bg-grid-fade px-4 py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-32 top-20 size-[420px] rounded-full bg-primary/12 blur-3xl"
        aria-hidden
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto flex max-w-lg flex-col items-center gap-8">
        <SwapForm />
        <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground">
          Prices from{" "}
          <a
            className="text-primary underline decoration-border underline-offset-2 transition hover:decoration-primary"
            href="https://interview.switcheo.com/prices.json"
            target="_blank"
            rel="noreferrer"
          >
            interview.switcheo.com
          </a>
          . Icons from{" "}
          <a
            className="text-primary underline decoration-border underline-offset-2 transition hover:decoration-primary"
            href="https://github.com/Switcheo/token-icons"
            target="_blank"
            rel="noreferrer"
          >
            Switcheo token-icons
          </a>
          . This UI is a front-end demo only.
        </p>
      </div>
    </div>
  );
};

export default App;
