import type { FC } from 'react'

interface Props {
  label: string
  count?: number
}

const DateGroupHeader: FC<Props> = ({ label, count }) => {
  return (
    <div className="date-group-header">
      <span>{label}</span>
      {typeof count === 'number' && (
        <span className="text-[10px] font-medium text-[#5a4042] normal-case tracking-normal">
          {count} post{count !== 1 ? 's' : ''}
        </span>
      )}
      <span className="date-group-accent" />
    </div>
  )
}

export default DateGroupHeader

/**
 * Format a date as a Buffer-style group header.
 * "Today", "Tomorrow", "Yesterday", or the weekday + day + month name otherwise.
 */
export function formatDateGroupLabel(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)

  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  if (d.getTime() === today.getTime()) return `Today · ${date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}`
  if (d.getTime() === tomorrow.getTime()) return `Tomorrow · ${date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}`
  if (d.getTime() === yesterday.getTime()) return `Yesterday · ${date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}`
  return date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined })
}
