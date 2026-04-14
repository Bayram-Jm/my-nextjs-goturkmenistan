function Sk({ className }: { className: string }) {
  return <div className={`bg-[#e8e3e3] animate-pulse rounded-lg ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="max-w-[720px] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div>
          <Sk className="h-8 w-28 mb-2" />
          <Sk className="h-4 w-56" />
        </div>
      </div>

      {/* Password card */}
      <div className="bg-white rounded-[16px] border border-[#ede9e8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f2eeee] bg-[#faf8f8]">
          <Sk className="h-4 w-32" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Sk className="h-3 w-24 mb-1.5" />
              <Sk className="h-10 w-full" />
            </div>
          ))}
          <Sk className="h-9 w-36 rounded-lg mt-1" />
        </div>
      </div>

      {/* Account card */}
      <div className="bg-white rounded-[16px] border border-[#ede9e8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f2eeee] bg-[#faf8f8]">
          <Sk className="h-4 w-20" />
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <Sk className="h-3 w-20 mb-1.5" />
              <Sk className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Site card */}
      <div className="bg-white rounded-[16px] border border-[#ede9e8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f2eeee] bg-[#faf8f8]">
          <Sk className="h-4 w-12" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <Sk key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Sk className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
