export default function LoadingSpinner({ size }: { size: string }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div
        className={`size-${size} border-3 border-kinori-teal border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}
