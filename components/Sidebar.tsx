'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import GenioLampada from './GenioLampada'
import MetaAgua from './MetaAgua'
import { DadosUsuarioAgua } from '@/lib/calculadora_agua'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [genioAberto, setGenioAberto] = useState(false)
  const [temCardapio, setTemCardapio] = useState(false)
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [dadosUsuarioAgua, setDadosUsuarioAgua] = useState<DadosUsuarioAgua | undefined>(undefined)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId')
        const userEmail = localStorage.getItem('userEmail')
        
        if (!sessionId && !userEmail) {
          setEmail('Visitante')
          setTemCardapio(false)
          setCarregando(false)
          return
        }

        const response = await fetch('/api/auth/session', {
          headers: {
            'X-Session-Id': sessionId || '',
            'X-User-Email': userEmail || '',
          },
        })

        if (response.ok) {
          const data = await response.json()
          
          // Se foi reautenticado, atualizar sessionId
          if (data.reautenticado && data.sessionId) {
            localStorage.setItem('sessionId', data.sessionId)
            console.log('✅ Sidebar: Reautenticação automática realizada')
          }
          
          if (data.conta) {
            // Verificar se tem cardápios
            if (data.conta.cardapios && data.conta.cardapios.length > 0) {
              setTemCardapio(true)
              
              // Carregar dados do usuário do último cardápio para meta de água
              try {
                const cardapiosResponse = await fetch('/api/cardapios', {
                  headers: {
                    'X-Session-Id': sessionId || '',
                    'X-User-Email': userEmail || '',
                  },
                })
                
                if (cardapiosResponse.ok) {
                  const cardapiosData = await cardapiosResponse.json()
                  if (cardapiosData.cardapios && cardapiosData.cardapios.length > 0) {
                    // Pegar o último cardápio
                    const ultimoCardapio = cardapiosData.cardapios.sort((a: any, b: any) => 
                      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
                    )[0]
                    
                    // Buscar dados completos do cardápio
                    const cardapioResponse = await fetch(`/api/cardapios/${ultimoCardapio.id}`, {
                      headers: {
                        'X-Session-Id': sessionId || '',
                        'X-User-Email': userEmail || '',
                      },
                    })
                    
                    if (cardapioResponse.ok) {
                      const cardapioData = await cardapioResponse.json()
                      if (cardapioData.cardapio?.dadosUsuario) {
                        setDadosUsuarioAgua({
                          peso: cardapioData.cardapio.dadosUsuario.peso,
                          altura: cardapioData.cardapio.dadosUsuario.altura,
                          idade: cardapioData.cardapio.dadosUsuario.idade,
                          sexo: cardapioData.cardapio.dadosUsuario.sexo,
                          rotina: cardapioData.cardapio.dadosUsuario.rotina,
                        })
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('Erro ao carregar dados do usuário para meta de água:', error)
              }
            } else {
              setTemCardapio(false)
            }
            
            setEmail(data.conta.email || 'Visitante')
          } else {
            // Tentar reautenticar se tiver email
            if (userEmail) {
              try {
                const loginResponse = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    email: userEmail, 
                    senha: '12345678'
                  }),
                })
                
                if (loginResponse.ok) {
                  const loginData = await loginResponse.json()
                  if (loginData.sessionId) {
                    localStorage.setItem('sessionId', loginData.sessionId)
                    setEmail(userEmail)
                    setCarregando(false)
                    return
                  }
                }
              } catch (e) {
                // Ignorar
              }
            }
            
            // Se não conseguiu reautenticar, limpar
            localStorage.removeItem('sessionId')
            localStorage.removeItem('userEmail')
            setEmail('Visitante')
            setTemCardapio(false)
          }
        } else {
          // Tentar reautenticar se tiver email
          if (userEmail) {
            try {
              const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: userEmail, 
                  senha: '12345678'
                }),
              })
              
              if (loginResponse.ok) {
                const loginData = await loginResponse.json()
                if (loginData.sessionId) {
                  localStorage.setItem('sessionId', loginData.sessionId)
                  setEmail(userEmail)
                  setCarregando(false)
                  return
                }
              }
            } catch (e) {
              // Ignorar
            }
          }
          
          // Se não conseguiu reautenticar, limpar
          localStorage.removeItem('sessionId')
          localStorage.removeItem('userEmail')
          setEmail('Visitante')
          setTemCardapio(false)
        }
      } catch (error) {
        console.error('Erro ao carregar sidebar:', error)
        // Tentar reautenticar uma última vez
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          try {
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: userEmail, 
                senha: '12345678'
              }),
            })
            
            if (loginResponse.ok) {
              const loginData = await loginResponse.json()
              if (loginData.sessionId) {
                localStorage.setItem('sessionId', loginData.sessionId)
                setEmail(userEmail)
                setCarregando(false)
                return
              }
            }
          } catch (e) {
            // Ignorar
          }
        }
        setEmail('Visitante')
        setTemCardapio(false)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
    
    // Escutar eventos de storage para atualizar quando login acontecer ou cardápio for criado
    const handleStorageChange = () => {
      carregarDados()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Também verificar quando a página ganha foco (caso login tenha acontecido em outra aba)
    window.addEventListener('focus', carregarDados)
    
    // Verificar periodicamente se cardápio foi criado (a cada 3 segundos)
    const intervalId = setInterval(() => {
      carregarDados()
    }, 3000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', carregarDados)
      clearInterval(intervalId)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('userEmail')
    // Não redirecionar para login, apenas limpar e recarregar
    window.location.href = '/'
  }

  if (carregando) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-80 bg-dark-secondary/95 backdrop-blur-sm border-r border-dark-border shadow-2xl p-8 overflow-y-auto z-50 lg:z-20 transform transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.98) 0%, rgba(14, 11, 20, 0.98) 100%)'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-xl text-neon-cyan mb-4 font-semibold">Carregando...</div>
          <div className="flex gap-3">
            <div className="w-3 h-3 bg-neon-purple rounded-full animate-bounce"
              style={{
                boxShadow: '0 0 12px rgba(199, 125, 255, 0.6)'
              }}
            />
            <div className="w-3 h-3 bg-neon-cyan rounded-full animate-bounce"
              style={{
                boxShadow: '0 0 12px rgba(0, 240, 255, 0.6)',
                animationDelay: '0.2s'
              }}
            />
            <div className="w-3 h-3 bg-neon-purple rounded-full animate-bounce"
              style={{
                boxShadow: '0 0 12px rgba(199, 125, 255, 0.6)',
                animationDelay: '0.4s'
              }}
            />
          </div>
        </div>
      </aside>
    )
  }

  return (
    <>
      {/* Overlay para mobile */}
      {sidebarAberta && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Botão hambúrguer para mobile - com safe area */}
      <button
        onClick={() => setSidebarAberta(!sidebarAberta)}
        className="fixed z-50 lg:hidden p-3 bg-dark-card border border-lilac/40 rounded-lg text-text-primary hover:bg-dark-secondary transition-all touch-manipulation"
        style={{
          top: 'max(1rem, env(safe-area-inset-top, 1rem))',
          left: 'max(1rem, env(safe-area-inset-left, 1rem))',
          boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)',
          minWidth: '44px',
          minHeight: '44px'
        }}
        aria-label="Menu"
      >
        {sidebarAberta ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <aside className={`fixed left-0 top-0 h-screen w-80 bg-dark-secondary/95 backdrop-blur-sm border-r border-dark-border shadow-2xl p-4 sm:p-6 lg:p-8 overflow-y-auto z-50 lg:z-20 transform transition-transform duration-300 ease-in-out ${
        sidebarAberta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
        style={{
          background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.98) 0%, rgba(14, 11, 20, 0.98) 100%)',
          height: '-webkit-fill-available', /* iOS Safari */
          paddingTop: 'max(1rem, env(safe-area-inset-top, 0))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0))',
          maxWidth: 'calc(100vw - env(safe-area-inset-left, 0) - env(safe-area-inset-right, 0))'
        }}
      >
      {/* Botão fechar para mobile */}
      <div className="flex justify-end mb-4 lg:hidden">
        <button
          onClick={() => setSidebarAberta(false)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Fechar menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Informações do usuário */}
      <div className="mb-6 lg:mb-10">
        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-dark-card border-2 border-lilac/40 flex items-center justify-center mb-4 lg:mb-6 transition-all duration-300 hover:border-neon-purple/60 hover:scale-105 mx-auto lg:mx-0"
          style={{
            boxShadow: '0 4px 20px rgba(199, 125, 255, 0.2)'
          }}
        >
          <span className="text-4xl lg:text-5xl">👤</span>
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-2 tracking-tight text-center lg:text-left">Minha Conta</h2>
        <p className="text-base lg:text-lg text-text-secondary font-light text-center lg:text-left">{email}</p>
      </div>

      {/* Meus cardápios */}
      <div className="mb-6 lg:mb-10">
        <h3 className="text-lg lg:text-xl font-bold text-text-primary mb-4 lg:mb-6 tracking-tight">Meus cardápios</h3>
        <div className="space-y-2 lg:space-y-3">
          <div 
            onClick={() => {
              router.push('/montar-cardapio')
              setSidebarAberta(false)
            }}
            className={`p-4 lg:p-5 bg-dark-card rounded-xl border card-hover cursor-pointer transition-all duration-300 touch-manipulation ${
              pathname === '/montar-cardapio'
                ? 'border-lilac/60'
                : 'border-lilac/20 hover:border-lilac/50'
            }`}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            <p className="text-sm lg:text-base text-neon-purple font-bold mb-1 lg:mb-1.5 tracking-tight">
              {temCardapio ? 'Refazer meu Cardápio' : 'Montar meu Cardápio'}
            </p>
            <p className="text-xs lg:text-sm text-text-secondary font-light">
              {temCardapio ? 'Criar novo cardápio personalizado' : 'Criar cardápio personalizado'}
            </p>
          </div>
          {pathname === '/montar-cardapio' && (
            <div 
              onClick={() => {
                router.push('/')
                setSidebarAberta(false)
              }}
              className="p-4 lg:p-5 bg-dark-card rounded-xl border border-dark-border card-hover cursor-pointer transition-all duration-300 hover:border-lilac/40 touch-manipulation"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <p className="text-sm lg:text-base text-text-primary font-bold mb-1 lg:mb-1.5 tracking-tight">← Voltar à Home</p>
              <p className="text-xs lg:text-sm text-text-secondary font-light">Ver todas as informações</p>
            </div>
          )}
          <div className="p-4 lg:p-5 bg-dark-card rounded-xl border border-dark-border card-hover cursor-pointer transition-all duration-300 hover:border-lilac/30 touch-manipulation"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            <p className="text-sm lg:text-base text-text-primary font-bold mb-1 lg:mb-1.5 tracking-tight">Semana atual</p>
            <p className="text-xs lg:text-sm text-text-secondary font-light">Semana 1 de 4</p>
          </div>
          <div className="p-4 lg:p-5 bg-dark-card rounded-xl border border-dark-border card-hover cursor-pointer transition-all duration-300 hover:border-lilac/30 touch-manipulation"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            <p className="text-sm lg:text-base text-text-primary font-bold mb-1 lg:mb-1.5 tracking-tight">Histórico mensal</p>
            <p className="text-xs lg:text-sm text-text-secondary font-light">Ver todos os meses</p>
          </div>
        </div>
      </div>

      {/* Tempo de constância */}
      <div className="mb-6 lg:mb-8 p-4 lg:p-6 bg-dark-card rounded-xl border border-lilac/20 transition-all duration-300 hover:border-lilac/40"
        style={{
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}
      >
        <p className="text-xs lg:text-sm text-lilac font-semibold mb-2 lg:mb-3 tracking-wide">✨ Constância</p>
        <p className="text-base lg:text-lg text-text-primary font-semibold">3 meses cuidando da alimentação</p>
      </div>

      {/* Meta de Água - Interface moderna e compacta */}
      <div className="mb-6 lg:mb-8">
        <MetaAgua dadosUsuario={dadosUsuarioAgua} compacto sidebar />
      </div>

      {/* Selo discreto */}
      <div className="mb-6 pt-6 border-t border-dark-border">
        <p className="text-xs text-text-soft text-center leading-relaxed">
          Baseado nos cardápios do<br />
          <span className="text-neon-purple font-medium">Dr. Fernando Lemos</span>
        </p>
      </div>

      {/* Login / Logout */}
      <div className="mb-4 lg:mb-6">
        {email && email !== 'Visitante' ? (
          <button 
            onClick={handleLogout}
            className="w-full p-3 lg:p-4 bg-gradient-to-r from-neon-pink to-lilac hover:from-lilac hover:to-neon-pink text-white rounded-lg text-sm lg:text-base font-bold transition-all duration-300 shadow-neon-pink hover:shadow-large glow-pink touch-manipulation"
            style={{
              boxShadow: '0 4px 16px rgba(255, 107, 157, 0.3)'
            }}
          >
            Sair
          </button>
        ) : (
          <button 
            onClick={() => {
              router.push('/criar-conta')
              setSidebarAberta(false)
            }}
            className="w-full p-3 lg:p-4 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-lg text-sm lg:text-base font-bold transition-all duration-300 shadow-neon-purple hover:shadow-large glow-purple touch-manipulation"
            style={{
              boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)'
            }}
          >
            Criar Conta / Entrar
          </button>
        )}
      </div>

      {/* Configurações */}
      <div className="space-y-1">
        <button 
          onClick={async () => {
            setSidebarAberta(false)
            // Verificar se tem plano antes de redirecionar
            const sessionIdCheck = localStorage.getItem('sessionId')
            const userEmailCheck = localStorage.getItem('userEmail')
            
            if (sessionIdCheck || userEmailCheck) {
              try {
                let response = sessionIdCheck ? await fetch('/api/auth/session', {
                  headers: { 
                    'X-Session-Id': sessionIdCheck,
                    'X-User-Email': userEmailCheck || '',
                  },
                }) : null
                
                // Se sessão inválida mas tem email, tentar reautenticar
                if (!response || !response.ok) {
                  if (userEmailCheck) {
                    const loginResponse = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: userEmailCheck, senha: '12345678' }),
                    })
                    
                    if (loginResponse.ok) {
                      const loginData = await loginResponse.json()
                      if (loginData.sessionId) {
                        localStorage.setItem('sessionId', loginData.sessionId)
                        response = await fetch('/api/auth/session', {
                          headers: { 
                            'X-Session-Id': loginData.sessionId,
                            'X-User-Email': userEmailCheck,
                          },
                        })
                      }
                    }
                  }
                }
                
                if (response && response.ok) {
                  const data = await response.json()
                  if (data.conta && data.conta.plano) {
                    // Tem plano, não redirecionar para planos
                    alert('Você já possui um plano ativo!')
                    return
                  }
                }
              } catch (error) {
                console.error('Erro ao verificar plano:', error)
              }
            }
            
            // Se não tem plano ou não conseguiu verificar, redirecionar
            router.push('/planos')
            setSidebarAberta(false)
          }}
          className="w-full text-left p-2 lg:p-3 text-sm lg:text-base text-text-secondary hover:text-neon-cyan hover:bg-dark-card transition-all rounded-lg touch-manipulation"
        >
          Meu Plano
        </button>
        <button className="w-full text-left p-2 lg:p-3 text-sm lg:text-base text-text-secondary hover:text-neon-cyan hover:bg-dark-card transition-all rounded-lg touch-manipulation">
          Texto maior
        </button>
      </div>
    </aside>
    </>
  )
}
