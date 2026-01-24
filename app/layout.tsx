import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const montserratLight = localFont({
  src: '../font/fonte/Montserrat-Light.ttf',
  variable: '--font-montserrat-light',
  display: 'swap',
  weight: '300',
})

const montserratBold = localFont({
  src: '../font/fonte/Montserrat-Bold.ttf',
  variable: '--font-montserrat-bold',
  display: 'swap',
  weight: '700',
})

export const metadata: Metadata = {
  title: 'Alimentação Sem Medo',
  description: 'Serviço contínuo de tranquilidade alimentar para quem tem medo de comer',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
  themeColor: '#0F2E2B',
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
        <meta name="theme-color" content="#0F2E2B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${montserratLight.variable} ${montserratBold.variable} flex flex-col min-h-screen`}>
        <div className="flex-1">{children}</div>
        <footer
          className="mt-auto border-t py-4 px-4 sm:px-6 text-center"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.05)',
            background: 'rgba(15, 46, 43, 0.5)',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
          }}
        >
          <p className="text-[11px] sm:text-xs text-text-secondary/70 max-w-3xl mx-auto leading-relaxed">
            Todos os cardápios foram confeccionados pela nutricionista e pelo gastrônomo do Planeta Intestino, com a avaliação final do Dr. Fernando Lemos.
          </p>
          <p className="text-[11px] sm:text-xs text-text-secondary/60 mt-1.5">
            * Estes cardápios não substituem a consulta médica e com a nutricionista.
          </p>
        </footer>
      </body>
    </html>
  )
}
