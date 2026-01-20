import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import App from "./App.tsx"

async function enableMocking() {
  const { worker } = await import("./mocks/browser")

  return worker.start()
}

enableMocking().then(() => {
  // biome-ignore lint/style/noNonNullAssertion: Guaranteed to be non-null by React
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        <App />

        <Toaster richColors position='top-center' />
      </QueryClientProvider>
    </StrictMode>,
  )
})
