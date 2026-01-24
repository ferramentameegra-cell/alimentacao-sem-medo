'use client'

import { useEffect, useState } from 'react'
import { gerarListaCompras, formatarListaCompras, combinarListasCompras } from '@/lib/gerador_lista_compras'

interface CardapioSalvo {
  id: string
  planoFormatado: string
  plano: any
  semana?: number
  mes?: number
  ano?: number
  criadoEm: string
}

interface ListaComprasProps {
  cardapios: CardapioSalvo[]
  onClose: () => void
}

export default function ListaCompras({ cardapios, onClose }: ListaComprasProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | 'mes'>(1) // Por padrão, mostrar semana 1
  const [listasPorSemana, setListasPorSemana] = useState<Map<number, any[]>>(new Map())
  const [listaMes, setListaMes] = useState<any[]>([]) // Lista consolidada do mês (ingredientes somados)
  const [carregando, setCarregando] = useState(true)
  const [progresso, setProgresso] = useState(0)
  const [etapaAtual, setEtapaAtual] = useState('Sua lista de compras está sendo calculada...')
  const [erro, setErro] = useState('')

  // Carregar listas de compras para cada semana
  useEffect(() => {
    const carregarListas = async () => {
      setCarregando(true)
      setProgresso(0)
      setEtapaAtual('Sua lista de compras está sendo calculada...')
      setErro('')

      try {
        const sessionId = localStorage.getItem('sessionId')
        const userEmail = localStorage.getItem('userEmail')
        
        if (!sessionId && !userEmail) {
          setErro('Sessão não encontrada. Faça login novamente.')
          setCarregando(false)
          return
        }

        setProgresso(10)
        setEtapaAtual('Analisando seus cardápios...')
        await new Promise(resolve => setTimeout(resolve, 200))

        const listas = new Map<number, any[]>()
        const listasParaCombinar: any[][] = []

        // Obter mês e ano atual para filtrar apenas cardápios do mês atual
        const hoje = new Date()
        const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        const mesAtual = dataBrasilia.getMonth() + 1
        const anoAtual = dataBrasilia.getFullYear()

        setProgresso(20)
        setEtapaAtual('Filtrando cardápios do mês atual...')
        await new Promise(resolve => setTimeout(resolve, 200))

        // Filtrar cardápios do mês atual
        const cardapiosMesAtual = cardapios.filter(c => 
          c.id && c.semana && c.mes === mesAtual && c.ano === anoAtual
        )

        if (cardapiosMesAtual.length === 0) {
          setListasPorSemana(listas)
          setListaMes([])
          setCarregando(false)
          return
        }

        setProgresso(30)
        setEtapaAtual(`Processando ${cardapiosMesAtual.length} cardápio${cardapiosMesAtual.length > 1 ? 's' : ''}...`)

        // Carregar lista de compras para cada semana
        const totalCardapios = cardapiosMesAtual.length
        let cardapiosProcessados = 0

        for (const cardapio of cardapiosMesAtual) {
          try {
            let response = await fetch(`/api/cardapios/${cardapio.id}`, {
              headers: {
                'X-Session-Id': sessionId || '',
                'X-User-Email': userEmail || '',
              },
            })

            // Se sessão inválida, tentar reautenticar
            if (response.status === 401 && userEmail) {
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
                  
                  response = await fetch(`/api/cardapios/${cardapio.id}`, {
                    headers: {
                      'X-Session-Id': newSessionId,
                    },
                  })
                }
              } catch (retryError) {
                console.error('Erro ao reautenticar:', retryError)
              }
            }

            if (response.ok) {
              const data = await response.json()
              const cardapioData = data.cardapio
              
              if (cardapioData.plano && cardapioData.plano.dias) {
                // Atualizar progresso
                cardapiosProcessados++
                const progressoCardapio = 30 + (cardapiosProcessados / totalCardapios) * 50
                setProgresso(Math.round(progressoCardapio))
                setEtapaAtual(`Processando semana ${cardapio.semana}... (${cardapiosProcessados}/${totalCardapios})`)
                
                // Gerar lista APENAS para esta semana específica
                const lista = gerarListaCompras(cardapioData.plano)
                
                if (lista.length > 0) {
                  const semana = cardapio.semana!
                  
                  // Se já existe lista para esta semana, combinar
                  if (listas.has(semana)) {
                    const listaExistente = listas.get(semana) || []
                    const listaCombinada = combinarListasCompras([listaExistente, lista])
                    listas.set(semana, listaCombinada)
                  } else {
                    listas.set(semana, lista)
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Erro ao carregar cardápio da semana ${cardapio.semana}:`, error)
          }
        }

        setProgresso(85)
        setEtapaAtual('Somando quantidades do mês completo...')
        await new Promise(resolve => setTimeout(resolve, 300))

        // Gerar lista consolidada do mês (ingredientes repetidos somados)
        const todasListas = Array.from(listas.values())
        if (todasListas.length > 0) {
          // Combinar todas as semanas e somar ingredientes iguais
          const listaCompleta = combinarListasCompras(todasListas)
          setListaMes(listaCompleta)
        } else {
          setListaMes([])
        }

        setProgresso(95)
        setEtapaAtual('Finalizando...')
        await new Promise(resolve => setTimeout(resolve, 200))

        setListasPorSemana(listas)
        
        // Selecionar primeira semana disponível se a selecionada não existir
        if (selectedWeek !== 'mes' && !listas.has(selectedWeek)) {
          const primeiraSemana = Array.from(listas.keys()).sort((a, b) => a - b)[0]
          if (primeiraSemana) {
            setSelectedWeek(primeiraSemana)
          } else if (listas.size === 0) {
            // Se não há semanas, manter seleção atual ou mudar para 'mes' se não houver dados
            if (listaMes.length === 0) {
              setSelectedWeek('mes')
            }
          }
        }
      } catch (error: any) {
        console.error('Erro ao gerar listas de compras:', error)
        setErro(error.message || 'Erro ao gerar listas de compras.')
      } finally {
        setCarregando(false)
      }
    }

    if (cardapios.length > 0) {
      carregarListas()
    } else {
      setCarregando(false)
    }
  }, [cardapios])

  const copiarLista = () => {
    let textoParaCopiar = ''
    let titulo = ''

    if (selectedWeek === 'mes') {
      // Para mês completo, copiar lista consolidada
      if (listaMes.length === 0) {
        alert('Nenhum item encontrado para copiar.')
        return
      }
      textoParaCopiar = formatarListaCompras(listaMes, 'MÊS COMPLETO (CONSOLIDADO)')
      titulo = 'Mês Completo (Consolidado)'
    } else {
      // Para semana específica, copiar apenas aquela semana
      const listaSemana = listasPorSemana.get(selectedWeek) || []
      if (listaSemana.length === 0) {
        alert('Nenhum item encontrado para copiar.')
        return
      }
      textoParaCopiar = formatarListaCompras(listaSemana, `SEMANA ${selectedWeek}`)
      titulo = `Semana ${selectedWeek}`
    }

    navigator.clipboard.writeText(textoParaCopiar).then(() => {
      alert(`✅ Lista de compras da ${titulo.toLowerCase()} copiada para a área de transferência!`)
    }).catch(() => {
      alert('Erro ao copiar lista. Tente novamente.')
    })
  }

  // Obter lista atual baseada na seleção
  // Se for 'mes', mostrar todas as semanas separadas + lista consolidada
  // Se for semana específica, mostrar apenas aquela semana
  
  // Verificar quais semanas têm dados
  const semanasDisponiveis = Array.from(listasPorSemana.keys()).sort((a, b) => a - b)
  
  // Lista atual para exibição
  const listaAtual = selectedWeek === 'mes' 
    ? listaMes // Lista consolidada (ingredientes somados de todas as semanas)
    : (listasPorSemana.get(selectedWeek) || [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-3 sm:p-4"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))'
      }}
    >
      <div className="relative w-full max-w-5xl max-h-[calc(100vh-env(safe-area-inset-top,0)-env(safe-area-inset-bottom,0)-2rem)] bg-bg-secondary/98 backdrop-blur-sm border border-accent-primary/30 rounded-2xl flex flex-col overflow-hidden animate-genio-appear"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.98) 0%, rgba(14, 11, 20, 0.98) 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(110, 143, 61, 0.2)',
          maxHeight: 'calc(100vh - 2rem - env(safe-area-inset-top, 0) - env(safe-area-inset-bottom, 0))'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-accent-secondary/30 bg-bg-secondary/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-1 tracking-tight">
                🛒 Lista de Compras
              </h2>
              <p className="text-sm text-text-secondary font-light">
                Navegue pelas semanas ou visualize o mês completo
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-bg-secondary hover:bg-dark-tertiary border border-accent-secondary/30 text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 transition-all duration-300 flex items-center justify-center flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Abas de semanas - melhorado */}
        <div className="px-6 pt-4 pb-3 border-b border-accent-secondary/30 bg-bg-secondary/30">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4].map((week) => {
              const temDados = listasPorSemana.has(week)
              const estaSelecionada = selectedWeek === week
              
              return (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  disabled={!temDados}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-lg border transition-all duration-300 ${
                    estaSelecionada
                      ? 'border-accent-primary/80 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 shadow-lg'
                      : temDados
                      ? 'border-accent-secondary/30 bg-bg-secondary hover:border-accent-primary/50 hover:bg-bg-secondary'
                      : 'border-accent-secondary/20 bg-dark-tertiary/50 opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    boxShadow: estaSelecionada 
                      ? '0 4px 20px rgba(199, 125, 255, 0.4)'
                      : '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <span className={`text-sm font-semibold ${
                    estaSelecionada 
                      ? 'text-accent-primary' 
                      : temDados 
                      ? 'text-text-primary' 
                      : 'text-text-muted'
                  }`}>
                    Semana {week}
                    {temDados && (
                      <span className="ml-2 text-xs opacity-70">
                        ({listasPorSemana.get(week)?.length || 0} itens)
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
            <button
              onClick={() => setSelectedWeek('mes')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-lg border transition-all duration-300 ${
                selectedWeek === 'mes'
                  ? 'border-accent-primary/80 bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 shadow-lg'
                  : 'border-accent-secondary/30 bg-bg-secondary hover:border-accent-primary/50 hover:bg-bg-secondary'
              }`}
              style={{
                boxShadow: selectedWeek === 'mes'
                  ? '0 4px 20px rgba(0, 240, 255, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              <span className={`text-sm font-semibold ${
                selectedWeek === 'mes' ? 'text-accent-primary' : 'text-text-primary'
              }`}>
                📅 Mês Completo
                {listaMes.length > 0 && (
                  <span className="ml-2 text-xs opacity-70">
                    ({listaMes.length} itens)
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {carregando ? (
            <div className="text-center py-20">
              {/* Barra de progresso */}
              <div className="mb-8 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-text-secondary">{etapaAtual}</span>
                  <span className="text-sm font-bold text-accent-primary">{progresso}%</span>
                </div>
                <div className="w-full h-3 bg-bg-secondary rounded-full overflow-hidden border border-accent-secondary/30">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-primary/80 transition-all duration-500 ease-out"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
              
              {/* Ícones animados */}
              <div className="flex justify-center gap-4 mb-4">
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🛒</div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>📋</div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🧮</div>
              </div>
              
              <div className="text-lg text-text-secondary font-light">
                Aguarde enquanto calculamos suas compras...
              </div>
            </div>
          ) : erro ? (
            <div className="text-center py-20">
              <div className="p-6 bg-bg-secondary border border-accent-primary/40 rounded-xl inline-block">
                <p className="text-base text-accent-primary font-semibold">{erro}</p>
              </div>
            </div>
          ) : listaAtual.length > 0 || (selectedWeek === 'mes' && semanasDisponiveis.length > 0) ? (
            <div className="space-y-6">
              {selectedWeek === 'mes' ? (
                <>
                  {/* MÊS COMPLETO: Mostrar todas as semanas separadas + lista consolidada */}
                  
                  {/* Título */}
                  <div className="mb-6 pb-4 border-b border-accent-secondary/30">
                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                      📅 Lista de Compras do Mês Completo
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Ingredientes organizados por semana e lista consolidada final
                    </p>
                  </div>

                  {/* Lista de cada semana separadamente */}
                  {semanasDisponiveis.map((semana) => {
                    const listaSemana = listasPorSemana.get(semana) || []
                    if (listaSemana.length === 0) return null
                    
                    return (
                      <div key={semana} className="mb-8">
                        <div className="mb-4 pb-3 border-b border-accent-secondary/20">
                          <h4 className="text-xl font-bold text-accent-primary mb-1">
                            📋 Semana {semana}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            {listaSemana.length} itens únicos (quantidades já somadas)
                          </p>
                        </div>
                        
                        <div className="grid gap-3">
                          {listaSemana.map((item, index) => (
                            <div
                              key={`semana-${semana}-${item.nome}-${index}`}
                              className="flex items-center justify-between p-4 bg-bg-secondary border border-accent-secondary/30 rounded-xl hover:border-accent-primary/50 hover:bg-bg-secondary/50 transition-all duration-300"
                              style={{
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                              }}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
                                  <span className="text-xs font-bold text-accent-primary">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">
                                    {item.nome}
                                  </h3>
                                  <p className="text-xs text-text-secondary">
                                    {item.ocorrencias} {item.ocorrencias === 1 ? 'vez' : 'vezes'} na semana
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-4 text-right">
                                <p className="text-base font-bold text-accent-primary">
                                  {item.quantidadeTotal}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {/* Lista consolidada do mês (ingredientes somados) */}
                  {listaMes.length > 0 && (
                    <div className="mt-8 pt-6 border-t-2 border-accent-primary/30">
                      <div className="mb-4 pb-3 border-b border-accent-primary/20">
                        <h4 className="text-xl font-bold text-accent-primary mb-1">
                          🛒 Lista Consolidada do Mês
                        </h4>
                        <p className="text-xs text-text-secondary">
                          {listaMes.length} itens únicos com quantidades somadas de todas as semanas
                        </p>
                      </div>
                      
                      <div className="grid gap-3">
                        {listaMes.map((item, index) => (
                          <div
                            key={`mes-${item.nome}-${index}`}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-secondary to-bg-secondary border-2 border-accent-primary/30 rounded-xl hover:border-accent-primary/60 hover:bg-bg-secondary transition-all duration-300"
                            style={{
                              boxShadow: '0 4px 16px rgba(110, 143, 61, 0.2)'
                            }}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 border border-accent-primary/40 flex items-center justify-center">
                                <span className="text-sm font-bold text-accent-primary">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-text-primary mb-1 truncate">
                                  {item.nome}
                                </h3>
                                <p className="text-xs text-text-secondary">
                                  {item.ocorrencias} {item.ocorrencias === 1 ? 'vez' : 'vezes'} no mês (total somado)
                                </p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-4 text-right">
                              <p className="text-lg font-bold text-accent-primary">
                                {item.quantidadeTotal}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* SEMANA ESPECÍFICA: Mostrar apenas a semana selecionada */}
                  <div className="mb-6 pb-4 border-b border-accent-secondary/30">
                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                      📋 Lista de Compras - Semana {selectedWeek}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {listaAtual.length} itens únicos (quantidades já somadas da semana)
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {listaAtual.map((item, index) => (
                      <div
                        key={`${item.nome}-${index}`}
                        className="flex items-center justify-between p-4 bg-bg-secondary border border-accent-secondary/30 rounded-xl hover:border-accent-primary/50 hover:bg-bg-secondary/50 transition-all duration-300 group"
                        style={{
                          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-accent-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-text-primary mb-1 truncate">
                              {item.nome}
                            </h3>
                            <p className="text-xs text-text-secondary">
                              {item.ocorrencias} {item.ocorrencias === 1 ? 'vez' : 'vezes'} na semana
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4 text-right">
                          <p className="text-lg font-bold text-accent-primary">
                            {item.quantidadeTotal}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-4">
                <span className="text-5xl">🛒</span>
              </div>
              <p className="text-lg text-text-secondary mb-2">
                {selectedWeek === 'mes' 
                  ? 'Nenhum cardápio encontrado para gerar lista do mês.'
                  : `Nenhum item encontrado para a semana ${selectedWeek}.`}
              </p>
              <p className="text-sm text-text-muted">
                {semanasDisponiveis.length > 0 
                  ? `Tente selecionar uma das semanas disponíveis: ${semanasDisponiveis.join(', ')} ou clique em "Mês Completo"`
                  : 'Gere cardápios primeiro para ver sua lista de compras.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer com botão de copiar */}
        {((selectedWeek === 'mes' && (listaMes.length > 0 || semanasDisponiveis.length > 0)) || 
          (selectedWeek !== 'mes' && listaAtual.length > 0)) && (
          <div className="p-5 border-t border-accent-secondary/30 bg-bg-secondary/50">
            <button
              onClick={copiarLista}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-accent-primary to-accent-primary/80 hover:from-accent-primary/90 hover:to-accent-primary text-white rounded-lg text-base font-bold transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                boxShadow: '0 4px 20px rgba(199, 125, 255, 0.4)'
              }}
            >
              <span>📋</span>
              <span>
                {selectedWeek === 'mes' 
                  ? 'Copiar Lista Consolidada do Mês' 
                  : `Copiar Lista da Semana ${selectedWeek}`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
