import React from "react";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6 md:px-0 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(at 50% -20%, rgba(14, 165, 233, 0.4), transparent 70%),
            radial-gradient(at 90% 90%, rgba(168, 85, 247, 0.4), transparent 70%),
            radial-gradient(at 10% 90%, rgba(234, 179, 8, 0.4), transparent 70%)
          `,
        }}
      ></div>
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-1/2 left-1/2 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 blur-sm"
          style={{
            transform: "translate(-50%, -50%) rotate(-45deg)",
            filter: "blur(10px)",
          }}
        ></div>
      </div>

      <div className="w-full md:max-w-[600px] relative z-10 bg-gray-900 rounded-lg py-10 px-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
