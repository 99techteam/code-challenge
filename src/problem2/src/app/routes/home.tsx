import { AppLayout } from "@/components/layouts/app-layout";
import TokenSwapForm from "@/components/token-swap-form";


const HomeRoute = () => {
  return (
    <AppLayout>
      <div className="py-8 flex items-center justify-center min-h-screen">
        <TokenSwapForm />
      </div>
    </AppLayout>
  );
};

export default HomeRoute;