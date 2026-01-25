/**
 * Barra de Evolução do Usuário — Estado global e check-ins
 * Influencia a geração de cardápios e sugestões de atualização/evolução.
 */

export type SentimentoCheckIn =
  | 'muito_mal'
  | 'mal'
  | 'ok'
  | 'bem'
  | 'muito_bem'

export type SintomaDigestivo =
  | 'inchaço'
  | 'dor_abdominal'
  | 'azia'
  | 'gases'
  | 'intestino_preso'
  | 'diarreia'
  | 'nenhum'

export type EnergiaCheckIn = 'baixa' | 'media' | 'alta'
export type SonoCheckIn = 'ruim' | 'regular' | 'bom'

export interface CheckIn {
  timestamp: number
  sentimento: SentimentoCheckIn
  sintomas: SintomaDigestivo[]
  energia: EnergiaCheckIn
  sono: SonoCheckIn
  treinou_hoje: boolean
  bebeu_agua_suficiente: boolean
  saiu_da_dieta: boolean
  comeu_algo_que_fez_mal: boolean
}

export type FaseEvolucao =
  | 'inicio_desregulado'
  | 'em_adaptacao'
  | 'estabilizando'
  | 'evoluindo_bem'
  | 'performance_ideal'

export interface EstadoEvolucao {
  fase: FaseEvolucao
  percentual: number // 0–100
  ultimoCheckIn: CheckIn | null
  historicoCheckIns: CheckIn[]
  ultimaAtualizacaoCardapio: number | null // timestamp
}

const FASES: { key: FaseEvolucao; label: string; min: number; max: number }[] = [
  { key: 'inicio_desregulado', label: 'Início / Desregulado', min: 0, max: 20 },
  { key: 'em_adaptacao', label: 'Em adaptação', min: 20, max: 40 },
  { key: 'estabilizando', label: 'Estabilizando', min: 40, max: 60 },
  { key: 'evoluindo_bem', label: 'Evoluindo bem', min: 60, max: 80 },
  { key: 'performance_ideal', label: 'Performance ideal', min: 80, max: 100 },
]

export const SENTIMENTO_OPCOES: { valor: SentimentoCheckIn; label: string }[] = [
  { valor: 'muito_mal', label: 'Muito mal' },
  { valor: 'mal', label: 'Mal' },
  { valor: 'ok', label: 'Ok' },
  { valor: 'bem', label: 'Bem' },
  { valor: 'muito_bem', label: 'Muito bem' },
]

export const SINTOMAS_OPCOES: { valor: SintomaDigestivo; label: string }[] = [
  { valor: 'inchaço', label: 'Inchaço' },
  { valor: 'dor_abdominal', label: 'Dor abdominal' },
  { valor: 'azia', label: 'Azia' },
  { valor: 'gases', label: 'Gases' },
  { valor: 'intestino_preso', label: 'Intestino preso' },
  { valor: 'diarreia', label: 'Diarreia' },
  { valor: 'nenhum', label: 'Nenhum' },
]

export const ENERGIAS: { valor: EnergiaCheckIn; label: string }[] = [
  { valor: 'baixa', label: 'Baixa' },
  { valor: 'media', label: 'Média' },
  { valor: 'alta', label: 'Alta' },
]

export const SONOS: { valor: SonoCheckIn; label: string }[] = [
  { valor: 'ruim', label: 'Ruim' },
  { valor: 'regular', label: 'Regular' },
  { valor: 'bom', label: 'Bom' },
]

export function percentualParaFase(p: number): FaseEvolucao {
  for (const f of FASES) {
    if (p >= f.min && p < f.max) return f.key
  }
  return 'performance_ideal'
}

export function labelFase(fase: FaseEvolucao): string {
  return FASES.find((f) => f.key === fase)?.label ?? fase
}

/** Converte check-in em contribuição para percentual (0–100). */
function checkInParaPercentual(c: CheckIn): number {
  const sentimentoScores: Record<SentimentoCheckIn, number> = {
    muito_mal: 5,
    mal: 15,
    ok: 45,
    bem: 70,
    muito_bem: 90,
  }
  let base = sentimentoScores[c.sentimento]

  if (c.sintomas.includes('nenhum') || c.sintomas.length === 0) base += 5
  else base -= c.sintomas.length * 4

  if (c.energia === 'alta') base += 5
  else if (c.energia === 'baixa') base -= 8
  if (c.sono === 'bom') base += 3
  else if (c.sono === 'ruim') base -= 5
  if (c.treinou_hoje) base += 2
  if (c.bebeu_agua_suficiente) base += 2
  if (c.saiu_da_dieta) base -= 5
  if (c.comeu_algo_que_fez_mal) base -= 10

  return Math.max(0, Math.min(100, Math.round(base)))
}

export type DecisaoEvolucao =
  | { tipo: 'sugerir_atualizar'; copy: string; botoes: 'atualizar_manter' }
  | { tipo: 'sugerir_evoluir'; copy: string; botoes: 'evoluir_manter' }
  | { tipo: 'sugerir_ajustar_ok'; copy: string; botoes: 'ajustar_manter' }
  | { tipo: 'nada'; copy?: string }

const COPIAS = {
  atualizar:
    'Percebemos que você não está se sentindo bem hoje. Quer que a gente ajuste seu cardápio para algo mais leve e confortável?',
  evoluir:
    'Que ótimo que você está se sentindo bem 🙌 Quer evoluir seu cardápio para o próximo nível?',
  ajustar_ok:
    'Notamos uma pequena mudança no seu estado. Deseja ajustar seu cardápio ou prefere continuar com o atual?',
}

