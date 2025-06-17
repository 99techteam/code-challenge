import { useQuery } from "@tanstack/react-query";
import { getPrices } from "./apis/prices";
import MainPage from "./pages";

const App = () => {
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["getPrices"],
    queryFn: getPrices,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="w-80 p-6 bg-white rounded-lg shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  if (!isSuccess || !data) {
    return <div>Error loading data</div>;
  }

  return <MainPage prices={data} />;
};

export default App;
