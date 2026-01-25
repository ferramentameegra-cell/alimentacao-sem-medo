'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type CheckIn,
  type SentimentoCheckIn,
  type SintomaDigestivo,
  type EnergiaCheckIn,
  type SonoCheckIn,
  type EstadoEvolucao,
  type DecisaoEvolucao,
  SENTIMENTO_OPCOES,
  SINTOMAS_OPCOES,
  ENERGIAS,
  SONOS,
  registrarCheckIn,
  avaliarDecisao,
  agendarAtualizacaoCardapio,
} from '@/lib/evolucao_usuario'

interface CheckInModalProps {
  estadoAtual: EstadoEvolucao
  onClose: () => void
  onCheckInConcluido: (estado: EstadoEvolucao) => void
}

export default function CheckInModal({
  estadoAtual,
  onClose,
  onCheckInConcluido,
}: CheckInModalProps) {
  const router = useRouter()
  const [etapa, setEtapa] = useState<'formulario' | 'decisao'>('formulario')
  const [decisao, setDecisao] = useState<DecisaoEvolucao | null>(null)

  const [sentimento, setSentimento] = useState<SentimentoCheckIn | null>(null)
  const [sintomas, setSintomas] = useState<SintomaDigestivo[]>([])
  const [energia, setEnergia] = useState<EnergiaCheckIn | null>(null)
  const [sono, setSono] = useState<SonoCheckIn | null>(null)
  const [treinouHoje, setTreinouHoje] = useState<boolean | null>(null)
  const [bebeuAgua, setBebeuAgua] = useState<boolean | null>(null)
  const [saiuDieta, setSaiuDieta] = useState<boolean | null>(null)
  const [comeuMal, setComeuMal] = useState<boolean | null>(null)

  const toggleSintoma = (s: SintomaDigestivo) => {
    if (s === 'nenhum') {
      setSintomas(['nenhum'])
      return
    }
    const next = sintomas.filter((x) => x !== 'nenhum')
    if (next.includes(s)) {
      const r = next.filter((x) => x !== s)
      setSintomas(r.length ? r : [])
    } else {
      setSintomas([...next, s])
    }
  }

  const handleEnviar = () => {
    if (sentimento == null) return
    const checkIn: CheckIn = {
      timestamp: Date.now(),
      sentimento,
      sintomas: sintomas.length ? sintomas : ['nenhum'],
      energia: energia ?? 'media',
      sono: sono ?? 'regular',
      treinou_hoje: treinouHoje ?? false,
      bebeu_agua_suficiente: bebeuAgua ?? false,
      saiu_da_dieta: saiuDieta ?? false,
      comeu_algo_que_fez_mal: comeuMal ?? false,
    }
    const novoEstado = registrarCheckIn(checkIn)
    onCheckInConcluido(novoEstado)

    const d = avaliarDecisao(
      checkIn,
      novoEstado.historicoCheckIns,
      novoEstado.ultimaAtualizacaoCardapio
    )
    setDecisao(d)
    if (d.tipo === 'nada') {
      onClose()
      return
    }
    setEtapa('decisao')
  }

  const handleAtualizar = () => {
    agendarAtualizacaoCardapio('atualizar')
    onClose()
    router.push('/montar-cardapio?evolucao=atualizar')
  }

  const handleEvoluir = () => {
    agendarAtualizacaoCardapio('evoluir')
    onClose()
    router.push('/montar-cardapio?evolucao=evoluir')
  }

  const handleManter = () => {
    onClose()
  }

  const btn = (onClick: () => void, children: React.ReactNode, primary = false) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 touch-manipulation hover:-translate-y-px"
      style={
        primary
          ? {
              background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
              color: '#E9EFEA',
              boxShadow: '0 4px 16px rgba(110, 143, 61, 0.3)',
            }
          : {
              background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
              border: '1px solid rgba(110, 143, 61, 0.25)',
              color: '#E9EFEA',
            }
      }
    >
      {children}
    </button>
  )

  if (etapa === 'decisao' && decisao && decisao.tipo !== 'nada') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleManter}
          aria-hidden="true"
        />
        <div
          className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-xl"
          style={{
            background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
            border: '1px solid rgba(110, 143, 61, 0.25)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          }}
        >
          <p className="text-base sm:text-lg text-text-primary mb-6 leading-relaxed">
            {decisao.copy}
          </p>
          <div className="flex flex-col gap-3">
            {decisao.tipo === 'sugerir_atualizar' && (
              <>
                {btn(handleAtualizar, 'Atualizar cardápio agora', true)}
                {btn(handleManter, 'Manter como está')}
              </>
            )}
            {decisao.tipo === 'sugerir_evoluir' && (
              <>
                {btn(handleEvoluir, 'Evoluir cardápio', true)}
                {btn(handleManter, 'Manter atual')}
              </>
            )}
            {(decisao.tipo === 'sugerir_ajustar_ok') && (
              <>
                {btn(handleAtualizar, 'Ajustar cardápio', true)}
                {btn(handleManter, 'Manter como está')}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-xl"
        style={{
          background: 'linear-gradient(180deg, #143A36 0%, #0F2E2B 100%)',
          border: '1px solid rgba(110, 143, 61, 0.25)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Como você está hoje?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Como você está se sentindo hoje?</p>
            <div className="flex flex-wrap gap-2">
              {SENTIMENTO_OPCOES.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => setSentimento(o.valor)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sentimento === o.valor
                      ? 'bg-accent-primary/30 border-accent-primary text-text-primary'
                      : 'bg-bg-secondary/80 border border-white/10 text-text-secondary hover:border-accent-primary/40'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Sintomas digestivos (várias opções)</p>
            <div className="flex flex-wrap gap-2">
              {SINTOMAS_OPCOES.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => toggleSintoma(o.valor)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sintomas.includes(o.valor)
                      ? 'bg-accent-primary/30 border-accent-primary text-text-primary'
                      : 'bg-bg-secondary/80 border border-white/10 text-text-secondary hover:border-accent-primary/40'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Energia</p>
            <div className="flex flex-wrap gap-2">
              {ENERGIAS.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => setEnergia(o.valor)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    energia === o.valor
                      ? 'bg-accent-primary/30 border-accent-primary text-text-primary'
                      : 'bg-bg-secondary/80 border border-white/10 text-text-secondary hover:border-accent-primary/40'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Sono</p>
            <div className="flex flex-wrap gap-2">
              {SONOS.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => setSono(o.valor)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sono === o.valor
                      ? 'bg-accent-primary/30 border-accent-primary text-text-primary'
                      : 'bg-bg-secondary/80 border border-white/10 text-text-secondary hover:border-accent-primary/40'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">Treinou hoje?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTreinouHoje(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    treinouHoje === true ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setTreinouHoje(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    treinouHoje === false ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">Bebeu água suficiente?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBebeuAgua(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    bebeuAgua === true ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setBebeuAgua(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    bebeuAgua === false ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">Saiu da dieta?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSaiuDieta(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    saiuDieta === true ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setSaiuDieta(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    saiuDieta === false ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">Comeu algo que fez mal?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setComeuMal(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    comeuMal === true ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setComeuMal(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    comeuMal === false ? 'bg-accent-primary/30 text-text-primary' : 'bg-bg-secondary/80 text-text-secondary'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all"
            style={{ borderColor: 'rgba(110, 143, 61, 0.25)', color: '#E9EFEA' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEnviar}
            disabled={sentimento == null}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px"
            style={{
              background: 'linear-gradient(135deg, #6E8F3D 0%, #7FA94A 100%)',
              color: '#E9EFEA',
              boxShadow: '0 4px 16px rgba(110, 143, 61, 0.3)',
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
