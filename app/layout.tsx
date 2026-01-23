import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const rokettoFont = localFont({
  src: '../font/fonte/Roketto.ttf',
  variable: '--font-roketto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Alimentação Sem Medo',
  description: 'Serviço contínuo de tranquilidade alimentar para quem tem medo de comer',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
  themeColor: '#0E0B14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#0E0B14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={rokettoFont.variable}>{children}</body>
    </html>
  )
}
