import { getCompanyProfile } from "@/actions/settings";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "./settings-form";
import { getTranslations } from "@/i18n/request";

export default async function SettingsPage() {
  const { t } = await getTranslations("settings");
  const result = await getCompanyProfile();
  const profile = result.success ? result.data : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t("title")} description={t("description")} />
      <SettingsForm profile={profile} />
    </div>
  );
}
