import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { getTranslations } from "@/i18n/request";

export default async function NotFound() {
  const { t } = await getTranslations("errors");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 animate-fade-in">
      <span className="flex size-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
        <FileQuestion className="size-9" />
      </span>
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground mt-2">
          {t("notFound")}
        </p>
      </div>
      <Link href="/">
        <Button variant="outline" className="inline-flex items-center gap-2">
          <ArrowLeft className="size-4" />
          {t("backToDashboard")}
        </Button>
      </Link>
    </div>
  );
}
