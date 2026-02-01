import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CuadernoLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
