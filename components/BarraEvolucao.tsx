'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  carregarEstadoEvolucao,
  labelFase,
  avaliarDecisao,
  agendarAtualizacaoCardapio,
  type EstadoEvolucao,
  type FaseEvolucao,
} from '@/lib/evolucao_usuario'
import CheckInModal from './CheckInModal'

const FASE_COLORS: Record<FaseEvolucao, string> = {
  inicio_desregulado: 'rgba(180, 80, 80, 0.6)',
  em_adaptacao: 'rgba(200, 140, 60, 0.6)',
  estabilizando: 'rgba(110, 143, 61, 0.5)',
  evoluindo_bem: 'rgba(110, 143, 61, 0.75)',
  performance_ideal: 'rgba(110, 143, 61, 1)',
}

export default function BarraEvolucao() {
  const router = useRouter()
  const [estado, setEstado] = useState<EstadoEvolucao | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  useEffect(() => {
    setEstado(carregarEstadoEvolucao())
  }, [])

  const onCheckInConcluido = (novoEstado: EstadoEvolucao) => {
    setEstado(novoEstado)
  }

  // Analisar se o usuário precisa adaptar o cardápio com base no último check-in
  const deveMostrarAdaptar =
    estado?.ultimoCheckIn &&
    estado.historicoCheckIns?.length > 0
  const decisao = deveMostrarAdaptar
    ? avaliarDecisao(
        estado!.ultimoCheckIn!,
        estado!.historicoCheckIns ?? [],
        estado!.ultimaAtualizacaoCardapio
      )
    : null
  const mostrarBotaoAdaptar =
    decisao &&
    (decisao.tipo === 'sugerir_atualizar' || decisao.tipo === 'sugerir_ajustar_ok')

  const handleAdaptarCardapio = () => {
    agendarAtualizacaoCardapio('atualizar')
    router.push('/montar-cardapio?evolucao=atualizar')
  }

  if (!estado) return null

  const p = Math.max(0, Math.min(100, estado.percentual))
  const cor = FASE_COLORS[estado.fase]

  return (
    <>
      <div
        className="mb-6 rounded-xl border p-4 transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
          borderColor: 'rgba(110, 143, 61, 0.25)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        <p className="text-xs sm:text-sm text-accent-primary font-semibold mb-2 tracking-wide">
          Sua evolução
        </p>
        <div className="h-3 rounded-full overflow-hidden bg-black/20 mb-2">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${p}%`,
              background: `linear-gradient(90deg, ${FASE_COLORS.inicio_desregulado} 0%, ${FASE_COLORS.em_adaptacao} 25%, ${FASE_COLORS.estabilizando} 50%, ${FASE_COLORS.evoluindo_bem} 75%, ${cor} 100%)`,
              boxShadow: `0 0 12px ${cor}`,
            }}
          />
        </div>
        <p className="text-sm text-text-secondary font-medium mb-4">
          {labelFase(estado.fase)}
        </p>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 touch-manipulation hover:-translate-y-px"
          style={{
            background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
            color: '#E9EFEA',
            boxShadow: '0 4px 16px rgba(110, 143, 61, 0.3)',
          }}
        >
          Atualizar como estou hoje
        </button>
        {mostrarBotaoAdaptar && (
          <button
            type="button"
            onClick={handleAdaptarCardapio}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 touch-manipulation hover:-translate-y-px mt-2"
            style={{
              background: 'linear-gradient(135deg, #7FA94A 0%, #8FBA5A 100%)',
              color: '#E9EFEA',
              border: '1px solid rgba(110, 143, 61, 0.4)',
              boxShadow: '0 4px 12px rgba(110, 143, 61, 0.25)',
            }}
          >
            Adaptar meu cardápio
          </button>
        )}
        <p className="text-xs text-text-secondary/80 mt-3 leading-relaxed">
          Quanto mais você atualiza seu estado, mais inteligente e preciso fica seu cardápio.
        </p>
      </div>

      {modalAberto && (
        <CheckInModal
          estadoAtual={estado}
          onClose={() => setModalAberto(false)}
          onCheckInConcluido={onCheckInConcluido}
        />
      )}
    </>
  )
}
