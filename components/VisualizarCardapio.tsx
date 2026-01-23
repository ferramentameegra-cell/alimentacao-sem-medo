'use client'

import { useEffect, useState } from 'react'
import BarraProgressoCardapio from './BarraProgressoCardapio'
import { 
  marcarRefeicaoConcluida, 
  isRefeicaoConcluida, 
  calcularProgressoCardapio 
} from '@/lib/tracking_refeicoes'
import { gerarDicaRefeicao } from '@/lib/gerador_dicas_preparo'

interface CardapioData {
  id: string
  planoFormatado: string
  plano: any
  dadosUsuario: any
  criadoEm: string
  semana?: number
}

interface VisualizarCardapioProps {
  cardapioId: string | null
  onClose: () => void
}

export default function VisualizarCardapio({ cardapioId, onClose }: VisualizarCardapioProps) {
  const [cardapio, setCardapio] = useState<CardapioData | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [gerandoCardapio, setGerandoCardapio] = useState(false)
  const [progressoGeracao, setProgressoGeracao] = useState(0)
  const [etapaGeracao, setEtapaGeracao] = useState('')
  const [progressoRefeicoes, setProgressoRefeicoes] = useState(0)

  useEffect(() => {
    if (!cardapioId) return

    const carregarCardapio = async () => {
      setCarregando(true)
      setErro('')

      try {
        let sessionId = localStorage.getItem('sessionId')
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

        // Se a sessão for inválida, tentar reautenticar
        if (response.status === 401) {
          const userEmail = localStorage.getItem('userEmail')
          if (userEmail) {
            try {
              const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: userEmail, 
                  senha: '12345678' // Senha padrão para teste
                }),
              })
              
              if (loginResponse.ok) {
                const loginData = await loginResponse.json()
                const newSessionId = loginData.sessionId
                if (newSessionId) {
                  sessionId = newSessionId
                  localStorage.setItem('sessionId', newSessionId)
                  
                  // Tentar buscar cardápio novamente
                  response = await fetch(`/api/cardapios/${cardapioId}`, {
                    headers: {
                      'X-Session-Id': newSessionId,
                    },
                  })
                }
              }
            } catch (retryError) {
              console.error('Erro ao tentar reautenticar:', retryError)
            }
          }
        }

        if (response.ok) {
          const data = await response.json()
          setCardapio(data.cardapio)
          // Calcular progresso inicial
          if (data.cardapio && cardapioId) {
            const progresso = calcularProgressoCardapio(data.cardapio, cardapioId)
            setProgressoRefeicoes(progresso)
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          
          // Se cardápio não encontrado, tentar gerar automaticamente
          if (errorData.error && errorData.error.includes('não encontrado')) {
            // Tentar gerar cardápio automático para a semana atual
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
                  'X-Session-Id': sessionId || '',
                  'X-User-Email': localStorage.getItem('userEmail') || '',
                },
                body: JSON.stringify({ semana }),
              })

              if (gerarResponse.ok) {
                // Ler stream
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

                if (novoCardapio) {
                  setCardapio(novoCardapio)
                  setGerandoCardapio(false)
                  return
                }
              }
            } catch (e) {
              console.error('Erro ao gerar cardápio automático:', e)
            } finally {
              setGerandoCardapio(false)
            }
          }
          
          setErro(errorData.error || 'Erro ao carregar cardápio. Tente fazer login novamente.')
        }
      } catch (error: any) {
        console.error('Erro ao carregar cardápio:', error)
        setErro(error.message || 'Erro ao carregar cardápio. Tente novamente.')
      } finally {
        setCarregando(false)
      }
    }

    carregarCardapio()
  }, [cardapioId])

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
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[800px] bg-dark-secondary/98 backdrop-blur-sm border border-lilac/30 rounded-xl flex flex-col overflow-hidden animate-genio-appear"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.98) 0%, rgba(14, 11, 20, 0.98) 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(199, 125, 255, 0.2)'
        }}
      >
        {/* Header */}
        <div className="p-8 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
                Meu Cardápio Personalizado
              </h2>
              {cardapio?.semana && (
                <p className="text-base text-text-secondary font-light mb-3">
                  Semana {cardapio.semana} • {new Date(cardapio.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              )}
              {/* Barra de progresso */}
              {cardapio && cardapioId && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-secondary">Progresso do cardápio</span>
                    <span className="text-sm font-bold text-neon-purple">{progressoRefeicoes}%</span>
                  </div>
                  <div className="w-full h-3 bg-dark-card rounded-full overflow-hidden border border-dark-border">
                    <div 
                      className="h-full bg-gradient-to-r from-neon-purple via-lilac to-neon-cyan transition-all duration-500 ease-out"
                      style={{ width: `${progressoRefeicoes}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Marque os itens conforme você os consome para acompanhar seu progresso
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-dark-card hover:bg-dark-tertiary border border-dark-border text-text-secondary hover:text-neon-pink hover:border-neon-pink/50 transition-all duration-300 flex items-center justify-center"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-8">
          {carregando ? (
            <div className="text-center py-20">
              <div className="text-xl text-neon-cyan mb-6 font-semibold">Carregando cardápio...</div>
              <div className="flex justify-center gap-3">
                <div className="w-4 h-4 bg-neon-purple rounded-full animate-bounce"
                  style={{
                    boxShadow: '0 0 12px rgba(199, 125, 255, 0.6)'
                  }}
                />
                <div className="w-4 h-4 bg-neon-cyan rounded-full animate-bounce"
                  style={{
                    boxShadow: '0 0 12px rgba(0, 240, 255, 0.6)',
                    animationDelay: '0.2s'
                  }}
                />
                <div className="w-4 h-4 bg-neon-purple rounded-full animate-bounce"
                  style={{
                    boxShadow: '0 0 12px rgba(199, 125, 255, 0.6)',
                    animationDelay: '0.4s'
                  }}
                />
              </div>
            </div>
          ) : erro ? (
            <div className="text-center py-20">
              <div className="p-6 bg-dark-card border border-neon-pink/40 rounded-xl inline-block"
                style={{
                  boxShadow: '0 4px 16px rgba(255, 107, 157, 0.2)'
                }}
              >
                <p className="text-base text-neon-pink font-semibold">{erro}</p>
              </div>
            </div>
          ) : cardapio ? (
            <div className="bg-dark-card border border-dark-border rounded-xl p-10"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Renderizar usando estrutura de dados do plano */}
              {cardapio.plano && cardapio.plano.dias ? (
                <div className="space-y-8">
                  {cardapio.plano.dias.map((dia: any) => (
                    <div key={dia.dia} className="space-y-4">
                      {/* Título do dia */}
                      <div className="text-2xl font-bold text-neon-cyan mb-4">
                        {dia.nomeDia || `Dia ${dia.dia + 1}`}
                      </div>
                      
                      {/* Café da manhã */}
                      {dia.cafe_manha && dia.cafe_manha.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-neon-purple font-semibold text-xl mb-2">
                            Café da manhã:
                          </div>
                          {dia.cafe_manha.map((item: any, itemIndex: number) => {
                            const concluida = cardapioId ? isRefeicaoConcluida(cardapioId, dia.dia, 'cafe_manha', itemIndex) : false
                            return (
                              <div key={itemIndex} className="flex items-center gap-3 py-1">
                                <input
                                  type="checkbox"
                                  checked={concluida}
                                  onChange={(e) => {
                                    if (cardapioId) {
                                      marcarRefeicaoConcluida(cardapioId, dia.dia, 'cafe_manha', itemIndex, e.target.checked)
                                      const novoProgresso = calcularProgressoCardapio(cardapio, cardapioId)
                                      setProgressoRefeicoes(novoProgresso)
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-2 border-lilac/40 bg-dark-card checked:bg-neon-purple checked:border-neon-purple focus:ring-2 focus:ring-neon-purple/50 cursor-pointer transition-all duration-200 flex-shrink-0"
                                />
                                <span className={`flex-1 ${concluida ? 'line-through text-text-muted opacity-60' : 'text-text-primary'}`}>
                                  - {item.nome} — {item.quantidade}
                                </span>
                              </div>
                            )
                          })}
                          {/* Dica de preparo */}
                          {(() => {
                            // Usar dica salva se disponível, senão gerar
                            const dica = dia.cafe_manha_dica || gerarDicaRefeicao(dia.cafe_manha, 'cafe_manha')
                            return dica ? (
                              <div className="mt-3 ml-7 p-3 bg-dark-secondary/50 rounded-lg border border-neon-cyan/20">
                                <div className="text-neon-cyan font-semibold text-sm mb-1">💡 Dica de preparo:</div>
                                <div className="text-text-secondary italic text-sm">{dica}</div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                      
                      {/* Almoço */}
                      {dia.almoco && dia.almoco.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-neon-purple font-semibold text-xl mb-2">
                            Almoço:
                          </div>
                          {dia.almoco.map((item: any, itemIndex: number) => {
                            const concluida = cardapioId ? isRefeicaoConcluida(cardapioId, dia.dia, 'almoco', itemIndex) : false
                            return (
                              <div key={itemIndex} className="flex items-center gap-3 py-1">
                                <input
                                  type="checkbox"
                                  checked={concluida}
                                  onChange={(e) => {
                                    if (cardapioId) {
                                      marcarRefeicaoConcluida(cardapioId, dia.dia, 'almoco', itemIndex, e.target.checked)
                                      const novoProgresso = calcularProgressoCardapio(cardapio, cardapioId)
                                      setProgressoRefeicoes(novoProgresso)
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-2 border-lilac/40 bg-dark-card checked:bg-neon-purple checked:border-neon-purple focus:ring-2 focus:ring-neon-purple/50 cursor-pointer transition-all duration-200 flex-shrink-0"
                                />
                                <span className={`flex-1 ${concluida ? 'line-through text-text-muted opacity-60' : 'text-text-primary'}`}>
                                  - {item.nome} — {item.quantidade}
                                </span>
                              </div>
                            )
                          })}
                          {/* Dica de preparo */}
                          {(() => {
                            // Usar dica salva se disponível, senão gerar
                            const dica = dia.almoco_dica || gerarDicaRefeicao(dia.almoco, 'almoco')
                            return dica ? (
                              <div className="mt-3 ml-7 p-3 bg-dark-secondary/50 rounded-lg border border-neon-cyan/20">
                                <div className="text-neon-cyan font-semibold text-sm mb-1">💡 Dica de preparo:</div>
                                <div className="text-text-secondary italic text-sm">{dica}</div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                      
                      {/* Lanche da tarde */}
                      {dia.lanche_tarde && dia.lanche_tarde.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-neon-purple font-semibold text-xl mb-2">
                            Lanche da tarde:
                          </div>
                          {dia.lanche_tarde.map((item: any, itemIndex: number) => {
                            const concluida = cardapioId ? isRefeicaoConcluida(cardapioId, dia.dia, 'lanche_tarde', itemIndex) : false
                            return (
                              <div key={itemIndex} className="flex items-center gap-3 py-1">
                                <input
                                  type="checkbox"
                                  checked={concluida}
                                  onChange={(e) => {
                                    if (cardapioId) {
                                      marcarRefeicaoConcluida(cardapioId, dia.dia, 'lanche_tarde', itemIndex, e.target.checked)
                                      const novoProgresso = calcularProgressoCardapio(cardapio, cardapioId)
                                      setProgressoRefeicoes(novoProgresso)
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-2 border-lilac/40 bg-dark-card checked:bg-neon-purple checked:border-neon-purple focus:ring-2 focus:ring-neon-purple/50 cursor-pointer transition-all duration-200 flex-shrink-0"
                                />
                                <span className={`flex-1 ${concluida ? 'line-through text-text-muted opacity-60' : 'text-text-primary'}`}>
                                  - {item.nome} — {item.quantidade}
                                </span>
                              </div>
                            )
                          })}
                          {/* Dica de preparo */}
                          {(() => {
                            // Usar dica salva se disponível, senão gerar
                            const dica = dia.lanche_tarde_dica || gerarDicaRefeicao(dia.lanche_tarde, 'lanche_tarde')
                            return dica ? (
                              <div className="mt-3 ml-7 p-3 bg-dark-secondary/50 rounded-lg border border-neon-cyan/20">
                                <div className="text-neon-cyan font-semibold text-sm mb-1">💡 Dica de preparo:</div>
                                <div className="text-text-secondary italic text-sm">{dica}</div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                      
                      {/* Jantar */}
                      {dia.jantar && dia.jantar.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-neon-purple font-semibold text-xl mb-2">
                            Jantar:
                          </div>
                          {dia.jantar.map((item: any, itemIndex: number) => {
                            const concluida = cardapioId ? isRefeicaoConcluida(cardapioId, dia.dia, 'jantar', itemIndex) : false
                            return (
                              <div key={itemIndex} className="flex items-center gap-3 py-1">
                                <input
                                  type="checkbox"
                                  checked={concluida}
                                  onChange={(e) => {
                                    if (cardapioId) {
                                      marcarRefeicaoConcluida(cardapioId, dia.dia, 'jantar', itemIndex, e.target.checked)
                                      const novoProgresso = calcularProgressoCardapio(cardapio, cardapioId)
                                      setProgressoRefeicoes(novoProgresso)
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-2 border-lilac/40 bg-dark-card checked:bg-neon-purple checked:border-neon-purple focus:ring-2 focus:ring-neon-purple/50 cursor-pointer transition-all duration-200 flex-shrink-0"
                                />
                                <span className={`flex-1 ${concluida ? 'line-through text-text-muted opacity-60' : 'text-text-primary'}`}>
                                  - {item.nome} — {item.quantidade}
                                </span>
                              </div>
                            )
                          })}
                          {/* Dica de preparo */}
                          {(() => {
                            // Usar dica salva se disponível, senão gerar
                            const dica = dia.jantar_dica || gerarDicaRefeicao(dia.jantar, 'jantar')
                            return dica ? (
                              <div className="mt-3 ml-7 p-3 bg-dark-secondary/50 rounded-lg border border-neon-cyan/20">
                                <div className="text-neon-cyan font-semibold text-sm mb-1">💡 Dica de preparo:</div>
                                <div className="text-text-secondary italic text-sm">{dica}</div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback para formato texto (planoFormatado)
                <div className="text-lg text-text-primary font-sans leading-relaxed font-light space-y-1"
                  style={{
                    lineHeight: '1.8'
                  }}
                >
                  {cardapio.planoFormatado.split('\n').map((linha, index) => {
                  // Destacar "DIA X"
                  if (linha.trim().startsWith('DIA')) {
                    return (
                      <div key={index} className="mt-8 mb-4 text-2xl font-bold text-neon-cyan">
                        {linha}
                      </div>
                    )
                  }
                  // Destacar títulos de refeições
                  if (linha.includes('Café da manhã:') || linha.includes('Almoço:') || linha.includes('Lanche da tarde:') || linha.includes('Jantar:')) {
                    return (
                      <div key={index} className="mt-6 mb-2 text-neon-purple font-semibold text-xl">
                        {linha}
                      </div>
                    )
                  }
                  // Destacar dicas de preparo
                  if (linha.includes('💡 Dica de preparo:')) {
                    return (
                      <div key={index} className="mt-4 mb-2">
                        <span className="text-neon-cyan font-semibold">💡 Dica de preparo:</span>
                      </div>
                    )
                  }
                  // Destacar linhas de dica (que começam com "-" e contêm palavras-chave de dicas)
                  if (linha.trim().startsWith('-') && (
                    linha.includes('Cozinhe') || 
                    linha.includes('Prefira') || 
                    linha.includes('Use') || 
                    linha.includes('Evite') || 
                    linha.includes('Prepare') ||
                    linha.includes('Consuma') ||
                    linha.includes('Sirva') ||
                    linha.includes('Lave') ||
                    linha.includes('Corte') ||
                    linha.includes('Mastigue')
                  )) {
                    return (
                      <div key={index} className="ml-4 text-text-secondary italic mb-2">
                        {linha}
                      </div>
                    )
                  }
                  // Linhas normais (itens do cardápio) - com checkbox
                  if (linha.trim().startsWith('-') && !linha.includes('Cozinhe') && !linha.includes('Prefira') && !linha.includes('Use') && !linha.includes('Evite') && !linha.includes('Prepare') && !linha.includes('Consuma') && !linha.includes('Sirva') && !linha.includes('Lave') && !linha.includes('Corte') && !linha.includes('Mastigue')) {
                    // Extrair informações do item (precisamos do dia e tipo de refeição)
                    // Isso é um hack - precisamos melhorar a estrutura de dados
                    // Por enquanto, vamos usar o índice da linha para identificar
                    const itemTexto = linha.trim().substring(1).trim()
                    const itemIndex = index
                    
                    // Tentar identificar dia e refeição do contexto
                    let diaAtual = 1
                    let tipoRefeicaoAtual: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar' = 'cafe_manha'
                    
                    // Procurar contexto anterior
                    for (let i = index - 1; i >= 0; i--) {
                      const linhaAnterior = cardapio.planoFormatado.split('\n')[i]
                      if (linhaAnterior && linhaAnterior.trim().startsWith('DIA')) {
                        const match = linhaAnterior.match(/DIA\s+(\d+)/i)
                        if (match) {
                          diaAtual = parseInt(match[1])
                        }
                      }
                      if (linhaAnterior && linhaAnterior.includes('Café da manhã:')) {
                        tipoRefeicaoAtual = 'cafe_manha'
                        break
                      }
                      if (linhaAnterior && linhaAnterior.includes('Almoço:')) {
                        tipoRefeicaoAtual = 'almoco'
                        break
                      }
                      if (linhaAnterior && linhaAnterior.includes('Lanche da tarde:')) {
                        tipoRefeicaoAtual = 'lanche_tarde'
                        break
                      }
                      if (linhaAnterior && linhaAnterior.includes('Jantar:')) {
                        tipoRefeicaoAtual = 'jantar'
                        break
                      }
                    }
                    
                    // Encontrar índice do item na refeição
                    let itemIndexNaRefeicao = 0
                    const linhas = cardapio.planoFormatado.split('\n')
                    for (let i = index - 1; i >= 0; i--) {
                      if (linhas[i].includes('Café da manhã:') || linhas[i].includes('Almoço:') || linhas[i].includes('Lanche da tarde:') || linhas[i].includes('Jantar:')) {
                        break
                      }
                      if (linhas[i].trim().startsWith('-') && !linhas[i].includes('Cozinhe') && !linhas[i].includes('Prefira')) {
                        itemIndexNaRefeicao++
                      }
                    }
                    
                    const concluida = cardapioId ? isRefeicaoConcluida(cardapioId, diaAtual, tipoRefeicaoAtual, itemIndexNaRefeicao) : false
                    
                    return (
                      <div key={index} className="ml-2 flex items-center gap-3 py-1 group">
                        <input
                          type="checkbox"
                          checked={concluida}
                          onChange={(e) => {
                            if (cardapioId) {
                              marcarRefeicaoConcluida(
                                cardapioId,
                                diaAtual,
                                tipoRefeicaoAtual,
                                itemIndexNaRefeicao,
                                e.target.checked
                              )
                              // Recalcular progresso
                              const novoProgresso = calcularProgressoCardapio(cardapio, cardapioId)
                              setProgressoRefeicoes(novoProgresso)
                            }
                          }}
                          className="w-5 h-5 rounded border-2 border-lilac/40 bg-dark-card checked:bg-neon-purple checked:border-neon-purple focus:ring-2 focus:ring-neon-purple/50 cursor-pointer transition-all duration-200 flex-shrink-0"
                          style={{
                            accentColor: '#C77DFF'
                          }}
                        />
                        <span className={`flex-1 ${concluida ? 'line-through text-text-muted opacity-60' : 'text-text-primary'}`}>
                          {itemTexto}
                        </span>
                      </div>
                    )
                  }
                  // Linhas vazias
                  if (linha.trim() === '') {
                    return <div key={index} className="h-2" />
                  }
                  // Outras linhas
                  return <div key={index}>{linha}</div>
                })}
              </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
