import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Link href={action.href} className={buttonVariants({ variant: "default" })}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
