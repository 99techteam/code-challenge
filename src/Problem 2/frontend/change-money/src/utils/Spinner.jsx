// src/components/Spinner.jsx
import React from "react";

const Spinner = ({
  size = 16,
  colors = ["from-blue-500", "via-red-500", "to-purple-500"],
}) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`relative rounded-full border-4 border-gray-200 border-t-transparent bg-gradient-to-r ${colors.join(
          " "
        )} animate-spin`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="absolute inset-1 rounded-full bg-gradient-radial from-white/80 to-transparent"></div>
      </div>
    </div>
  );
};

export default Spinner;
