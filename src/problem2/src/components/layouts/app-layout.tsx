
type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <>
      <div className="w-full min-h-screen md:px-10 container mx-auto">{children}</div>
    </>
  );
};