export type ProposalType = 'proposal' | 'contract' | 'template'
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'expired' | 'cancelled'

export interface ProposalSection {
  id: string
  type: 'heading' | 'text' | 'services' | 'pricing' | 'timeline' | 'terms' | 'signature'
  title: string
  content: string
  items?: ServiceLineItem[]
}

export interface ServiceLineItem {
  description: string
  quantity?: number
  unitPrice?: number
  total: number
}

export interface Proposal {
  id: string
  userId: string
  title: string
  type: ProposalType
  clientName: string
  clientEmail: string
  brandId: string | null
  content: ProposalSection[]
  status: ProposalStatus
  startDate: string | null
  endDate: string | null
  renewalDate: string | null
  totalValue: number
  signatureClient: string | null
  signatureAgency: string | null
  signedAt: string | null
  createdAt: string
  updatedAt: string
}

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  signed: 'Signed',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: '#64748b',
  sent: '#0ea5e9',
  viewed: '#a855f7',
  signed: '#22c55e',
  expired: '#ef4444',
  cancelled: '#6b7280',
}

export const TYPE_LABELS: Record<ProposalType, string> = {
  proposal: 'Proposal',
  contract: 'Contract',
  template: 'Template',
}
