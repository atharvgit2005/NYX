'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export type Platform = 'INSTAGRAM' | 'TIKTOK'
export type PackageType = 'TRIAL' | 'MONTHLY_RETAINER' | 'CUSTOM'

export interface BrandFormValues {
  brandName: string
  clientSlug: string
  contactEmail: string
  tagline: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  instagramHandle: string
  tiktokHandle: string
  platforms: Platform[]
  packageType: PackageType
  campaignStart: string // YYYY-MM-DD
  campaignEnd: string // YYYY-MM-DD
  agencyContactName: string
  agencyContactEmail: string
}

interface Props {
  mode: 'create' | 'edit'
  initial?: Partial<BrandFormValues>
  /** When editing, the slug is fixed and not editable. */
  lockSlug?: boolean
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/

export default function BrandForm({ mode, initial, lockSlug }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [v, setV] = useState<BrandFormValues>({
    brandName: initial?.brandName ?? '',
    clientSlug: initial?.clientSlug ?? '',
    contactEmail: initial?.contactEmail ?? '',
    tagline: initial?.tagline ?? '',
    primaryColor: initial?.primaryColor ?? '#E8441A',
    secondaryColor: initial?.secondaryColor ?? '#ffd65b',
    accentColor: initial?.accentColor ?? '',
    instagramHandle: initial?.instagramHandle ?? '',
    tiktokHandle: initial?.tiktokHandle ?? '',
    platforms: initial?.platforms ?? ['INSTAGRAM'],
    packageType: initial?.packageType ?? 'TRIAL',
    campaignStart: initial?.campaignStart ?? '',
    campaignEnd: initial?.campaignEnd ?? '',
    agencyContactName: initial?.agencyContactName ?? 'NYX Studio',
    agencyContactEmail: initial?.agencyContactEmail ?? '',
  })
  // Track whether the user has edited the slug manually so we stop
  // auto-deriving it from the brand name.
  const [slugDirty, setSlugDirty] = useState(mode === 'edit')

  function set<K extends keyof BrandFormValues>(key: K, val: BrandFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: val }))
  }

  function onBrandNameChange(name: string) {
    set('brandName', name)
    if (!slugDirty) set('clientSlug', slugify(name))
  }

  function togglePlatform(p: Platform) {
    set(
      'platforms',
      v.platforms.includes(p) ? v.platforms.filter((x) => x !== p) : [...v.platforms, p],
    )
  }

  function clientValidation(): string | null {
    if (!v.brandName.trim()) return 'Brand name is required'
    if (!v.clientSlug.trim()) return 'Slug is required'
    if (mode === 'create' && !v.contactEmail.includes('@')) return 'Valid contact email required'
    if (!HEX.test(v.primaryColor)) return 'Primary colour must be a hex like #E8441A'
    if (!HEX.test(v.secondaryColor)) return 'Secondary colour must be hex'
    if (v.accentColor && !HEX.test(v.accentColor)) return 'Accent colour must be hex'
    if (v.platforms.length === 0) return 'Pick at least one platform'
    if (!v.campaignStart || !v.campaignEnd) return 'Campaign start and end dates are required'
    if (new Date(v.campaignEnd) < new Date(v.campaignStart))
      return 'Campaign end must be after start'
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = clientValidation()
    if (err) {
      toast.error(err)
      return
    }
    startTransition(async () => {
      const url =
        mode === 'create'
          ? '/api/portal/admin/brands'
          : `/api/portal/admin/brands/${v.clientSlug}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const body = {
        ...v,
        // Server expects these as plain strings; campaign dates parsed as Date.
        campaignStart: v.campaignStart,
        campaignEnd: v.campaignEnd,
        accentColor: v.accentColor || null,
        instagramHandle: v.instagramHandle || null,
        tiktokHandle: v.tiktokHandle || null,
        agencyContactName: v.agencyContactName || null,
        agencyContactEmail: v.agencyContactEmail || null,
        tagline: v.tagline || null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Request failed' }))
        toast.error(error)
        return
      }
      const data = await res.json()
      if (mode === 'create') {
        toast.success(`${v.brandName} created`)
        const slug = data?.partner?.clientSlug ?? v.clientSlug
        router.push(`/portal/admin/${slug}/posts`)
      } else {
        toast.success('Brand updated')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" style={BODY}>
      <Section title="Identity">
        <Field label="*BRAND_NAME" required>
          <input
            value={v.brandName}
            onChange={(e) => onBrandNameChange(e.target.value)}
            placeholder="Dessertino"
            className="brutal-input"
            style={HEAD}
            required
          />
        </Field>
        <Field
          label="*SLUG"
          hint={lockSlug ? 'Slug is locked once a brand is created' : 'lowercase, hyphens only'}
          required
        >
          <div className="flex items-center bg-[#0e0e0e] border-4 border-black overflow-hidden focus-within:border-[#E8441A] transition">
            <span className="px-3 py-3 text-xs text-[#e4beb5] font-mono border-r-4 border-black">
              /portal/
            </span>
            <input
              value={v.clientSlug}
              onChange={(e) => {
                setSlugDirty(true)
                set('clientSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }}
              placeholder="dessertino"
              className="flex-1 px-3 py-3 bg-transparent text-sm font-mono text-[#e5e2e1] outline-none disabled:opacity-50"
              required
              disabled={lockSlug}
            />
          </div>
        </Field>
        {mode === 'create' && (
          <Field label="*CONTACT_EMAIL" hint="The brand partner signs in with this email" required>
            <input
              type="email"
              value={v.contactEmail}
              onChange={(e) => set('contactEmail', e.target.value)}
              placeholder="contact@brand.com"
              className="brutal-input"
              style={HEAD}
              required
            />
          </Field>
        )}
        <Field label="TAGLINE">
          <input
            value={v.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="Shakes and More"
            className="brutal-input"
            style={HEAD}
          />
        </Field>
      </Section>

      <Section title="Theming">
        <ColorField label="*PRIMARY" value={v.primaryColor} onChange={(x) => set('primaryColor', x)} />
        <ColorField
          label="*SECONDARY"
          value={v.secondaryColor}
          onChange={(x) => set('secondaryColor', x)}
        />
        <ColorField
          label="ACCENT (OPTIONAL)"
          value={v.accentColor}
          onChange={(x) => set('accentColor', x)}
          allowEmpty
        />
      </Section>

      <Section title="Social handles">
        <Field label="INSTAGRAM_HANDLE" hint="Without the @ — we add it on display">
          <input
            value={v.instagramHandle}
            onChange={(e) => set('instagramHandle', e.target.value)}
            placeholder="dessertino.pune"
            className="brutal-input"
            style={HEAD}
          />
        </Field>
        <Field label="TIKTOK_HANDLE">
          <input
            value={v.tiktokHandle}
            onChange={(e) => set('tiktokHandle', e.target.value)}
            placeholder=""
            className="brutal-input"
            style={HEAD}
          />
        </Field>
      </Section>

      <Section title="Campaign">
        <Field label="*PLATFORMS" required>
          <div className="flex gap-3 flex-wrap">
            {(['INSTAGRAM', 'TIKTOK'] as Platform[]).map((p) => {
              const active = v.platforms.includes(p)
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-4 py-2 border-4 border-black text-xs font-bold uppercase tracking-widest transition-all ${
                    active
                      ? 'bg-[#E8441A] text-white'
                      : 'bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#2a2a2a]'
                  }`}
                  style={HEAD}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </Field>
        <Field label="*PACKAGE_TYPE" required>
          <div className="flex gap-3 flex-wrap">
            {(
              [
                ['TRIAL', 'Trial'],
                ['MONTHLY_RETAINER', 'Monthly Retainer'],
                ['CUSTOM', 'Custom'],
              ] as const
            ).map(([val, label]) => {
              const active = v.packageType === val
              return (
                <button
                  type="button"
                  key={val}
                  onClick={() => set('packageType', val)}
                  className={`px-4 py-2 border-4 border-black text-xs font-bold uppercase tracking-widest transition-all ${
                    active
                      ? 'bg-[#E8441A] text-white'
                      : 'bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#2a2a2a]'
                  }`}
                  style={HEAD}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="*CAMPAIGN_START" required>
            <input
              type="date"
              value={v.campaignStart}
              onChange={(e) => set('campaignStart', e.target.value)}
              className="brutal-input"
              style={HEAD}
              required
            />
          </Field>
          <Field label="*CAMPAIGN_END" required>
            <input
              type="date"
              value={v.campaignEnd}
              onChange={(e) => set('campaignEnd', e.target.value)}
              className="brutal-input"
              style={HEAD}
              required
            />
          </Field>
        </div>
      </Section>

      <Section title="Agency contact">
        <Field label="AGENCY_CONTACT_NAME">
          <input
            value={v.agencyContactName}
            onChange={(e) => set('agencyContactName', e.target.value)}
            placeholder="NYX Studio"
            className="brutal-input"
            style={HEAD}
          />
        </Field>
        <Field label="AGENCY_CONTACT_EMAIL">
          <input
            type="email"
            value={v.agencyContactEmail}
            onChange={(e) => set('agencyContactEmail', e.target.value)}
            placeholder="hello@nyxstudio.tech"
            className="brutal-input"
            style={HEAD}
          />
        </Field>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href="/portal/admin"
          className="px-5 py-3 border-4 border-black text-[#e4beb5] hover:bg-[#2a2a2a] text-xs font-black uppercase tracking-widest"
          style={{ ...HEAD, backgroundColor: '#0e0e0e' }}
        >
          ← Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 border-4 border-black bg-[#E8441A] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] disabled:opacity-50 transition-all"
          style={HEAD}
        >
          {pending
            ? mode === 'create'
              ? 'CREATING…'
              : 'SAVING…'
            : mode === 'create'
              ? 'CREATE BRAND →'
              : 'SAVE CHANGES →'}
        </button>
      </div>

      <style jsx global>{`
        .brutal-input {
          width: 100%;
          background: #0e0e0e;
          border: 4px solid #000;
          padding: 0.85rem 1rem;
          color: #e5e2e1;
          outline: none;
          transition: border-color 0.15s;
        }
        .brutal-input::placeholder {
          color: #353534;
        }
        .brutal-input:focus {
          border-color: #e8441a;
        }
      `}</style>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-l-4 border-[#E8441A] pl-6 space-y-5">
      <legend
        className="text-xs uppercase tracking-[0.2em] text-[#E8441A] font-black mb-2"
        style={HEAD}
      >
        *{title.toUpperCase()}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] mb-2"
        style={HEAD}
      >
        {required ? '*' : ''}
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-[#ab8981] mt-1 italic" style={BODY}>
          {hint}
        </p>
      )}
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
  allowEmpty,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  allowEmpty?: boolean
}) {
  return (
    <Field label={label}>
      <div className="flex items-stretch gap-3">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-12 border-4 border-black bg-transparent cursor-pointer p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={allowEmpty ? 'optional' : '#E8441A'}
          className="brutal-input flex-1 font-mono"
          style={HEAD}
        />
      </div>
    </Field>
  )
}
