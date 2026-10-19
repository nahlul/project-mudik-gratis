type BadgeVariant = 'draft' | 'submitted' | 'need_revision' | 'verified' | 'rejected' | 'success' | 'warning' | 'info' | 'default';

const colorMap: Record<BadgeVariant, string> = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-blue-100 text-blue-700',
  need_revision: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-slate-100 text-slate-700',
};

const labelMap: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Terkirim',
  need_revision: 'Perlu Perbaikan',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
};

interface BadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ status, variant, className = '' }: BadgeProps) {
  const v = (variant || status) as BadgeVariant;
  const color = colorMap[v] ?? colorMap.default;
  const label = labelMap[status] ?? status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} ${className}`}>
      {label}
    </span>
  );
}
