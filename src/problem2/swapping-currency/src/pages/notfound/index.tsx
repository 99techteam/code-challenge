import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("Page not found: ",location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>404</h1>
      <p className="text-xl">Oops! Page not found</p>
    </div>
  );
};

export default NotFound;
