'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  className?: string
}

export default function ThumbnailUploader({ value, onChange, className }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/portal/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Upload failed' }))
        toast.error(error)
        return
      }
      const { url } = await res.json()
      onChange(url)
      toast.success('Thumbnail uploaded')
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void uploadFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void uploadFile(file)
  }

  return (
    <div className={className}>
      {value ? (
        <div className="border-4 border-black bg-[#0e0e0e] flex items-stretch">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Thumbnail preview"
            className="w-32 h-32 object-cover border-r-4 border-black bg-[#1c1b1b]"
          />
          <div className="flex-1 flex flex-col justify-between p-4">
            <div className="text-[11px] text-[#e4beb5] font-mono break-all" style={HEAD}>
              {value.replace(/^https?:\/\//, '')}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2 border-2 border-black bg-[#1c1b1b] text-[#e5e2e1] hover:bg-[#D83C14] hover:text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                style={HEAD}
              >
                {uploading ? 'UPLOADING…' : 'Replace'}
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={uploading}
                className="px-3 py-2 border-2 border-black bg-[#1c1b1b] text-[#e5e2e1] hover:bg-[#93000a] hover:text-[#ffdad6] text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                style={HEAD}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={`w-full border-4 border-dashed p-8 text-center transition-all disabled:opacity-50 ${
            dragging
              ? 'border-[#D83C14] bg-[#1c1b1b]'
              : 'border-[#353534] bg-[#0e0e0e] hover:border-[#D83C14]'
          }`}
          style={HEAD}
        >
          <span
            className="material-symbols-outlined text-3xl text-[#e4beb5]"
            aria-hidden
          >
            cloud_upload
          </span>
          <div className="mt-2 text-xs uppercase tracking-widest text-[#e4beb5]">
            {uploading ? 'UPLOADING…' : 'CLICK_OR_DROP_TO_UPLOAD'}
          </div>
          <div className="text-[10px] text-[#ab8981] mt-1">
            JPEG · PNG · WebP · max 5 MB
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPickFile}
        className="hidden"
      />
    </div>
  )
}
