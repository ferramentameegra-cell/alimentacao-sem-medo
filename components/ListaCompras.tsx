'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  gerarListaCompras,
  formatarListaCompras,
  combinarListasCompras,
  ItemListaCompras,
} from '@/lib/gerador_lista_compras'

interface CardapioSalvo {
  id: string
  planoFormatado?: string
  plano?: any
  semana?: number
  mes?: number
  ano?: number
  criadoEm?: string
}

interface ListaComprasProps {
  cardapios: CardapioSalvo[]
  onClose: () => void
}

export default function ListaCompras({ cardapios, onClose }: ListaComprasProps) {
  const [selectedView, setSelectedView] = useState<number | 'mes'>(1)
  const [listasPorSemana, setListasPorSemana] = useState<Map<number, ItemListaCompras[]>>(new Map())
  const [listaMes, setListaMes] = useState<ItemListaCompras[]>([])
  const [carregando, setCarregando] = useState(true)
  const [progresso, setProgresso] = useState(0)
  const [etapa, setEtapa] = useState('')
  const [erro, setErro] = useState('')

  const carregarListas = useCallback(async () => {
    if (cardapios.length === 0) {
      setCarregando(false)
      return
    }

    setCarregando(true)
    setProgresso(0)
    setEtapa('Analisando cardápios...')
    setErro('')

    const sessionId = localStorage.getItem('sessionId')
    const userEmail = localStorage.getItem('userEmail')
    if (!sessionId && !userEmail) {
      setErro('Faça login para ver sua lista de compras.')
      setCarregando(false)
      return
    }

    const hoje = new Date()
    const dataBr = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const mesAtual = dataBr.getMonth() + 1
    const anoAtual = dataBr.getFullYear()

    const doMes = cardapios.filter(
      (c) => c.id && c.semana != null && c.mes === mesAtual && c.ano === anoAtual
    )

    if (doMes.length === 0) {
      setListasPorSemana(new Map())
      setListaMes([])
      setCarregando(false)
      return
    }

    setProgresso(20)
    setEtapa('Extraindo ingredientes...')

    const listas = new Map<number, ItemListaCompras[]>()
    const total = doMes.length
    let processados = 0

    for (const card of doMes) {
      try {
        let res = await fetch(`/api/cardapios/${card.id}`, {
          headers: {
            'X-Session-Id': sessionId || '',
            'X-User-Email': userEmail || '',
          },
        })

        if (res.status === 401 && userEmail) {
          try {
            const loginRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, senha: '12345678' }),
            })
            if (loginRes.ok) {
              const { sessionId: sid } = await loginRes.json()
              localStorage.setItem('sessionId', sid)
              res = await fetch(`/api/cardapios/${card.id}`, {
                headers: { 'X-Session-Id': sid },
              })
            }
          } catch {
            /* ignore */
          }
        }

        if (res.ok) {
          const data = await res.json()
          const plano = data?.cardapio?.plano
          if (plano?.dias) {
            processados++
            setProgresso(20 + Math.round((processados / total) * 60))
            setEtapa(`Semana ${card.semana} (${processados}/${total})`)

            const lista = gerarListaCompras(plano)
            const semana = card.semana!

            if (listas.has(semana)) {
              listas.set(semana, combinarListasCompras([listas.get(semana)!, lista]))
            } else {
              listas.set(semana, lista)
            }
          }
        }
      } catch (e) {
        console.error('Erro ao carregar cardápio:', e)
      }
    }

    setProgresso(85)
    setEtapa('Somando quantidades do mês...')

    const todas = Array.from(listas.values())
    const consolidada = todas.length > 0 ? combinarListasCompras(todas) : []

    setListasPorSemana(listas)
    setListaMes(consolidada)
    setProgresso(100)
    setEtapa('Pronto!')
    setCarregando(false)
  }, [cardapios])

  useEffect(() => {
    carregarListas()
  }, [carregarListas])

  const copiar = () => {
    const lista = selectedView === 'mes' ? listaMes : listasPorSemana.get(selectedView) || []
    if (lista.length === 0) {
      alert('Nenhum item para copiar.')
      return
    }
    const titulo = selectedView === 'mes' ? 'MÊS COMPLETO' : `SEMANA ${selectedView}`
    const texto = formatarListaCompras(lista, titulo)
    navigator.clipboard.writeText(texto).then(
      () => alert('✅ Lista copiada!'),
      () => alert('Erro ao copiar.')
    )
  }

  const semanas = Array.from(listasPorSemana.keys()).sort((a, b) => a - b)
  const listaAtual: ItemListaCompras[] =
    selectedView === 'mes' ? listaMes : listasPorSemana.get(selectedView) || []
  const temConteudo = listaAtual.length > 0 || (selectedView === 'mes' && listaMes.length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-2xl bg-bg-secondary border border-accent-primary/30"
        style={{
          background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
          border: '1px solid rgba(110,143,61,0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-accent-secondary/30">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">🛒 Lista de Compras</h2>
            <p className="text-sm text-text-secondary">
              Peso total somado por ingrediente • Semana ou mês completo
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-accent-secondary/30 text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-accent-secondary/30 overflow-x-auto">
          {[1, 2, 3, 4].map((w) => {
            const tem = listasPorSemana.has(w)
            const sel = selectedView === w
            return (
              <button
                key={w}
                onClick={() => setSelectedView(w)}
                disabled={!tem}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  sel
                    ? 'bg-accent-primary/20 border-accent-primary/60 text-accent-primary'
                    : tem
                    ? 'border-accent-secondary/30 text-text-primary hover:border-accent-primary/50'
                    : 'border-accent-secondary/20 text-text-muted cursor-not-allowed'
                }`}
              >
                Semana {w}
                {tem && (
                  <span className="ml-1.5 text-xs opacity-80">
                    {listasPorSemana.get(w)?.length}
                  </span>
                )}
              </button>
            )
          })}
          <button
            onClick={() => setSelectedView('mes')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedView === 'mes'
                ? 'bg-accent-secondary/30 border-accent-primary/60 text-accent-primary'
                : 'border-accent-secondary/30 text-text-primary hover:border-accent-primary/50'
            }`}
          >
            📅 Mês Completo
            {listaMes.length > 0 && (
              <span className="ml-1.5 text-xs opacity-80">{listaMes.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {carregando && (
            <div className="text-center py-16">
              <div className="mb-4 max-w-xs mx-auto">
                <div className="flex justify-between text-sm text-text-secondary mb-2">
                  <span>{etapa}</span>
                  <span>{progresso}%</span>
                </div>
                <div className="h-2 bg-bg-secondary rounded-full overflow-hidden border border-accent-secondary/30">
                  <div
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-primary/80 transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
              <p className="text-text-secondary">Calculando totais por peso...</p>
            </div>
          )}

          {!carregando && erro && (
            <div className="text-center py-16">
              <p className="text-accent-primary font-medium">{erro}</p>
            </div>
          )}

          {!carregando && !erro && !temConteudo && (
            <div className="text-center py-16">
              <p className="text-text-secondary mb-2">Nenhum cardápio deste mês encontrado.</p>
              <p className="text-sm text-text-muted">
                Gere cardápios para ver a lista de compras com pesos somados.
              </p>
            </div>
          )}

          {!carregando && !erro && temConteudo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">
                  {selectedView === 'mes'
                    ? '📅 Lista Consolidada do Mês'
                    : `📋 Semana ${selectedView}`}
                </h3>
                <span className="text-sm text-text-secondary">
                  {listaAtual.length} itens • pesos somados
                </span>
              </div>

              <div className="space-y-3">
                {listaAtual.map((item, i) => (
                  <div
                    key={`${item.nome}-${i}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary/50 border border-accent-secondary/30 hover:border-accent-primary/40"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-accent-primary"
                        style={{
                          background: 'rgba(110,143,61,0.2)',
                          border: '1px solid rgba(110,143,61,0.4)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-text-primary truncate">{item.nome}</p>
                        <p className="text-xs text-text-secondary">
                          {item.ocorrencias} {item.ocorrencias === 1 ? 'vez' : 'vezes'} no período
                        </p>
                      </div>
                    </div>
                    <p className="flex-shrink-0 ml-4 font-bold text-accent-primary text-lg">
                      {item.quantidadeTotal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!carregando && temConteudo && (
          <div className="p-5 border-t border-accent-secondary/30">
            <button
              onClick={copiar}
              className="w-full py-3 px-6 rounded-xl font-bold text-text-primary transition-all"
              style={{
                background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                boxShadow: '0 4px 16px rgba(110,143,61,0.3)',
              }}
            >
              📋 Copiar lista
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
