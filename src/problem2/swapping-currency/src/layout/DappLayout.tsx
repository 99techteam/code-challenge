import { Outlet } from "react-router-dom";

const DappLayout = () => {
  return (
    <div className="m-auto w-full h-full">
      <Outlet />
    </div>
  );
};

export default DappLayout;
