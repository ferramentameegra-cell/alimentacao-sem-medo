// Sistema de autenticação simples (em produção, usar NextAuth ou similar)

import { Conta, CardapioSalvo } from './types'

// Simulação de banco de dados em memória (em produção, usar banco real)
// Em produção, usar banco de dados persistente
let contas: Conta[] = []

export interface SessionData {
  conta: Conta
  criadoEm: number // timestamp
  ultimoAcesso: number // timestamp
}

let sessions: Map<string, SessionData> = new Map()

// Duração da sessão: 30 dias (em milissegundos)
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000

export function getContaPorEmail(email: string): Conta | undefined {
  return contas.find((c) => c.email === email)
}

export function criarConta(email: string, senha: string, plano?: 1 | 2): Conta {
  // Verificar se já existe
  const contaExistente = getContaPorEmail(email)
  if (contaExistente) {
    // Se existe, atualizar senha e plano se necessário
    contaExistente.senha = btoa(senha)
    if (plano) {
      contaExistente.plano = plano
    }
    return contaExistente
  }
  
  const conta: Conta = {
    id: `conta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    senha: btoa(senha), // Em produção, usar bcrypt ou similar
    plano: plano,
    cardapios: [],
    criadoEm: new Date(),
  }
  contas.push(conta)
  return conta
}

export function fazerLogin(email: string, senha: string): Conta | null {
  const conta = contas.find(
    (c) => c.email === email && c.senha === btoa(senha)
  )
  // Garantir que cardapios existe
  if (conta) {
    if (!conta.cardapios) {
      conta.cardapios = []
    }
    return conta
  }
  return null
}

export function criarSessao(conta: Conta): string {
  const agora = Date.now()
  const sessionId = `session_${agora}_${Math.random().toString(36).substr(2, 9)}`
  
  // Garantir que a conta tem cardapios inicializado
  if (!conta.cardapios) {
    conta.cardapios = []
  }
  
  // Sempre buscar a conta atual do array para garantir referência correta
  const contaAtual = contas.find(c => c.id === conta.id) || conta
  
  // Criar sessão com timestamps
  sessions.set(sessionId, { 
    conta: contaAtual,
    criadoEm: agora,
    ultimoAcesso: agora
  })
  
  console.log('✅ Sessão criada:', sessionId, 'para conta:', contaAtual.email)
  return sessionId
}

export function getSessao(sessionId: string): SessionData | null {
  const session = sessions.get(sessionId)
  
  if (!session) {
    return null
  }
  
  // Verificar se a sessão expirou
  const agora = Date.now()
  const tempoDecorrido = agora - session.ultimoAcesso
  
  if (tempoDecorrido > SESSION_DURATION) {
    // Sessão expirada, remover
    sessions.delete(sessionId)
    console.log('⚠️ Sessão expirada removida:', sessionId)
    return null
  }
  
  // Atualizar último acesso
  session.ultimoAcesso = agora
  
  // Garantir que a conta ainda existe e está atualizada
  const contaAtual = contas.find(c => c.id === session.conta.id)
  if (contaAtual) {
    session.conta = contaAtual
  }
  
  return session
}

// Função para reautenticar usando email (útil quando sessão é perdida após reinício)
export function reautenticarPorEmail(email: string, senha: string): { session: SessionData, sessionId: string } | null {
  const conta = fazerLogin(email, senha)
  if (!conta) {
    return null
  }
  
  // Criar nova sessão
  const sessionId = criarSessao(conta)
  const session = getSessao(sessionId)
  
  if (!session) {
    return null
  }
  
  return { session, sessionId }
}

export function salvarCardapio(contaId: string, cardapio: Omit<CardapioSalvo, 'id' | 'contaId' | 'criadoEm'>): CardapioSalvo {
  const conta = contas.find(c => c.id === contaId)
  if (!conta) {
    throw new Error('Conta não encontrada')
  }

  // Garantir que cardapios existe
  if (!conta.cardapios) {
    conta.cardapios = []
  }

  const cardapioSalvo: CardapioSalvo = {
    id: `cardapio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    contaId,
    ...cardapio,
    criadoEm: new Date(),
  }

  conta.cardapios.push(cardapioSalvo)
  
  // Atualizar a sessão se existir para garantir que a referência está atualizada
  sessions.forEach((sessionData, sessionId) => {
    if (sessionData.conta.id === contaId) {
      // Buscar a conta atualizada do array para garantir referência correta
      const contaAtualizada = contas.find(c => c.id === contaId)
      if (contaAtualizada) {
        sessionData.conta = contaAtualizada
        console.log('Sessão atualizada com novo cardápio:', cardapioSalvo.id)
      }
    }
  })
  
  console.log('Cardápio salvo:', cardapioSalvo.id, 'Total de cardápios na conta:', conta.cardapios.length)
  
  return cardapioSalvo
}

export function getCardapiosPorConta(contaId: string): CardapioSalvo[] {
  const conta = contas.find(c => c.id === contaId)
  // Garantir que cardapios existe
  if (conta && !conta.cardapios) {
    conta.cardapios = []
  }
  return conta?.cardapios || []
}

export function getCardapioPorId(cardapioId: string): CardapioSalvo | undefined {
  // Buscar em todas as contas
  for (const conta of contas) {
    if (!conta.cardapios) continue
    const cardapio = conta.cardapios.find(c => c.id === cardapioId)
    if (cardapio) {
      console.log('Cardápio encontrado na conta:', conta.email, 'ID:', cardapioId)
      return cardapio
    }
  }
  console.log('Cardápio não encontrado em nenhuma conta. ID:', cardapioId)
  console.log('Total de contas:', contas.length)
  contas.forEach(conta => {
    console.log(`Conta ${conta.email}: ${conta.cardapios?.length || 0} cardápios`)
  })
  return undefined
}

// Inicializar contas de administrador
function inicializarAdmin() {
  const admins = [
    { email: 'josyasborba@hotmail.com', senha: '12345678' },
    { email: 'dr.lemoss@gmail.com', senha: 'drlemoss' },
  ]
  for (const { email, senha } of admins) {
    const contaExistente = getContaPorEmail(email)
    if (!contaExistente) {
      const admin = criarConta(email, senha, 2) // Plano 2 - Acompanhado (máximo)
      console.log('✅ Conta de administrador criada:', admin.email, 'Plano:', admin.plano)
    } else {
      contaExistente.plano = 2
      contaExistente.senha = btoa(senha)
      console.log('✅ Conta de administrador verificada:', contaExistente.email, 'Plano:', contaExistente.plano)
    }
  }
}

// Inicializar admin ao carregar o módulo
inicializarAdmin()
