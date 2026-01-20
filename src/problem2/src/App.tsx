import { Layout } from "@/components/Layout"
import { Footer } from "@/components/Layout/Footer"
import { Header } from "@/components/Layout/Header"
import { Swap } from "@/features/Swap"

export default function App() {
  return (
    <Layout>
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 relative">
        <div className="relative flex items-center justify-center w-full max-w-4xl">
          <Swap />
        </div>
      </main>

      <Footer />
    </Layout>
  )
}
