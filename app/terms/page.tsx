import Link from 'next/link'

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-faint)', marginBottom: '3rem' }}>
          Last updated June 1, 2026
        </p>

        <div style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--ink)', fontFamily: 'Lora, serif' }}>

          <p style={{ marginBottom: '1.5rem' }}>
            By using Nausica, you agree to these terms. They're short and written in plain language.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            What Nausica is
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Nausica is a daily journaling app. Each day we publish a prompt. You can write privately, or share your response anonymously with the community.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Your content
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Your journal entries belong to you. By sharing an entry to the community, you give Nausica permission to display it anonymously on the platform. You can change an entry back to private at any time.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Please don't post content that is harmful, threatening, or illegal. We reserve the right to remove content that violates this.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Your account
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            You need a Google account to use Nausica. You're responsible for keeping your account secure. You can delete your account at any time by contacting us.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Availability
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We do our best to keep Nausica running, but we can't guarantee uninterrupted availability. We may update or change features over time.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Limitation of liability
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Nausica is provided as-is. We're not liable for any loss of data or other damages arising from your use of the service.
          </p>

          <h2 style={{ fontSize: '17px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem', marginTop: '2.5rem', color: 'var(--ink)' }}>
            Contact
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Questions? Email us at{' '}
            <a href="mailto:hello@nausica.app" style={{ color: 'var(--accent)' }}>hello@nausica.app</a>.
          </p>

        </div>
      </main>
    </div>
  )
}
