function Sk({ className }: { className: string }) {
  return <div className={`bg-[#e8e3e3] animate-pulse rounded-lg ${className}`} />;
}

export default function SectionFormLoading() {
  return (
    <div className="max-w-[860px]">
      {/* Back link */}
      <Sk className="h-4 w-24 mb-5" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div>
            <Sk className="h-7 w-36 mb-2" />
            <Sk className="h-4 w-72" />
          </div>
        </div>
        <div className="flex gap-2">
          <Sk className="h-9 w-24 rounded-lg" />
          <Sk className="h-9 w-20 rounded-lg" />
          <Sk className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-[16px] border border-[#ede9e8] p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={i === 0 ? "sm:col-span-2" : ""}>
              <Sk className="h-3 w-20 mb-1.5" />
              <Sk className="h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Array accordion skeleton */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-[#ede9e8] rounded-xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-5 py-3 bg-[#faf8f8]">
              <Sk className="h-4 w-28" />
              <Sk className="h-3 w-16" />
            </div>
            <div className="divide-y divide-[#f2eeee]">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center gap-4 px-5 py-3">
                  <Sk className="w-6 h-6 rounded-full flex-shrink-0" />
                  <Sk className="h-4 flex-1 max-w-[200px]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
