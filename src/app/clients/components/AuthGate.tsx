'use client'

import { useState, useEffect, useRef } from 'react'
import { ClientConfig } from '../types'

interface Props {
  config: ClientConfig
  slug: string
  children: React.ReactNode
}

export default function AuthGate({ config, slug, children }: Props) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const storageKey = `nyx-portal-${slug}`

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey)
    if (stored === 'ok') setAuthenticated(true)
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [storageKey])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      if (password === config.auth.password) {
        sessionStorage.setItem(storageKey, 'ok')
        setAuthenticated(true)
      } else {
        setError('Incorrect password. Please try again.')
        setShake(true)
        setTimeout(() => setShake(false), 600)
        setPassword('')
        inputRef.current?.focus()
      }
      setSubmitting(false)
    }, 400)
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#FAF7F2' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${config.brand.primary} transparent transparent transparent` }}
        />
      </div>
    )
  }

  if (authenticated) return <>{children}</>

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#FAF7F2' }}
    >
      <div
        className={`w-full max-w-sm bg-white rounded-2xl p-8 transition-transform ${shake ? 'animate-shake' : ''}`}
        style={{
          boxShadow: '0 4px 40px rgba(26,42,94,0.08)',
        }}
      >
        {/* Logo / brand mark */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: `${config.brand.primary}15` }}
          >
            <span className="text-2xl font-bold" style={{ color: config.brand.primary, fontFamily: 'var(--font-playfair)' }}>
              {config.client.name.charAt(0)}
            </span>
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
          >
            {config.client.name}
          </h1>
          <p className="text-sm" style={{ color: '#6B6B6B', fontFamily: 'var(--font-inter)' }}>
            Client Portal — Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="Enter portal password"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                fontFamily: 'var(--font-inter)',
                background: '#FAF7F2',
                border: `1.5px solid ${error ? '#E91E8C' : '#E8E4DC'}`,
                color: '#1A2A5E',
              }}
              onFocus={(e) =>
                (e.target.style.border = `1.5px solid ${config.brand.primary}`)
              }
              onBlur={(e) =>
                (e.target.style.border = `1.5px solid ${error ? '#E91E8C' : '#E8E4DC'}`)
              }
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-2 text-xs" style={{ color: '#E91E8C', fontFamily: 'var(--font-inter)' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{
              background: config.brand.primary,
              fontFamily: 'var(--font-inter)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={(e) =>
              !submitting && ((e.target as HTMLElement).style.opacity = '0.88')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.opacity = '1')
            }
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.8) transparent transparent transparent' }}
                />
                Verifying…
              </span>
            ) : (
              'Enter Portal'
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs" style={{ color: '#6B6B6B', fontFamily: 'var(--font-inter)' }}>
        Built by{' '}
        <a
          href="https://nyxstudio.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: config.brand.primary }}
        >
          NYX Studio
        </a>
      </p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}
