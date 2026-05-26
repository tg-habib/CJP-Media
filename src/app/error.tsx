"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black text-white h-screen">
      <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
      <button className="bg-primary text-black px-4 py-2 font-bold" onClick={() => reset()}>Try again</button>
    </div>
  );
}
