export function SkeletonFeedPost() {
  return (
    <div className="px-4 py-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-28 bg-white/10 rounded-full" />
          <div className="h-2.5 w-20 bg-white/[0.06] rounded-full" />
        </div>
      </div>
      <div className="h-4 w-3/4 bg-white/10 rounded-full mb-2" />
      <div className="h-4 w-1/2 bg-white/[0.06] rounded-full mb-4" />
      <div className="w-full aspect-video rounded-2xl bg-white/[0.07] mb-3" />
      <div className="flex items-center gap-4">
        <div className="h-3 w-12 bg-white/[0.06] rounded-full" />
        <div className="h-3 w-12 bg-white/[0.06] rounded-full" />
        <div className="ml-auto h-5 w-20 bg-white/[0.06] rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonPostView() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] animate-pulse">
      <div className="h-14 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-white/10 rounded-full" />
          <div className="h-2.5 w-16 bg-white/[0.06] rounded-full" />
        </div>
      </div>
      <div className="w-full aspect-square bg-white/[0.07]" />
      <div className="p-4 space-y-4">
        <div className="h-5 w-4/5 bg-white/10 rounded-full" />
        <div className="h-4 w-full bg-white/[0.07] rounded-full" />
        <div className="h-4 w-2/3 bg-white/[0.06] rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white/[0.04] border border-white/5 animate-pulse">
      <div className="aspect-video w-full bg-white/[0.08]" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 bg-white/10 rounded-full" />
        <div className="h-3 w-1/2 bg-white/[0.06] rounded-full" />
      </div>
    </div>
  );
}
