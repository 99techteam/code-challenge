import { useState, useEffect, type FC, type SVGProps, memo } from "react";

const DynamicSVG = ({ svgName }: { svgName: string }) => {
  const [SVGComponent, setSVGComponent] = useState<FC<
    SVGProps<SVGSVGElement>
  > | null>(null);

  //   some names are mismatched so have to manually render the name
  const renderSVGName = () => {
    switch (svgName) {
      case "STEVMOS":
        return "stEVMOS";
      case "RATOM":
        return "rATOM";
      case "STOSMO":
        return "stOSMO";
      case "STATOM":
        return "stATOM";
      case "STJUNO":
        return "stJUNO";
      case "STLUNA":
        return "stLUNA";
      default:
        return svgName;
    }
  };

  useEffect(() => {
    const importSVG = async () => {
      const svgName = renderSVGName();
      try {
        const { default: Component } = await import(
          `../../assets/svgs/${svgName}.svg?react`
        ); // Use ?react for svgr
        setSVGComponent(() => Component);
      } catch (err) {
        console.error(`Error loading SVG: ${svgName}`, err);
      }
    };

    importSVG();
  }, []);

  if (!SVGComponent) {
    return <div>Loading...</div>;
  }

  return (
    <SVGComponent
      width={12}
      height={12}
      className="!max-w-4 !max-h-4 !w-4 !h-4"
    />
  );
};

export default memo(DynamicSVG);
