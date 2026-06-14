'use client'

import { useState, useRef, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { Sparkles, Send, Upload, Paperclip, Trash2, Bot, User } from 'lucide-react'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export interface OnboardingFile {
  url: string
  filename: string
  mimeType: string
  sizeBytes: number
  kind: string
  caption?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolName?: string
  toolArgs?: unknown
}

interface Props {
  onFillForm: (values: unknown) => void
  brandPrimaryColor?: string
  onFilesChanged?: (files: OnboardingFile[]) => void
}

export default function OnboardingChatPanel({
  onFillForm,
  brandPrimaryColor = '#D83C14',
  onFilesChanged
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Track files uploaded in this onboarding session
  const [uploadedFiles, setUploadedFiles] = useState<OnboardingFile[]>([])
  
  // File details inputs
  const [fileKind, setFileKind] = useState('reference')
  const [fileCaption, setFileCaption] = useState('')
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Autoscroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending])

  // Propagate files up to parent form
  useEffect(() => {
    if (onFilesChanged) {
      onFilesChanged(uploadedFiles)
    }
  }, [uploadedFiles, onFilesChanged])

  async function uploadFile(file: File) {
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/portal/admin/upload', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? 'Upload failed')
        return
      }

      const newAsset: OnboardingFile = {
        url: data.url,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        kind: fileKind,
        caption: fileCaption.trim() || undefined
      }

      setUploadedFiles((prev) => [...prev, newAsset])
      setFileCaption('')
      toast.success('Document uploaded to session')

      // Add system message informing that the file is attached
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: `📎 Attached document: "${file.name}" (${fileKind}). You can ask me to analyze it or build the brand identity from it.`
        }
      ])
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function send() {
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setInput('')

    // Add user message optimistically
    const userMsgId = `user-${Date.now()}`
    const nextHistory = [
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content }
    ]

    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content }])

    try {
      const res = await fetch('/api/portal/admin/brands/new/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: nextHistory,
          files: uploadedFiles
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Chat failed' }))
        toast.error(err.error)
        setMessages((prev) => prev.filter((m) => m.id !== userMsgId))
        return
      }

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.text,
          toolName: data.toolName,
          toolArgs: data.toolArgs
        }
      ])

      // Automatically execute fillBrandForm if model called it
      if (data.toolName === 'fillBrandForm' && data.toolArgs) {
        onFillForm(data.toolArgs)
        toast.success('Brand form populated by AI!')
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Chat failed')
      setMessages((prev) => prev.filter((m) => m.id !== userMsgId))
    } finally {
      setSending(false)
    }
  }

  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    toast.success('Document removed from session')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <div
      className="border-4 border-black bg-[#1c1b1b] flex flex-col"
      style={{ minHeight: '600px', maxHeight: 'calc(100vh - 120px)' }}
    >
      <Toaster position="top-right" theme="dark" richColors />
      {/* Header */}
      <div className="px-4 py-3 border-b-4 border-black flex items-center justify-between gap-3 bg-[#0e0e0e]">
        <div className="flex items-center gap-2">
          <Sparkles
            className="w-4 h-4"
            style={{ color: brandPrimaryColor }}
            aria-hidden
          />
          <span
            className="text-xs uppercase tracking-widest font-black text-[#e5e2e1]"
            style={HEAD}
          >
            Brand Setup Assistant
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={BODY}>
        {messages.length === 0 && (
          <div className="text-center py-8 px-4">
            <Sparkles
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: brandPrimaryColor }}
              aria-hidden
            />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#e5e2e1] mb-2" style={HEAD}>
              AI Onboarding Assistant
            </h3>
            <p className="text-xs text-[#ab8981] mb-4" style={BODY}>
              Upload a logo, style guide, or color palette PDF/image. Describe the brand identity, and the AI will analyze it to suggest color schemes, social configurations, and auto-populate the onboarding form.
            </p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div
                className="w-6 h-6 border-2 border-black flex items-center justify-center shrink-0"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                <Bot className="w-3 h-3 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] ${m.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`px-3 py-2 border-2 border-black text-sm whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-[#D83C14] text-white' : 'bg-[#0e0e0e] text-[#e5e2e1]'
                }`}
                style={BODY}
              >
                {m.content}
              </div>
              {m.toolName === 'fillBrandForm' && !!m.toolArgs && (
                <div className="mt-2 border-2 border-black bg-[#0e0e0e] p-2 text-[10px] text-[#76dc83] uppercase tracking-wider" style={HEAD}>
                  Form populated: {(() => {
                    const args = m.toolArgs as Record<string, unknown>
                    return typeof args.brandName === 'string' ? args.brandName : 'Configured'
                  })()}
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 border-2 border-black bg-[#0e0e0e] flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-[#e4beb5]" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-xs text-[#ab8981] italic" style={BODY}>
            <Bot className="w-3 h-3 animate-pulse" />
            Analyzing details…
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 border-t-2 border-black bg-[#0e0e0e] space-y-1 max-h-28 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-widest font-black text-[#ab8981]">Onboarding Assets:</div>
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-[#e5e2e1] bg-[#1c1b1b] border border-black px-2 py-1">
              <span className="truncate flex items-center gap-1.5 max-w-[80%]">
                <Paperclip className="w-3 h-3 text-[#ab8981]" />
                <span className="truncate">{f.filename}</span>
                <span className="text-[9px] px-1 bg-[#0e0e0e] text-[#e4beb5] uppercase font-mono">{f.kind}</span>
              </span>
              <button type="button" onClick={() => removeFile(i)} className="text-[#ab8981] hover:text-[#93000a]">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Controls */}
      <div className="border-t-4 border-black p-3 bg-[#1c1b1b] space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={fileKind}
            onChange={(e) => setFileKind(e.target.value)}
            className="bg-[#0e0e0e] border-2 border-black text-[10px] text-[#e5e2e1] p-1.5 uppercase font-bold"
            style={HEAD}
          >
            <option value="guideline">Guideline (PDF)</option>
            <option value="logo">Logo Variation</option>
            <option value="reference">Style Guide / Asset</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            value={fileCaption}
            onChange={(e) => setFileCaption(e.target.value)}
            placeholder="Add caption (e.g. primary color theme)"
            className="flex-1 bg-[#0e0e0e] border-2 border-black text-xs text-[#e5e2e1] p-1.5"
            style={BODY}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || sending}
            className="px-3 py-1.5 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#D83C14] hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
            style={HEAD}
          >
            <Upload className="w-3 h-3" />
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,text/markdown"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                void uploadFile(file)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t-4 border-black p-3 bg-[#0e0e0e]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Analyze attached files and suggest brand theme...'
            rows={2}
            className="flex-1 bg-[#1c1b1b] border-2 border-black p-2 text-sm text-[#e5e2e1] outline-none focus:border-[#D83C14] resize-none"
            style={BODY}
            disabled={sending}
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !input.trim()}
            className="px-3 py-2 border-4 border-black bg-[#D83C14] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[3px_3px_0px_#000] disabled:opacity-40 transition-all flex items-center gap-1"
            style={HEAD}
          >
            <Send className="w-3 h-3" />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
