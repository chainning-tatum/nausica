'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  user: any
  promptsWithEntries: { id: string; text: string; date: string }[]
  entriesByPrompt: Record<string, any[]>
}

export default function CommunityClient({ user, promptsWithEntries, entriesByPrompt }: Props) {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(
    promptsWithEntries[0]?.id || null
  )
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    })
  }

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
        <Link href="/" style={{ fontFamily: 'Lora, serif', fontSize: '20px', letterSpacing: '-0.02em', color: 'var(--ink)', textDecoration: 'none' }}>
          nausica
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          {user && <Link href="/journal" style={{ fontSize: '13px', color: 'var(--ink-muted)', textDecoration: 'none' }}>Journal</Link>}
          <Link href="/community" style={{ fontSize: '13px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>Community</Link>
        </nav>
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Everyone's writing
          </p>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '26px', color: 'var(--ink)', fontWeight: 400 }}>
            Community
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
            Anonymous entries, past and present.
          </p>
        </div>

        {promptsWithEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'Lora, serif', fontSize: '17px', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
              No community entries yet.
            </p>
            <Link href="/" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>
              Be the first to share →
            </Link>
          </div>
        ) : (
          <div>
            {promptsWithEntries.map((prompt, pi) => {
              const entries = entriesByPrompt[prompt.id] || []
              const isOpen = expandedPrompt === prompt.id

              return (
                <div
                  key={prompt.id}
                  className="fade-up"
                  style={{
                    borderBottom: '1px solid var(--paper-border)',
                    animationDelay: `${pi * 0.04}s`,
                    opacity: 0,
                  }}
                >
                  {/* Prompt header — always visible, clickable to expand */}
                  <button
                    onClick={() => setExpandedPrompt(isOpen ? null : prompt.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '1.5rem 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--ink-faint)', marginBottom: '0.35rem' }}>
                        {formatDate(prompt.date)}
                      </p>
                      <p style={{
                        fontFamily: 'Lora, serif',
                        fontSize: '17px',
                        color: 'var(--ink)',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                      }}>
                        "{prompt.text}"
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                      </span>
                      <span style={{
                        fontSize: '16px',
                        color: 'var(--ink-faint)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                      }}>
                        ↓
                      </span>
                    </div>
                  </button>

                  {/* Entries — shown when expanded */}
                  {isOpen && (
                    <div style={{ paddingBottom: '1.5rem' }}>
                      {entries.map((entry, ei) => {
                        const isEntryExpanded = expandedEntry === entry.id
                        const isLong = entry.content.length > 400
                        const preview = isLong && !isEntryExpanded
                          ? entry.content.slice(0, 400) + '…'
                          : entry.content

                        return (
                          <div
                            key={entry.id}
                            style={{
                              padding: '1.25rem 1.25rem',
                              background: 'var(--paper-warm)',
                              borderRadius: '8px',
                              marginBottom: ei < entries.length - 1 ? '0.75rem' : 0,
                            }}
                          >
                            <p style={{
                              fontFamily: 'Lora, serif',
                              fontSize: '16px',
                              lineHeight: 1.8,
                              color: 'var(--ink)',
                              whiteSpace: 'pre-wrap',
                              marginBottom: '0.75rem',
                            }}>
                              {preview}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              {isLong && (
                                <button
                                  onClick={() => setExpandedEntry(isEntryExpanded ? null : entry.id)}
                                  style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  {isEntryExpanded ? 'show less' : 'read more'}
                                </button>
                              )}
                              <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{entry.word_count} words</span>
                              <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>·</span>
                              <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{formatTime(entry.created_at)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
