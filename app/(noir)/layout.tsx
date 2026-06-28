'use client'

import { usePathname } from 'next/navigation'
import NoirNav from '@/components/noir/NoirNav'
import NoirFooter from '@/components/noir/NoirFooter'
import './noir.css'

export default function NoirLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const climb = pathname.startsWith('/podcast')

  return (
    <div className={`pulse-noir${climb ? ' climb' : ''}`}>
      <NoirNav climb={climb} />
      {children}
      <NoirFooter climb={climb} />
    </div>
  )
}