const MS_24H = 24 * 60 * 60 * 1000

/**
 * Avalia o check-in e o histórico e retorna a decisão (sugerir atualizar, evoluir, ajustar ou nada).
 */
export function avaliarDecisao(
  checkIn: CheckIn,
  historico: CheckIn[],
  ultimaAtualizacaoCardapio: number | null
): DecisaoEvolucao {
  const agora = Date.now()
  const atualizouRecentemente = ultimaAtualizacaoCardapio != null && agora - ultimaAtualizacaoCardapio < MS_24H

  if (atualizouRecentemente) {
    return { tipo: 'nada' }
  }

  const nenhumSintoma = checkIn.sintomas.length === 0 || checkIn.sintomas.includes('nenhum')

  if (checkIn.sentimento === 'muito_mal' || checkIn.sentimento === 'mal') {
    return {
      tipo: 'sugerir_atualizar',
      copy: COPIAS.atualizar,
      botoes: 'atualizar_manter',
    }
  }

  if (checkIn.sentimento === 'bem' || checkIn.sentimento === 'muito_bem') {
    if (nenhumSintoma) {
      return {
        tipo: 'sugerir_evoluir',
        copy: COPIAS.evoluir,
        botoes: 'evoluir_manter',
      }
    }
    return { tipo: 'nada' }
  }

  if (checkIn.sentimento === 'ok') {
    const ultimos = historico.slice(-3).filter((h) => h.timestamp !== checkIn.timestamp)
    const piorou =
      ultimos.some((h) => h.sentimento === 'bem' || h.sentimento === 'muito_bem') ||
      (checkIn.sintomas.length > 0 && !checkIn.sintomas.includes('nenhum') && ultimos.every((h) => h.sintomas.includes('nenhum') || h.sintomas.length === 0))
    if (piorou) {
      return {
        tipo: 'sugerir_ajustar_ok',
        copy: COPIAS.ajustar_ok,
        botoes: 'ajustar_manter',
      }
    }
    if (nenhumSintoma) return { tipo: 'nada' }
    return {
      tipo: 'sugerir_ajustar_ok',
      copy: COPIAS.ajustar_ok,
      botoes: 'ajustar_manter',
    }
  }

  return { tipo: 'nada' }
}

const STORAGE_KEY = 'evolucao_usuario'

function userKey(): string {
  if (typeof window === 'undefined') return 'default'
  return localStorage.getItem('userEmail') || localStorage.getItem('sessionId') || 'default'
}

export function carregarEstadoEvolucao(): EstadoEvolucao {
  if (typeof window === 'undefined') {
    return {
      fase: 'estabilizando',
      percentual: 50,
      ultimoCheckIn: null,
      historicoCheckIns: [],
      ultimaAtualizacaoCardapio: null,
    }
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userKey()}`)
    if (!raw) return estadoInicial()
    const parsed = JSON.parse(raw) as EstadoEvolucao
    return {
      ...estadoInicial(),
      ...parsed,
      historicoCheckIns: parsed.historicoCheckIns || [],
    }
  } catch {
    return estadoInicial()
  }
}

function estadoInicial(): EstadoEvolucao {
  return {
    fase: 'estabilizando',
    percentual: 50,
    ultimoCheckIn: null,
    historicoCheckIns: [],
    ultimaAtualizacaoCardapio: null,
  }
}

export function salvarEstadoEvolucao(estado: EstadoEvolucao): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userKey()}`, JSON.stringify(estado))
  } catch (e) {
    console.error('Erro ao salvar estado evolução:', e)
  }
}

export function registrarCheckIn(checkIn: CheckIn): EstadoEvolucao {
  const estado = carregarEstadoEvolucao()
  const historico = [...(estado.historicoCheckIns || []), checkIn].slice(-50)
  const percentual = checkInParaPercentual(checkIn)
  const fase = percentualParaFase(percentual)
  const novo: EstadoEvolucao = {
    fase,
    percentual,
    ultimoCheckIn: checkIn,
    historicoCheckIns: historico,
    ultimaAtualizacaoCardapio: estado.ultimaAtualizacaoCardapio,
  }
  salvarEstadoEvolucao(novo)
  return novo
}

export function marcarCardapioAtualizado(): void {
  const estado = carregarEstadoEvolucao()
  estado.ultimaAtualizacaoCardapio = Date.now()
  salvarEstadoEvolucao(estado)
}

export function obterContextoEvolucaoParaAPI(): {
  fase: FaseEvolucao
  percentual: number
  ultimoCheckIn: CheckIn | null
  acao: 'atualizar' | 'evoluir'
} | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('evolucao_acao_pendente')
    if (!raw) return null
    const { acao } = JSON.parse(raw) as { acao: 'atualizar' | 'evoluir' }
    sessionStorage.removeItem('evolucao_acao_pendente')
    const estado = carregarEstadoEvolucao()
    return {
      fase: estado.fase,
      percentual: estado.percentual,
      ultimoCheckIn: estado.ultimoCheckIn,
      acao,
    }
  } catch {
    return null
  }
}

export function agendarAtualizacaoCardapio(acao: 'atualizar' | 'evoluir'): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('evolucao_acao_pendente', JSON.stringify({ acao }))
}
