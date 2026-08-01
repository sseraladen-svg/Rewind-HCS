'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #f5edd6 0%, #ede0c8 40%, #e8d8b8 100%)' }}
    >
      <div className="sk-paper rounded-xl p-8 max-w-md text-center sk-noise">
        <div className="text-5xl mb-4">💾</div>
        <h1 className="old-title text-2xl font-black text-[#5c4033] mb-2">
          Tape got stuck
        </h1>
        <p className="old-body text-sm text-[#8b7355] mb-6">
          Something went wrong and the rewind jammed. Hit the button below to try again.
        </p>
        <button
          onClick={reset}
          className="sk-leather old-btn px-6 py-2.5 rounded-lg text-[#faf6eb] font-bold cursor-pointer transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0.5"
        >
          ↻ Rewind Again
        </button>
      </div>
    </div>
  );
}
