import Skeleton from "react-loading-skeleton";

const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton
        height={20}
        width="25%"
        baseColor="#2d3748"
        highlightColor="#4a5568"
      />
      <Skeleton height={48} baseColor="#2d3748" highlightColor="#4a5568" />
      <div className="flex justify-center my-4">
        <Skeleton
          circle={true}
          height={32}
          width={32}
          baseColor="#2d3748"
          highlightColor="#4a5568"
        />
      </div>
      <Skeleton
        height={20}
        width="25%"
        baseColor="#2d3748"
        highlightColor="#4a5568"
      />
      <Skeleton height={48} baseColor="#2d3748" highlightColor="#4a5568" />
      <Skeleton height={40} baseColor="#2d3748" highlightColor="#4a5568" />
    </div>
  );
};

export default LoadingSkeleton;
