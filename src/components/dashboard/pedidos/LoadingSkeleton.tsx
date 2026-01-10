export const LoadingSkeleton = () => (
  <div className="grid md:flex gap-6 md:gap-10">
    <div className="w-full grid gap-4">
      <div className="bg-zinc-200 rounded-md animate-pulse py-10"></div>
      <div className="bg-zinc-200 rounded-md animate-pulse py-10 h-[20rem]"></div>
    </div>
    <div className="w-full md:max-w-[28rem]">
      <div className="bg-zinc-200 rounded-md animate-pulse py-10 h-[20rem]"></div>
    </div>
  </div>
);