import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8FAF7] text-neutral-800">
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-neutral-600 mb-4">The requested page could not be found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-sm font-semibold hover:bg-emerald-900 transition-colors"
      >
        Return to Portal
      </Link>
    </div>
  );
}
