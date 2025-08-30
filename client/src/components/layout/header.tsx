import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1" data-testid="page-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-4" data-testid="header-actions">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
