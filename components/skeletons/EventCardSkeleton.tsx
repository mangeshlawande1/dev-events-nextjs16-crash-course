const EventCardSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-col gap-3" aria-hidden="true">
      <div className="h-[300px] w-full rounded-lg bg-dark-200" />

      <div className="flex flex-row items-center gap-2">
        <div className="h-[14px] w-[14px] rounded-full bg-dark-200" />
        <div className="h-4 w-24 rounded bg-dark-200" />
      </div>

      <div className="h-5 w-3/4 rounded bg-dark-200" />

      <div className="flex flex-row flex-wrap items-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <div className="h-[14px] w-[14px] rounded-full bg-dark-200" />
          <div className="h-4 w-20 rounded bg-dark-200" />
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="h-[14px] w-[14px] rounded-full bg-dark-200" />
          <div className="h-4 w-16 rounded bg-dark-200" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
