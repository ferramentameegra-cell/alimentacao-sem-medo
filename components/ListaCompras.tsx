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
  mes?: number
  ano?: number
  onClose: () => void
}

export default function ListaCompras({ cardapios, mes: mesProp, ano: anoProp, onClose }: ListaComprasProps) {
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
    const mes = mesProp ?? dataBr.getMonth() + 1
    const ano = anoProp ?? dataBr.getFullYear()

    const doMes = cardapios.filter(
      (c) => c.id && c.semana != null && c.mes === mes && c.ano === ano
    )

    if (doMes.length === 0) {
      setListasPorSemana(new Map())
      setListaMes([])
      setCarregando(false)
      return
    }

    setProgresso(20)
    setEtapa('Somando quantidades...')

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

    setProgresso(90)
    setEtapa('Consolidando totais...')

    const todas = Array.from(listas.values())
    const consolidada = todas.length > 0 ? combinarListasCompras(todas) : []

    setListasPorSemana(listas)
    setListaMes(consolidada)
    setProgresso(100)
    setEtapa('Pronto!')
    setCarregando(false)
  }, [cardapios, mesProp, anoProp])

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
  const temConteudo = listaAtual.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
      >
        {/* Header - título e subtítulo bem visíveis */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lista de Compras</h2>
            <p className="text-sm font-medium text-gray-700 mt-1.5">
              Total em gramas e kg • Somado da semana
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs - Semanas - separado do header */}
        <div className="flex gap-1 p-3 pt-2 border-b border-gray-100 overflow-x-auto bg-white">
          {[1, 2, 3, 4].map((w) => {
            const tem = listasPorSemana.has(w)
            const sel = selectedView === w
            return (
              <button
                key={w}
                onClick={() => setSelectedView(w)}
                disabled={!tem}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  sel
                    ? 'bg-[#6E8F3D] text-white shadow-sm'
                    : tem
                    ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Semana {w}
              </button>
            )
          })}
          <button
            onClick={() => setSelectedView('mes')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              selectedView === 'mes'
                ? 'bg-[#6E8F3D] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Mês
          </button>
        </div>

        {/* Lista - estilo iFood: cards brancos, bordas suaves */}
        <div className="flex-1 overflow-y-auto p-4">
          {carregando && (
            <div className="py-12 text-center">
              <div className="inline-block w-10 h-10 border-2 border-[#6E8F3D] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{etapa}</p>
              <p className="text-sm text-gray-400 mt-1">{progresso}%</p>
              <div className="mt-3 max-w-xs mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6E8F3D] transition-all duration-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          )}

          {!carregando && erro && (
            <div className="py-12 text-center">
              <p className="text-red-600 font-medium">{erro}</p>
            </div>
          )}

          {!carregando && !erro && !temConteudo && (
            <div className="py-12 text-center">
              <p className="text-gray-600">Nenhum cardápio deste mês.</p>
              <p className="text-sm text-gray-400 mt-1">
                Monte seu cardápio para ver a lista com totais em g/kg.
              </p>
            </div>
          )}

          {!carregando && !erro && temConteudo && (
            <div className="space-y-2">
              {listaAtual.map((item, i) => (
                <div
                  key={`${item.nome}-${i}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#6E8F3D]/30 transition-colors"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold bg-[#6E8F3D]/10 text-[#6E8F3D]"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.nome}</p>
                      <p className="text-xs text-gray-500">
                        {item.ocorrencias} {item.ocorrencias === 1 ? 'vez' : 'vezes'} no cardápio
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3 text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      {item.quantidadeTotal}
                    </p>
                    <p className="text-xs text-gray-500">total</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!carregando && temConteudo && (
          <div
            className="p-4 pt-3 border-t border-gray-100 bg-gray-50/50"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
          >
            <button
              onClick={copiar}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white text-base transition-all hover:opacity-95 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
                boxShadow: '0 4px 14px rgba(110, 143, 61, 0.35)',
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
