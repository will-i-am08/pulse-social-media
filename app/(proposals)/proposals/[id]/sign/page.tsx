'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  ArrowPathIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'

export default function SignProposalPage() {
  const router = useRouter()
  const params = useParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [sigType, setSigType] = useState<'agency' | 'client'>('agency')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [proposal, setProposal] = useState<{ title: string; client_name: string; signature_client: string | null; signature_agency: string | null } | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/proposals/${params.id}`)
      if (!res.ok) { toast.error('Not found'); router.push('/proposals/list'); return }
      const data = await res.json()
      setProposal(data)
      setLoading(false)
    }
    load()
  }, [params.id, router])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [loading])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if ('touches' in e) e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return
    if ('touches' in e) e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasSignature(true)
  }

  function stopDraw() {
    setIsDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    ctx.strokeStyle = '#000'
    setHasSignature(false)
  }

  async function confirmSignature() {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    setSaving(true)
    const dataUrl = canvas.toDataURL('image/png')

    const body: Record<string, unknown> = { id: params.id }
    if (sigType === 'agency') {
      body.signatureAgency = dataUrl
    } else {
      body.signatureClient = dataUrl
    }

    // Check if both signatures will be present after this
    const otherSig = sigType === 'agency' ? proposal?.signature_client : proposal?.signature_agency
    if (otherSig) {
      body.status = 'signed'
      body.signedAt = new Date().toISOString()
    }

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save signature')
      toast.success('Signature saved!')
      router.push(`/proposals/${params.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !proposal) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-1">Sign Document</h1>
      <p className="text-slate-400 mb-8">{proposal.title} — {proposal.client_name}</p>

      {/* Existing signatures */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Agency Signature</p>
          {proposal.signature_agency ? (
            <img src={proposal.signature_agency} alt="Agency signature" className="h-12 bg-white rounded p-1" />
          ) : (
            <p className="text-sm text-slate-600 italic">Not signed</p>
          )}
        </div>
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Client Signature</p>
          {proposal.signature_client ? (
            <img src={proposal.signature_client} alt="Client signature" className="h-12 bg-white rounded p-1" />
          ) : (
            <p className="text-sm text-slate-600 italic">Not signed</p>
          )}
        </div>
      </div>

      {/* Sign as */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">Sign as:</p>
        <div className="flex gap-2">
          {(['agency', 'client'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSigType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                sigType === t
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[rgba(255,255,255,0.04)] text-slate-400 border border-[rgba(255,255,255,0.08)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.15)] rounded-xl p-4 mb-4">
        <p className="text-xs text-slate-500 mb-2">Draw your signature below:</p>
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg cursor-crosshair touch-none"
          style={{ height: 200, background: 'white' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <TrashIcon className="w-4 h-4" /> Clear
        </button>
        <button
          onClick={confirmSignature}
          disabled={!hasSignature || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)', opacity: !hasSignature || saving ? 0.5 : 1 }}
        >
          {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Confirm Signature'}
        </button>
      </div>
    </div>
  )
}
