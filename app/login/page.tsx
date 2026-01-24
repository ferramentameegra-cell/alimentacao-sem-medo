'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import IntestineBackground from '@/components/IntestineBackground'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok && data.sessionId) {
        // Salvar sessionId e email no localStorage de forma persistente
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('userEmail', email)
        
        // Verificar se a sessão foi salva corretamente
        const sessionSalva = localStorage.getItem('sessionId')
        const emailSalvo = localStorage.getItem('userEmail')
        
        if (sessionSalva && emailSalvo) {
          console.log('✅ Login realizado com sucesso. SessionId:', sessionSalva)
          
          // Aguardar um momento para garantir que tudo foi processado
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Verificar novamente antes de redirecionar
          const verificacao = await fetch('/api/auth/session', {
            headers: {
              'X-Session-Id': sessionSalva,
              'X-User-Email': emailSalvo,
            },
          })
          
          if (verificacao.ok) {
            // Sessão confirmada, redirecionar
            window.location.href = '/'
          } else {
            // Se verificação falhou, tentar novamente
            console.warn('⚠️ Verificação de sessão falhou, tentando novamente...')
            await new Promise(resolve => setTimeout(resolve, 500))
            window.location.href = '/'
          }
        } else {
          setErro('Erro ao salvar sessão. Tente novamente.')
          setCarregando(false)
        }
      } else {
        setErro(data.error || 'Email ou senha incorretos')
        setCarregando(false)
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setErro('Erro ao fazer login. Tente novamente.')
      setCarregando(false)
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at top center, rgba(110, 143, 61, 0.15), transparent 60%), linear-gradient(160deg, #0F2E2B 0%, #0C2623 40%, #081C1A 100%)'
      }}
    >
      <IntestineBackground />
      
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Logo */}
        <div className="flex justify-start mb-8 sm:mb-12 -ml-1">
          <Image
            src="/logo/logonovo.png"
            alt="Alimentação Sem Medo - Seu espaço seguro para comer sem medo"
            width={400}
            height={150}
            className="object-contain w-full max-w-[400px] h-auto"
            priority
          />
        </div>

        {/* Formulário de Login */}
        <div
          className="backdrop-blur-sm rounded-xl p-6 sm:p-8 lg:p-12"
          style={{
            background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
            border: '1px solid rgba(110, 143, 61, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-text-primary mb-3">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-bg-secondary/80 border border-accent-secondary/30 rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                placeholder="seu@email.com"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                }}
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-base font-semibold text-text-primary mb-3">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-5 py-4 bg-bg-secondary/80 border border-accent-secondary/30 rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/60 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                placeholder="••••••••"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                }}
              />
            </div>

            {erro && (
              <div
                className="p-4 rounded-xl border"
                style={{
                  background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
                  borderColor: 'rgba(110, 143, 61, 0.4)'
                }}
              >
                <p className="text-base text-accent-primary font-medium">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 px-6 rounded-lg text-base sm:text-lg font-bold transition-all duration-300 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(110,143,61,0.4)]"
              style={{
                background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                color: '#E9EFEA',
                boxShadow: '0 4px 16px rgba(110, 143, 61, 0.3)'
              }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/criar-conta')}
              className="text-base text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
            >
              Criar conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
