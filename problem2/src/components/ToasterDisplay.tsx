import { Toaster } from "react-hot-toast";
const ToasterDisplay = (): JSX.Element => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Define default options
        duration: 5000,
        style: {
          fontSize: "1.6rem",
          maxWidth: "50rem",
          padding: "1.6rem 2.4rem",
          backgroundColor: "var(--color-white)",
        },
        // Default options for specific types
        success: {
          duration: 3000,
        },
        error: {
          duration: 4000,
        },
      }}
    />
  );
};

export default ToasterDisplay;
