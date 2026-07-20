import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { getTranslations } from "@/i18n/request";

export default async function ForgotPasswordPage() {
  const { t } = await getTranslations("auth");
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
            Q
          </span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("forgotPasswordSubtitle")}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-xs">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Mail className="size-5" />
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
