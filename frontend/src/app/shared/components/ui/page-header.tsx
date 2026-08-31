import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-start justify-between px-4 pt-4">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-bg-input text-text transition-colors hover:bg-bg-input"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-title font-semibold text-text">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}