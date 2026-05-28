import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nausica',
  description: 'A daily journal. One prompt. Write privately or share.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
