'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,24,20,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--paper)',
          borderRadius: '12px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid var(--paper-border)',
        }}
      >
        {!sent ? (
          <>
            <h2 style={{ fontFamily: 'Lora, serif', fontSize: '22px', marginBottom: '0.5rem', color: 'var(--ink)' }}>
              Start writing
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Enter your email and we'll send you a magic link — no password needed.
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '15px',
                border: '1px solid var(--paper-border)',
                borderRadius: '6px',
                background: 'var(--paper-warm)',
                color: 'var(--ink)',
                marginBottom: '0.75rem',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: email.trim() && !loading ? 'pointer' : 'default',
                background: email.trim() ? 'var(--ink)' : 'var(--paper-border)',
                color: email.trim() ? 'var(--paper)' : 'var(--ink-faint)',
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '1rem', textAlign: 'center' }}>
              No account needed — signing in creates one automatically.
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '1rem' }}>✉️</div>
            <h2 style={{ fontFamily: 'Lora, serif', fontSize: '20px', marginBottom: '0.5rem', color: 'var(--ink)' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              We sent a magic link to <strong>{email}</strong>. Click it to sign in and start writing.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: '1.5rem', fontSize: '13px', color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
