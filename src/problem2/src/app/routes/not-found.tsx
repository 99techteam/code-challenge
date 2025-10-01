import { AppLayout } from "@/components/layouts/app-layout";


const NotFoundRoute = () => {
  return (
    <AppLayout>
      <div className="mt-52 flex flex-col items-center font-semibold">
        <h1 className="text-red-500">404 - Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
      </div>
    </AppLayout>
  );
};

export default NotFoundRoute;