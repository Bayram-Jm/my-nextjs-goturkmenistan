import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(240,30,14,0.07)] flex items-center justify-center mb-5">
        <SearchX size={28} className="text-[#f01e0e] opacity-70" />
      </div>

      <h2 className="font-righteous text-2xl text-[#100706] mb-2">Page not found</h2>
      <p className="font-inter text-sm text-[#9e9090] mb-7 max-w-[300px]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 font-inter text-sm text-[#524442] border border-[#e0dada] rounded-lg px-5 py-2.5 hover:bg-[#f8f5f5] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>
    </div>
  );
}
