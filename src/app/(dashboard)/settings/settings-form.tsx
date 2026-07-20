"use client";

import { useActionState } from "react";
import { upsertCompanyProfile } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

type Profile = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
} | null;

export function SettingsForm({ profile }: { profile: Profile }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await upsertCompanyProfile({
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        logo: (formData.get("logo") as string) || "",
      });
      return result;
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("companyProfile")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state && "error" in state && state.error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state && "success" in state && state.success && (
            <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
              <CheckCircle className="size-4" />
              {t("profileSaved")}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("companyName")}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile?.name ?? ""}
              required
            />
            {state && "fieldErrors" in state && state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("address")}</Label>
            <Input
              id="address"
              name="address"
              defaultValue={profile?.address ?? ""}
              required
            />
            {state && "fieldErrors" in state && state.fieldErrors?.address && (
              <p className="text-sm text-destructive">{state.fieldErrors.address}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={profile?.phone ?? ""}
                required
              />
              {state && "fieldErrors" in state && state.fieldErrors?.phone && (
                <p className="text-sm text-destructive">{state.fieldErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={profile?.email ?? ""}
                required
              />
              {state && "fieldErrors" in state && state.fieldErrors?.email && (
                <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">{t("logoUrl")}</Label>
            <Input
              id="logo"
              name="logo"
              defaultValue={profile?.logo ?? ""}
              placeholder={t("logoPlaceholder")}
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? tc("saving") : t("saveProfile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
