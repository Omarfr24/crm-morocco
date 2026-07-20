"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CustomersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const tc = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("failedToLoadCustomers")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tc("unexpectedError")}
        </p>
      </div>
      <Button onClick={reset}>{tc("tryAgain")}</Button>
    </div>
  );
}
