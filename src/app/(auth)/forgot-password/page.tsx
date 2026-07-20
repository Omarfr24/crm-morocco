import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { getTranslations } from "@/i18n/request";

export default async function ForgotPasswordPage() {
  const { t } = await getTranslations("auth");
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20">
            Q
          </span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("forgotPasswordSubtitle")}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-xs">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Mail className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("forgotPasswordInstructions")}
          </p>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full inline-flex items-center gap-1.5">
              <ArrowLeft className="size-4" />
              {t("backToSignIn")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
