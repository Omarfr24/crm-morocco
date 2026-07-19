import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-3 sm:mt-0 inline-flex items-center gap-1.5"
          )}
        >
          <Plus className="size-4" />
          {action.label}
        </Link>
      )}
    </div>
  );
}
