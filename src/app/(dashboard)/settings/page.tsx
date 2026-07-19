import { getCompanyProfile } from "@/actions/settings";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const result = await getCompanyProfile();
  const profile = result.success ? result.data : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Manage your company profile" />
      <SettingsForm profile={profile} />
    </div>
  );
}
