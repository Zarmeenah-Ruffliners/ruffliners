export const metadata = {
  title: 'Ruff Liners — Euka Dashboard',
  description: 'TikTok Shop affiliate performance dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0b0d' }}>
        {children}
      </body>
    </html>
  )
}
