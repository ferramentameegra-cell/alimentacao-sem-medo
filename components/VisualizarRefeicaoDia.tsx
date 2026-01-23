'use client'

import { useEffect, useState } from 'react'
import BarraProgressoCardapio from './BarraProgressoCardapio'

interface VisualizarRefeicaoDiaProps {
  cardapioId: string | null
  diaSemana: number
  tipoRefeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  onClose: () => void
}

export default function VisualizarRefeicaoDia({ 
  cardapioId, 
  diaSemana, 
  tipoRefeicao, 
  onClose 
}: VisualizarRefeicaoDiaProps) {
  const [refeicao, setRefeicao] = useState<any>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [gerandoCardapio, setGerandoCardapio] = useState(false)
  const [progressoGeracao, setProgressoGeracao] = useState(0)
  const [etapaGeracao, setEtapaGeracao] = useState('')

  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const nomesRefeicoes: Record<string, string> = {
    cafe_manha: 'Café da Manhã',
    almoco: 'Almoço',
    lanche_tarde: 'Lanche da Tarde',
    jantar: 'Jantar'
  }

  useEffect(() => {
    if (!cardapioId) return

    const carregarRefeicao = async () => {
      setCarregando(true)
      setErro('')

      try {
        const sessionId = localStorage.getItem('sessionId')
        if (!sessionId) {
          setErro('Sessão não encontrada. Faça login novamente.')
          setCarregando(false)
          return
        }

        let response = await fetch(`/api/cardapios/${cardapioId}`, {
          headers: {
            'X-Session-Id': sessionId,
          },
        })

        // Se a sessão for inválida, tentar reautenticar automaticamente
        if (response.status === 401) {
          const userEmail = localStorage.getItem('userEmail')
          if (userEmail) {
            try {
              // Tentar fazer login novamente
              const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: userEmail, 
                  senha: '12345678' // Tentar senha padrão
                }),
              })
              
              if (loginResponse.ok) {
                const loginData = await loginResponse.json()
                const newSessionId = loginData.sessionId
                localStorage.setItem('sessionId', newSessionId)
                
                // Tentar buscar cardápio novamente com nova sessão
                response = await fetch(`/api/cardapios/${cardapioId}`, {
                  headers: {
                    'X-Session-Id': newSessionId,
                  },
                })
              } else {
                // Se login falhar, redirecionar para página de login
                setErro('Sessão expirada. Redirecionando para login...')
                setTimeout(() => {
                  window.location.href = '/login'
                }, 2000)
                return
              }
            } catch (retryError) {
              console.error('Erro ao tentar reautenticar:', retryError)
              setErro('Erro ao reautenticar. Redirecionando para login...')
              setTimeout(() => {
                window.location.href = '/login'
              }, 2000)
              return
            }
          } else {
            // Se não tem email salvo, redirecionar para login
            setErro('Sessão expirada. Redirecionando para login...')
            setTimeout(() => {
              window.location.href = '/login'
            }, 2000)
            return
          }
        }

        if (response.ok) {
          const data = await response.json()
          const cardapio = data.cardapio
          
          // Extrair refeição do dia específico
          if (cardapio.plano && cardapio.plano.dias) {
            // Plano semanal (7 dias)
            // Converter dia da semana JS (0-6) para dia do plano (1-7)
            // Domingo (0) -> Dia 1, Segunda (1) -> Dia 2, etc.
            const diaPlanoNumero = diaSemana === 0 ? 1 : diaSemana + 1
            const diaPlano = cardapio.plano.dias.find((d: any) => d.dia === diaPlanoNumero)
            
            if (diaPlano) {
              const refeicaoData = diaPlano[tipoRefeicao] || []
              setRefeicao({
                dia: nomesDias[diaSemana],
                tipo: nomesRefeicoes[tipoRefeicao],
                itens: refeicaoData
              })
            } else {
              setErro('Refeição não encontrada para este dia.')
            }
          } else {
            setErro('Formato de cardápio não suportado.')
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          
          // Se cardápio não encontrado, tentar gerar automaticamente
          if (errorData.error && errorData.error.includes('não encontrado')) {
            const hoje = new Date()
            const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
            const semana = Math.ceil(dataBrasilia.getDate() / 7)
            
            try {
              setGerandoCardapio(true)
              setProgressoGeracao(0)
              setEtapaGeracao('Gerando cardápio automaticamente...')
              
              const gerarResponse = await fetch('/api/cardapios/gerar-automatico', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Session-Id': sessionId,
                  'X-User-Email': localStorage.getItem('userEmail') || '',
                },
                body: JSON.stringify({ semana }),
              })

              if (gerarResponse.ok) {
                const reader = gerarResponse.body?.getReader()
                const decoder = new TextDecoder()
                let buffer = ''
                let novoCardapio = null

                if (reader) {
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

                          if (data.dados && data.dados.cardapio) {
                            novoCardapio = data.dados.cardapio
                          }
                        } catch (e) {
                          // Ignorar
                        }
                      }
                    }
                  }
                }

                if (novoCardapio && novoCardapio.plano && novoCardapio.plano.dias) {
                  const diaPlanoNumero = diaSemana === 0 ? 1 : diaSemana + 1
                  const diaPlano = novoCardapio.plano.dias.find((d: any) => d.dia === diaPlanoNumero)
                  
                  if (diaPlano) {
                    const refeicaoData = diaPlano[tipoRefeicao] || []
                    setRefeicao({
                      dia: nomesDias[diaSemana],
                      tipo: nomesRefeicoes[tipoRefeicao],
                      itens: refeicaoData
                    })
                    setGerandoCardapio(false)
                    return
                  }
                }
              }
            } catch (e) {
              console.error('Erro ao gerar cardápio automático:', e)
            } finally {
              setGerandoCardapio(false)
            }
          }
          
          setErro(errorData.error || 'Erro ao carregar refeição.')
        }
      } catch (error: any) {
        console.error('Erro ao carregar refeição:', error)
        setErro(error.message || 'Erro ao carregar refeição.')
      } finally {
        setCarregando(false)
      }
    }

    carregarRefeicao()
  }, [cardapioId, diaSemana, tipoRefeicao])

  if (!cardapioId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      {/* Barra de progresso para geração automática */}
      <BarraProgressoCardapio
        progresso={progressoGeracao}
        etapa={etapaGeracao}
        mostrar={gerandoCardapio}
        onCompleto={() => {
          setGerandoCardapio(false)
        }}
      />
      <div className="relative w-full max-w-2xl bg-dark-secondary/98 backdrop-blur-sm border border-lilac/30 rounded-xl flex flex-col overflow-hidden animate-genio-appear p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.98) 0%, rgba(14, 11, 20, 0.98) 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(199, 125, 255, 0.2)'
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">
                {nomesRefeicoes[tipoRefeicao]}
              </h2>
              <p className="text-base text-text-secondary font-light">
                {nomesDias[diaSemana]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-dark-card hover:bg-dark-tertiary border border-dark-border text-text-secondary hover:text-neon-pink hover:border-neon-pink/50 transition-all duration-300 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {carregando ? (
            <div className="text-center py-20">
              <div className="text-xl text-neon-cyan mb-6 font-semibold">Carregando...</div>
              <div className="flex justify-center gap-3">
                <div className="w-4 h-4 bg-neon-purple rounded-full animate-bounce" />
                <div className="w-4 h-4 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-4 h-4 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          ) : erro ? (
            <div className="text-center py-20">
              <div className="p-6 bg-dark-card border border-neon-pink/40 rounded-xl inline-block">
                <p className="text-base text-neon-pink font-semibold">{erro}</p>
              </div>
            </div>
          ) : refeicao && refeicao.itens ? (
            <div className="bg-dark-card border border-dark-border rounded-xl p-8">
              <div className="space-y-4">
                {refeicao.itens.length > 0 ? (
                  refeicao.itens.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-dark-secondary rounded-lg border border-dark-border">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          {item.nome}
                        </h3>
                        <p className="text-base text-neon-cyan font-medium">
                          {item.quantidade}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-base text-text-secondary text-center py-8">
                    Nenhum item encontrado para esta refeição.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
