import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'nausica',
  description: 'A daily journal. One prompt. Write privately or share.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
