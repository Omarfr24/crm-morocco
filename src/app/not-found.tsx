import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="size-7" />
      </span>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground mt-1">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline" className="inline-flex items-center gap-1.5">
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
