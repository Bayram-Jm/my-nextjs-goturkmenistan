function Sk({ className }: { className: string }) {
  return <div className={`bg-[#e8e3e3] animate-pulse rounded-lg ${className}`} />;
}

export default function AdminDashboardLoading() {
  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Sk className="h-8 w-48 mb-2" />
          <Sk className="h-4 w-72" />
        </div>
        <Sk className="h-9 w-28 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-[16px] border border-[#ede9e8] p-5">
            <div className="flex items-center justify-between mb-3">
              <Sk className="h-3 w-20" />
              <Sk className="w-8 h-8 rounded-lg" />
            </div>
            <Sk className="h-8 w-16 mb-1" />
            <Sk className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Section table */}
      <div className="bg-white rounded-[16px] border border-[#ede9e8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f2eeee] flex items-center justify-between">
          <Sk className="h-5 w-24" />
          <Sk className="h-3 w-32" />
        </div>
        <div className="divide-y divide-[#f8f5f5]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Sk className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <Sk className="h-4 w-32 mb-1.5" />
                <Sk className="h-3 w-52" />
              </div>
              <Sk className="h-3 w-20 hidden sm:block" />
              <Sk className="h-3 w-16 hidden md:block" />
              <Sk className="h-7 w-14 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
