'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Entry {
  id: string
  content: string
  visibility: string
  word_count: number
  created_at: string
  prompt_id: string
}

interface Props {
  entries: Entry[]
  promptMap: Record<string, { id: string; text: string; date: string }>
}

export default function JournalClient({ entries, promptMap }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const formatDate = (ts: string) => {
    return new Date(ts).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  const visibilityLabel = (v: string) => {
    if (v === 'community') return 'Community'
    return 'Private'
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* Header */}
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
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="10" viewBox="0 0 112 44" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="56" cy="22" rx="56" ry="22" fill="none" stroke="#c4703a" strokeWidth="2.5"/>
            <ellipse cx="56" cy="22" rx="38" ry="15" fill="none" stroke="#c4703a" strokeWidth="1.8" opacity="0.65"/>
            <ellipse cx="56" cy="22" rx="20" ry="8" fill="none" stroke="#c4703a" strokeWidth="1.2" opacity="0.35"/>
            <ellipse cx="56" cy="22" rx="6" ry="2.5" fill="#c4703a" opacity="0.5"/>
          </svg>
          <span style={{ fontFamily: 'Lora, serif', fontSize: '20px', letterSpacing: '-0.02em', color: 'var(--ink)', fontStyle: 'italic', textDecoration: 'none' }}>
            nausica
          </span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/journal" style={{ fontSize: '13px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>Journal</Link>
          <Link href="/community" style={{ fontSize: '13px', color: 'var(--ink-muted)', textDecoration: 'none' }}>Community</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Your entries
          </p>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '26px', color: 'var(--ink)', fontWeight: 400 }}>
            Journal
          </h1>
          {entries.length > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {entries.reduce((sum, e) => sum + (e.word_count || 0), 0).toLocaleString()} words total
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'Lora, serif', fontSize: '17px', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
              No entries yet.
            </p>
            <Link href="/" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
              Write today's entry →
            </Link>
          </div>
        ) : (
          <div>
            {entries.map((entry, i) => {
              const prompt = promptMap[entry.prompt_id]
              const isExpanded = expanded === entry.id
              const isLong = entry.content.length > 500
              const preview = isLong && !isExpanded ? entry.content.slice(0, 500) + '…' : entry.content

              return (
                <div
                  key={entry.id}
                  className="fade-up"
                  style={{
                    borderBottom: '1px solid var(--paper-border)',
                    padding: '1.75rem 0',
                    animationDelay: `${i * 0.04}s`,
                    opacity: 0,
                  }}
                >
                  {/* Date + meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--ink-faint)', marginBottom: '0.25rem' }}>
                        {formatDate(entry.created_at)}
                      </p>
                      {prompt && (
                        <p style={{ fontFamily: 'Lora, serif', fontSize: '13px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                          "{prompt.text}"
                        </p>
                      )}
                    </div>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '99px',
                      border: '1px solid var(--paper-border)',
                      color: entry.visibility === 'community' ? 'var(--accent)' : 'var(--ink-faint)',
                      background: entry.visibility === 'community' ? 'var(--accent-soft)' : 'transparent',
                      whiteSpace: 'nowrap',
                      marginLeft: '1rem',
                    }}>
                      {visibilityLabel(entry.visibility)}
                    </span>
                  </div>

                  {/* Content */}
                  <p style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '17px',
                    lineHeight: 1.8,
                    color: 'var(--ink)',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '0.75rem',
                  }}>
                    {preview}
                  </p>

                  {/* Footer */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {isLong && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : entry.id)}
                        style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {isExpanded ? 'show less' : 'read more'}
                      </button>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{entry.word_count} words</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
