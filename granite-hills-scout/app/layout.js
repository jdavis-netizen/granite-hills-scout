import './globals.css'

export const metadata = {
  title: 'Granite Hills Scout',
  description: 'Baseball pitcher scouting app for Granite Hills',
  manifest: '/manifest.json',
  themeColor: '#1e293b',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GH Scout',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GH Scout" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-slate-100">{children}</body>
    </html>
  )
}
