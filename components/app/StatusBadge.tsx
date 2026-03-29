import { statusBadgeClass } from '@/lib/utils'

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusBadgeClass(status)}`}>{status || 'draft'}</span>
  )
}
