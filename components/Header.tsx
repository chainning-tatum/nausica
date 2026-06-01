'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  user: any
  activePage?: 'home' | 'journal' | 'community'
  onSignIn?: () => void
}

export default function Header({ user, activePage, onSignIn }: Props) {
  const supabase = createClient()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <header style={{
      borderBottom: '1px solid var(--paper-border)',
      padding: '0 2rem',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      background: 'var(--paper)',
      zIndex: 10,
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'Lora, serif', fontSize: '20px', letterSpacing: '-0.02em', color: 'var(--ink)', fontStyle: 'italic' }}>
          nausica
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{today}</span>
        {user && (
          <>
            <Link href="/journal" style={{
              fontSize: '13px',
              color: activePage === 'journal' ? 'var(--ink)' : 'var(--ink-muted)',
              textDecoration: 'none',
              fontWeight: activePage === 'journal' ? 500 : 300,
            }}>Journal</Link>
            <Link href="/community" style={{
              fontSize: '13px',
              color: activePage === 'community' ? 'var(--ink)' : 'var(--ink-muted)',
              textDecoration: 'none',
              fontWeight: activePage === 'community' ? 500 : 300,
            }}>Community</Link>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
              style={{ fontSize: '13px', color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              sign out
            </button>
          </>
        )}
        {!user && onSignIn && (
          <button
            onClick={onSignIn}
            style={{ fontSize: '13px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            sign in
          </button>
        )}
        {!user && !onSignIn && (
          <Link href="/" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            sign in
          </Link>
        )}
      </div>
    </header>
  )
}
