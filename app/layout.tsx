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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={rokettoFont.variable}>{children}</body>
    </html>
  )
}
