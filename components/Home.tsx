'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MealCard from './MealCard'
import SocialProof from './SocialProof'
import DrFernandoCard from './DrFernandoCard'
import VisualizarCardapio from './VisualizarCardapio'
import DiaSemanaSelector from './DiaSemanaSelector'
import VisualizarRefeicaoDia from './VisualizarRefeicaoDia'
import ListaCompras from './ListaCompras'
import BarraProgressoCardapio from './BarraProgressoCardapio'

interface CardapioSalvo {
  id: string
  planoFormatado: string
  plano: any
  semana?: number
  mes?: number
  ano?: number
  criadoEm: string
}

export default function Home() {
  const router = useRouter()
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedDay, setSelectedDay] = useState(() => {
    // Inicializar com o dia atual em Brasília
    const hoje = new Date()
    const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    return dataBrasilia.getDay()
  })
  const [cardapios, setCardapios] = useState<CardapioSalvo[]>([])
  const [cardapioAtual, setCardapioAtual] = useState<CardapioSalvo | null>(null)
  const [cardapioVisualizar, setCardapioVisualizar] = useState<string | null>(null)
  const [refeicaoVisualizar, setRefeicaoVisualizar] = useState<{cardapioId: string, diaSemana: number, tipoRefeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'} | null>(null)
  const [mostrarListaCompras, setMostrarListaCompras] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [gerandoCardapio, setGerandoCardapio] = useState(false)
  const [progressoGeracao, setProgressoGeracao] = useState(0)
  const [etapaGeracao, setEtapaGeracao] = useState('')

  // Carregar cardápios da conta e gerar automaticamente se necessário
  useEffect(() => {
    const carregarCardapios = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId')
        // Se não tem sessão, apenas não carregar cardápios (usuário pode navegar livremente)
        if (!sessionId) {
          setCarregando(false)
          return
        }

        // Verificar se tem plano
        const sessionResponse = await fetch('/api/auth/session', {
          headers: { 'X-Session-Id': sessionId },
        })

        if (!sessionResponse.ok) {
          setCarregando(false)
          return
        }

        const sessionData = await sessionResponse.json()
        if (!sessionData.conta || !sessionData.conta.plano) {
          setCarregando(false)
          return
        }

        // Buscar cardápios existentes
        let response = await fetch('/api/cardapios', {
          headers: {
            'X-Session-Id': sessionId,
            'X-User-Email': localStorage.getItem('userEmail') || '',
          },
        })

        // Se sessão inválida, tentar reautenticar
        if (response.status === 401) {
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
                const newSessionId = loginData.sessionId
                localStorage.setItem('sessionId', newSessionId)
                
                // Tentar buscar cardápios novamente
                response = await fetch('/api/cardapios', {
                  headers: {
                    'X-Session-Id': newSessionId,
                  },
                })
              }
            } catch (retryError) {
              console.error('Erro ao reautenticar:', retryError)
            }
          }
        }

        let cardapiosExistentes: CardapioSalvo[] = []
        if (response.ok) {
          const data = await response.json()
          cardapiosExistentes = data.cardapios || []
          console.log('Cardápios carregados:', cardapiosExistentes.length)
        } else {
          console.error('Erro ao buscar cardápios:', response.status)
        }

        // Verificar se precisa gerar cardápio automático para hoje
        const hoje = new Date()
        const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        const semanaAtual = Math.ceil(dataBrasilia.getDate() / 7)
        const mesAtual = dataBrasilia.getMonth() + 1
        const anoAtual = dataBrasilia.getFullYear()

        // Verificar se já existe cardápio para a semana atual
        const cardapioSemanaAtual = cardapiosExistentes.find(
          (c: CardapioSalvo) => c.semana === semanaAtual && c.mes === mesAtual && c.ano === anoAtual
        )

        // Gerar cardápios para todas as semanas do mês se não existirem
        for (let semana = 1; semana <= 4; semana++) {
          const cardapioSemana = cardapiosExistentes.find(
            (c: CardapioSalvo) => c.semana === semana && c.mes === mesAtual && c.ano === anoAtual
          )

          if (!cardapioSemana) {
            // Gerar cardápio automático para esta semana com streaming
            try {
              setGerandoCardapio(true)
              setProgressoGeracao(0)
              setEtapaGeracao('Iniciando geração...')
              
              const gerarResponse = await fetch('/api/cardapios/gerar-automatico', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Session-Id': sessionId,
                  'X-User-Email': localStorage.getItem('userEmail') || '',
                },
                body: JSON.stringify({ semana }),
              })

              if (!gerarResponse.ok) {
                throw new Error('Erro ao iniciar geração')
              }

              // Ler stream de progresso
              const reader = gerarResponse.body?.getReader()
              const decoder = new TextDecoder()

              if (!reader) {
                throw new Error('Não foi possível ler o stream')
              }

              let buffer = ''
              let cardapioGerado = null

              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6))
                      
                      if (data.progresso !== undefined) {
                        setProgressoGeracao(data.progresso)
                      }
                      if (data.etapa) {
                        setEtapaGeracao(data.etapa)
                      }

                      if (data.etapa && data.etapa.startsWith('Erro:')) {
                        throw new Error(data.etapa)
                      }

                      if (data.dados && data.dados.cardapio) {
                        cardapioGerado = data.dados.cardapio
                      }
                    } catch (e) {
                      console.error('Erro ao processar stream:', e)
                    }
                  }
                }
              }

              if (cardapioGerado) {
                cardapiosExistentes.push({
                  id: cardapioGerado.id,
                  planoFormatado: cardapioGerado.planoFormatado,
                  plano: cardapioGerado.plano,
                  semana: cardapioGerado.semana,
                  mes: cardapioGerado.mes,
                  ano: cardapioGerado.ano,
                  criadoEm: cardapioGerado.criadoEm,
                })
                console.log(`Cardápio automático gerado para semana ${semana}:`, cardapioGerado.id)
              }
            } catch (error) {
              console.error(`Erro ao gerar cardápio automático para semana ${semana}:`, error)
            } finally {
              setGerandoCardapio(false)
              setProgressoGeracao(0)
              setEtapaGeracao('')
            }
          }
        }

        setCardapios(cardapiosExistentes)
        
        // Encontrar cardápio da semana selecionada ou mais recente
        const cardapioSemana = cardapiosExistentes.find((c: CardapioSalvo) => c.semana === selectedWeek)
        const maisRecente = cardapiosExistentes.length > 0 
          ? cardapiosExistentes.sort((a: CardapioSalvo, b: CardapioSalvo) => 
              new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
            )[0]
          : null
        
        const cardapioParaUsar = cardapioSemana || maisRecente
        setCardapioAtual(cardapioParaUsar)
        
        console.log('Cardápio atual definido:', cardapioParaUsar?.id || 'nenhum')
      } catch (error) {
        console.error('Erro ao carregar cardápios:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarCardapios()
    
    // Recarregar quando a janela ganha foco (para pegar cardápios recém-criados)
    const handleFocus = () => {
      carregarCardapios()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [selectedWeek])

  // Atualizar cardápio quando semana mudar
  useEffect(() => {
    const cardapioSemana = cardapios.find(c => c.semana === selectedWeek)
    setCardapioAtual(cardapioSemana || cardapios[0] || null)
  }, [selectedWeek, cardapios])

  return (
    <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-12 py-4 sm:py-6 md:py-8 lg:py-14 max-w-full overflow-x-hidden w-full relative"
      style={{
        paddingTop: 'max(4.5rem, calc(1rem + env(safe-area-inset-top, 0)))', // Espaço para botão hamburger + safe area
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0))',
        minHeight: '-webkit-fill-available', /* iOS Safari */
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}
    >
      {/* Barra de progresso para geração automática */}
      <BarraProgressoCardapio
        progresso={progressoGeracao}
        etapa={etapaGeracao}
        mostrar={gerandoCardapio}
        onCompleto={() => {
          // Quando completar, apenas esconder a barra
          setGerandoCardapio(false)
        }}
      />
      
      {/* Espaçamento para a barra de progresso quando estiver visível */}
      {gerandoCardapio && <div className="h-24" />}
      {/* Header */}
      <div className="mb-8 lg:mb-12 max-w-full">
        <h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-3 lg:mb-4"
          style={{ 
            color: '#FFFFFF',
            fontFamily: 'var(--font-roketto)',
            fontWeight: 400,
            letterSpacing: '0.02em',
            lineHeight: '1.2'
          }}
        >
          Alimentação Sem Medo
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-text-secondary font-light">
          Seu espaço seguro para comer sem medo
        </p>
      </div>

      {/* Carrossel de semanas - estilo Netflix */}
      <section className="mb-10 lg:mb-16 max-w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
            Seu cardápio deste mês
          </h2>
          {cardapios.length > 0 && (
            <button
              onClick={() => setMostrarListaCompras(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan text-white rounded-lg text-sm sm:text-base font-bold transition-all duration-300 flex items-center gap-2 touch-manipulation whitespace-nowrap"
              style={{
                boxShadow: '0 4px 16px rgba(0, 240, 255, 0.3)'
              }}
            >
              🛒 Gerar Lista de Compras
            </button>
          )}
        </div>
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2 snap-x snap-mandatory">
          {[1, 2, 3, 4].map((week) => (
            <div
              key={week}
              onClick={async () => {
                setSelectedWeek(week)
                
                // Verificar se existe cardápio para esta semana
                const hoje = new Date()
                const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
                const mesAtual = dataBrasilia.getMonth() + 1
                const anoAtual = dataBrasilia.getFullYear()
                
                let cardapioSemana = cardapios.find(
                  (c: CardapioSalvo) => c.semana === week && c.mes === mesAtual && c.ano === anoAtual
                )
                
                // Se não existe, gerar cardápio para esta semana com streaming
                if (!cardapioSemana) {
                  try {
                    const sessionId = localStorage.getItem('sessionId')
                    const userEmail = localStorage.getItem('userEmail')
                    
                    if (sessionId || userEmail) {
                      setGerandoCardapio(true)
                      setProgressoGeracao(0)
                      setEtapaGeracao('Iniciando geração...')
                      
                      const gerarResponse = await fetch('/api/cardapios/gerar-automatico', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-Session-Id': sessionId || '',
                          'X-User-Email': userEmail || '',
                        },
                        body: JSON.stringify({ semana: week }),
                      })

                      if (!gerarResponse.ok) {
                        throw new Error('Erro ao iniciar geração')
                      }

                      // Ler stream de progresso
                      const reader = gerarResponse.body?.getReader()
                      const decoder = new TextDecoder()

                      if (!reader) {
                        throw new Error('Não foi possível ler o stream')
                      }

                      let buffer = ''
                      let novoCardapio = null

                      while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        buffer += decoder.decode(value, { stream: true })
                        const lines = buffer.split('\n')
                        buffer = lines.pop() || ''

                        for (const line of lines) {
                          if (line.startsWith('data: ')) {
                            try {
                              const data = JSON.parse(line.slice(6))
                              
                              if (data.progresso !== undefined) {
                                setProgressoGeracao(data.progresso)
                              }
                              if (data.etapa) {
                                setEtapaGeracao(data.etapa)
                              }

                              if (data.etapa && data.etapa.startsWith('Erro:')) {
                                throw new Error(data.etapa)
                              }

                              if (data.dados && data.dados.cardapio) {
                                novoCardapio = data.dados.cardapio
                              }
                            } catch (e) {
                              console.error('Erro ao processar stream:', e)
                            }
                          }
                        }
                      }

                      if (novoCardapio) {
                        cardapioSemana = {
                          id: novoCardapio.id,
                          planoFormatado: novoCardapio.planoFormatado,
                          plano: novoCardapio.plano,
                          semana: novoCardapio.semana,
                          mes: novoCardapio.mes,
                          ano: novoCardapio.ano,
                          criadoEm: novoCardapio.criadoEm,
                        }
                        setCardapios([...cardapios, cardapioSemana])
                        setCardapioAtual(cardapioSemana)
                      }
                    }
                  } catch (error) {
                    console.error('Erro ao gerar cardápio para semana:', error)
                  } finally {
                    setGerandoCardapio(false)
                    setProgressoGeracao(0)
                    setEtapaGeracao('')
                  }
                } else {
                  setCardapioAtual(cardapioSemana)
                }
                
                // Abrir visualização se existir
                if (cardapioSemana) {
                  setCardapioVisualizar(cardapioSemana.id)
                }
              }}
              className={`flex-shrink-0 w-64 sm:w-72 lg:w-80 h-48 sm:h-52 lg:h-56 rounded-xl border cursor-pointer transition-all duration-300 touch-manipulation snap-center flex flex-col overflow-hidden ${
                selectedWeek === week
                  ? 'border-neon-purple/60 bg-gradient-to-br from-dark-card to-dark-tertiary shadow-neon-purple scale-105'
                  : 'border-dark-border bg-dark-card hover:border-lilac/40 active:scale-102'
              }`}
              style={{
                boxShadow: selectedWeek === week 
                  ? '0 8px 32px rgba(199, 125, 255, 0.3), 0 0 0 1px rgba(199, 125, 255, 0.2)'
                  : '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4" style={{ height: '40%', display: 'flex', alignItems: 'center' }}>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  Semana {week}
                </h3>
              </div>
              <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ height: '60%' }}>
                <Image
                  src={`/imagens/${week}.png`}
                  alt={`Semana ${week}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seletor de dias da semana */}
      <section className="mb-8 lg:mb-12 max-w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-4 lg:mb-8 tracking-tight">
          Selecione o dia da semana
        </h2>
        <DiaSemanaSelector 
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </section>

      {/* Carrossel de refeições do dia selecionado - estilo Netflix */}
      <section className="mb-10 lg:mb-16 max-w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-6 lg:mb-10 tracking-tight">
          {(() => {
            const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
            return dias[selectedDay] || 'Hoje'
          })()}
        </h2>
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2 snap-x snap-mandatory">
          <MealCard
            meal="Café da manhã"
            time="07:00"
            description="Refeição matinal completa"
            cardapioId={cardapioAtual?.id}
            diaSemana={selectedDay}
            tipoRefeicao="cafe_manha"
            onVerCardapio={() => {
              if (cardapioAtual) {
                setRefeicaoVisualizar({
                  cardapioId: cardapioAtual.id,
                  diaSemana: selectedDay,
                  tipoRefeicao: 'cafe_manha'
                })
              } else {
                const sessionId = localStorage.getItem('sessionId')
                const userEmail = localStorage.getItem('userEmail')
                if (sessionId || userEmail) {
                  fetch('/api/auth/session', {
                    headers: { 
                      'X-Session-Id': sessionId || '',
                      'X-User-Email': userEmail || '',
                    },
                  })
                    .then(res => {
                      if (res.ok) {
                        return res.json()
                      }
                      // Se sessão inválida, tentar reautenticar
                      if (userEmail) {
                        return fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            email: userEmail, 
                            senha: '12345678'
                          }),
                        }).then(loginRes => loginRes.ok ? loginRes.json() : null)
                      }
                      return null
                    })
                    .then(data => {
                      if (data && data.conta && data.conta.plano) {
                        router.push('/montar-cardapio')
                      } else {
                        router.push('/planos')
                      }
                    })
                    .catch(() => router.push('/planos'))
                } else {
                  router.push('/planos')
                }
              }
            }}
          />
          <MealCard
            meal="Almoço"
            time="12:30"
            description="Refeição principal"
            cardapioId={cardapioAtual?.id}
            diaSemana={selectedDay}
            tipoRefeicao="almoco"
            onVerCardapio={() => {
              if (cardapioAtual) {
                setRefeicaoVisualizar({
                  cardapioId: cardapioAtual.id,
                  diaSemana: selectedDay,
                  tipoRefeicao: 'almoco'
                })
              } else {
                // Verificar se tem plano antes de redirecionar
                const sessionId = localStorage.getItem('sessionId')
                const userEmail = localStorage.getItem('userEmail')
                if (sessionId || userEmail) {
                  fetch('/api/auth/session', {
                    headers: { 
                      'X-Session-Id': sessionId || '',
                      'X-User-Email': userEmail || '',
                    },
                  })
                    .then(res => {
                      if (res.ok) return res.json()
                      if (userEmail) {
                        return fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: userEmail, senha: '12345678' }),
                        }).then(loginRes => loginRes.ok ? loginRes.json() : null)
                      }
                      return null
                    })
                    .then(data => {
                      if (data && data.conta && data.conta.plano) {
                        // Tem plano, não redirecionar para planos
                        console.log('Usuário já tem plano, não redirecionando para planos')
                      } else {
                        router.push('/planos')
                      }
                    })
                    .catch(() => router.push('/planos'))
                } else {
                  router.push('/planos')
                }
              }
            }}
          />
          <MealCard
            meal="Lanche da tarde"
            time="16:00"
            description="Lanche da tarde"
            cardapioId={cardapioAtual?.id}
            diaSemana={selectedDay}
            tipoRefeicao="lanche_tarde"
            onVerCardapio={() => {
              if (cardapioAtual) {
                setRefeicaoVisualizar({
                  cardapioId: cardapioAtual.id,
                  diaSemana: selectedDay,
                  tipoRefeicao: 'lanche_tarde'
                })
              } else {
                // Verificar se tem plano antes de redirecionar
                const sessionId = localStorage.getItem('sessionId')
                const userEmail = localStorage.getItem('userEmail')
                if (sessionId || userEmail) {
                  fetch('/api/auth/session', {
                    headers: { 
                      'X-Session-Id': sessionId || '',
                      'X-User-Email': userEmail || '',
                    },
                  })
                    .then(res => {
                      if (res.ok) return res.json()
                      if (userEmail) {
                        return fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: userEmail, senha: '12345678' }),
                        }).then(loginRes => loginRes.ok ? loginRes.json() : null)
                      }
                      return null
                    })
                    .then(data => {
                      if (data && data.conta && data.conta.plano) {
                        // Tem plano, não redirecionar para planos
                        console.log('Usuário já tem plano, não redirecionando para planos')
                      } else {
                        router.push('/planos')
                      }
                    })
                    .catch(() => router.push('/planos'))
                } else {
                  router.push('/planos')
                }
              }
            }}
          />
          <MealCard
            meal="Jantar"
            time="19:00"
            description="Refeição noturna"
            cardapioId={cardapioAtual?.id}
            diaSemana={selectedDay}
            tipoRefeicao="jantar"
            onVerCardapio={() => {
              if (cardapioAtual) {
                setRefeicaoVisualizar({
                  cardapioId: cardapioAtual.id,
                  diaSemana: selectedDay,
                  tipoRefeicao: 'jantar'
                })
              } else {
                // Verificar se tem plano antes de redirecionar
                const sessionId = localStorage.getItem('sessionId')
                const userEmail = localStorage.getItem('userEmail')
                if (sessionId || userEmail) {
                  fetch('/api/auth/session', {
                    headers: { 
                      'X-Session-Id': sessionId || '',
                      'X-User-Email': userEmail || '',
                    },
                  })
                    .then(res => {
                      if (res.ok) return res.json()
                      if (userEmail) {
                        return fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: userEmail, senha: '12345678' }),
                        }).then(loginRes => loginRes.ok ? loginRes.json() : null)
                      }
                      return null
                    })
                    .then(data => {
                      if (data && data.conta && data.conta.plano) {
                        // Tem plano, não redirecionar para planos
                        console.log('Usuário já tem plano, não redirecionando para planos')
                      } else {
                        router.push('/planos')
                      }
                    })
                    .catch(() => router.push('/planos'))
                } else {
                  router.push('/planos')
                }
              }
            }}
          />
        </div>
      </section>

      {/* Provas sociais */}
      <SocialProof />

      {/* Card Dr. Fernando Lemos */}
      <DrFernandoCard />

      {/* Modal de visualização de cardápio completo */}
      <VisualizarCardapio 
        cardapioId={cardapioVisualizar}
        onClose={() => setCardapioVisualizar(null)}
      />

      {/* Modal de visualização de refeição específica do dia */}
      {refeicaoVisualizar && (
        <VisualizarRefeicaoDia
          cardapioId={refeicaoVisualizar.cardapioId}
          diaSemana={refeicaoVisualizar.diaSemana}
          tipoRefeicao={refeicaoVisualizar.tipoRefeicao}
          onClose={() => setRefeicaoVisualizar(null)}
        />
      )}

      {/* Modal de lista de compras */}
      {mostrarListaCompras && (
        <ListaCompras
          cardapios={cardapios}
          onClose={() => setMostrarListaCompras(false)}
        />
      )}
    </div>
  )
}
