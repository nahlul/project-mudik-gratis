import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullPage?: boolean;
}

const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export default function LoadingSpinner({ size = 'md', message, fullPage = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`animate-spin text-brand-600 ${sizeClass[size]}`} />
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}
