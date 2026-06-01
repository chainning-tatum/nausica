'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthModal from './AuthModal'
import Header from './Header'

type Visibility = 'private' | 'community'

interface Props {
  user: any
  prompt: any
  userEntry: any
  publicEntries: any[]
}

export default function HomeClient({ user, prompt, userEntry, publicEntries: initialEntries }: Props) {
  const [content, setContent] = useState(userEntry?.content || '')
  const [visibility, setVisibility] = useState<Visibility>(
    userEntry?.visibility === 'community' ? 'community' : 'private'
  )
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showAuth, setShowAuth] = useState(false)
  const [tab, setTab] = useState<'write' | 'read'>('write')
  const [publicEntries, setPublicEntries] = useState(initialEntries)
  const [wordCount, setWordCount] = useState(0)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const supabase = createClient()

  // Listen for auth state changes - only redirect once on SIGNED_IN
  useEffect(() => {
    let redirected = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && !redirected && !user) {
        redirected = true
        window.location.href = '/'
      }
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [content])

  const save = useCallback(async () => {
    if (!user || !prompt || !content.trim()) return
    setSaveState('saving')
    const payload = {
      user_id: user.id,
      prompt_id: prompt.id,
      content,
      visibility,
    }
    if (userEntry) {
      await supabase.from('entries').update({ content, visibility, updated_at: new Date().toISOString() }).eq('id', userEntry.id)
    } else {
      await supabase.from('entries').insert(payload)
    }
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }, [user, prompt, content, visibility, userEntry, supabase])

  // Autosave every 3 seconds when content changes
  useEffect(() => {
    if (!user || !content.trim()) return
    const timer = setTimeout(save, 3000)
    return () => clearTimeout(timer)
  }, [content, visibility, save, user])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const visibilityOptions: { value: Visibility; label: string; desc: string }[] = [
    { value: 'private', label: 'Journal', desc: 'Only you' },
    { value: 'community', label: 'Community', desc: 'Shared anonymously' },
  ]

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      <Header user={user} activePage="home" onSignIn={() => setShowAuth(true)} />

      {/* Tab bar */}
      <div style={{
        borderBottom: '1px solid var(--paper-border)',
        display: 'flex',
        padding: '0 2rem',
        gap: '2rem',
      }}>
        {(['write', 'read'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 0',
              fontSize: '13px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: tab === t ? 'var(--ink)' : 'var(--ink-faint)',
              borderBottom: tab === t ? '1.5px solid var(--ink)' : '1.5px solid transparent',
              fontWeight: tab === t ? 500 : 300,
              marginBottom: '-1px',
              letterSpacing: '0.02em',
            }}
          >
            {t === 'write' ? 'write' : `read (${publicEntries.length})`}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Today's prompt */}
        <div className="fade-up" style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            today's prompt
          </p>
          <p style={{
            fontFamily: 'Lora, serif',
            fontSize: '22px',
            lineHeight: 1.5,
            color: 'var(--ink)',
            fontStyle: 'italic',
          }}>
            {prompt ? `"${prompt.text}"` : 'No prompt for today yet.'}
          </p>
        </div>

        {tab === 'write' && (
          <div className="fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            {!user ? (
              // Teaser for logged out users
              <div>
                <div style={{
                  border: '1px solid var(--paper-border)',
                  borderRadius: '8px',
                  padding: '2rem',
                  background: 'var(--paper-warm)',
                  marginBottom: '1.5rem',
                  cursor: 'text',
                }} onClick={() => setShowAuth(true)}>
                  <p style={{ fontFamily: 'Lora, serif', fontSize: '17px', color: 'var(--ink-faint)', fontStyle: 'italic', lineHeight: 1.8 }}>
                    Start writing here...
                  </p>
                </div>
              </div>
            ) : (
              // Writing experience
              <div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Let your thoughts arrive..."
                  style={{
                    width: '100%',
                    minHeight: '280px',
                    fontSize: '18px',
                    lineHeight: 1.8,
                    color: 'var(--ink)',
                    fontFamily: 'Lora, serif',
                    padding: '1.5rem',
                    border: '1px solid var(--paper-border)',
                    borderRadius: '8px',
                    background: 'var(--paper-warm)',
                    marginBottom: '1rem',
                  }}
                />

                {/* Footer controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  {/* Visibility toggle */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {visibilityOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setVisibility(opt.value)}
                        title={opt.desc}
                        style={{
                          width: '100px',
                          padding: '6px 0',
                          borderRadius: '99px',
                          fontSize: '12px',
                          border: '1px solid',
                          cursor: 'pointer',
                          borderColor: visibility === opt.value ? 'var(--accent)' : 'var(--paper-border)',
                          background: visibility === opt.value ? 'var(--accent-soft)' : 'transparent',
                          color: visibility === opt.value ? 'var(--accent)' : 'var(--ink-muted)',
                          fontWeight: visibility === opt.value ? 500 : 300,
                          transition: 'all 0.15s',
                          textAlign: 'center',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>
                      {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                    {saveState === 'saving' && <span className="saving" style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>saving…</span>}
                    {saveState === 'saved' && <span style={{ fontSize: '12px', color: 'var(--accent)' }}>saved</span>}
                    <button
                      onClick={save}
                      disabled={!content.trim()}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '99px',
                        fontSize: '13px',
                        fontWeight: 500,
                        border: 'none',
                        cursor: content.trim() ? 'pointer' : 'default',
                        background: content.trim() ? 'var(--ink)' : 'var(--paper-border)',
                        color: content.trim() ? 'var(--paper)' : 'var(--ink-faint)',
                        transition: 'all 0.15s',
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Visibility hint */}
                <p style={{ fontSize: '12px', color: 'var(--ink-faint)', marginTop: '0.75rem' }}>
                  {visibility === 'private' && 'Only you can see this entry.'}
                  {visibility === 'community' && 'This will appear in the community feed, anonymously.'}
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'read' && (
          <div className="fade-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
            {publicEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p style={{ fontFamily: 'Lora, serif', fontSize: '17px', color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                  No entries yet today.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--ink-faint)', marginTop: '0.5rem' }}>
                  Be the first to write.
                </p>
              </div>
            ) : (
              <div>
                {publicEntries.map((entry, i) => {
                  const isExpanded = expandedEntry === entry.id
                  const isLong = entry.content.length > 400
                  const preview = isLong && !isExpanded ? entry.content.slice(0, 400) + '…' : entry.content

                  return (
                    <div
                      key={entry.id}
                      className="entry-card fade-up"
                      style={{
                        padding: '1.75rem 0',
                        animationDelay: `${i * 0.05}s`,
                        opacity: 0,
                      }}
                    >
                      <p style={{
                        fontFamily: 'Lora, serif',
                        fontSize: '17px',
                        lineHeight: 1.8,
                        color: 'var(--ink)',
                        marginBottom: '0.75rem',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {preview}
                      </p>
                      {isLong && (
                        <button
                          onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                          style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {isExpanded ? 'show less' : 'read more'}
                        </button>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', alignItems: 'center' }}>
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
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--paper-border)', padding: '1.5rem 2rem', marginTop: '4rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>© 2026 nausica</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/privacy" style={{ fontSize: '12px', color: 'var(--ink-faint)', textDecoration: 'none' }}>Privacy</a>
            <a href="/terms" style={{ fontSize: '12px', color: 'var(--ink-faint)', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
