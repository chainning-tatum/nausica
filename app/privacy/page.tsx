import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PrivacyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid var(--paper-border)',
        padding: '0 2rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
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
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Legal
        </p>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: '28px', color: 'var(--ink)', fontWeight: 400, marginBottom: '0.5rem' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-faint)', marginBottom: '3rem' }}>
          Last updated June 1, 2026
        </p>

        <div style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--ink)', fontFamily: 'Lora, serif' }}>

          <p style={{ marginBottom: '1.5rem' }}>
            Nausica is a daily journaling app. We take your privacy seriously. This policy explains what we collect, what we don't, and how your writing is handled.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            What we collect
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            When you sign in with Google, we receive your email address and name from Google. We use your email address solely to identify your account. We do not receive your Google password.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            We store the journal entries you write in Nausica, along with the date and visibility setting you chose (private or community).
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            What we don't do
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We do not sell your data. We do not share your data with third parties. We do not use your journal entries for advertising or train any models on them. We do not send marketing emails.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Your entries
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Entries marked <em>private</em> are visible only to you. Entries marked <em>community</em> are shared anonymously in the community feed — your name and email are never shown alongside them.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            You can delete your entries at any time. To delete your account and all associated data, email us at the address below.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Data storage
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Your data is stored securely using Supabase, hosted on AWS infrastructure. We use industry-standard security practices to protect your information.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Contact
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Questions about this policy? Email us at{' '}
            <a href="mailto:hello@nausica.app" style={{ color: 'var(--accent)' }}>hello@nausica.app</a>.
          </p>

        </div>
      </main>
    </div>
  )
}
