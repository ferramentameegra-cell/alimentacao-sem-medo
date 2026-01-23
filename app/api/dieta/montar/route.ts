import { NextRequest, NextResponse } from 'next/server'
import { montarPlanoSemanal, formatarPlano, DadosUsuario } from '@/lib/montador_dieta'
import { getSessao, salvarCardapio, criarConta, criarSessao } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('X-Session-Id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessão não encontrada. Faça login novamente.' },
        { status: 401 }
      )
    }

    let session = getSessao(sessionId || '')
    let conta = session?.conta

    // Se não tem sessão, criar conta temporária
    if (!conta) {
      const emailTemp = `temp_${Date.now()}@temp.com`
      conta = criarConta(emailTemp, 'temp123')
      const newSessionId = criarSessao(conta)
      
      return NextResponse.json({
        error: 'Sessão criada. Use o novo sessionId.',
        sessionId: newSessionId,
      }, { status: 401 })
    }

    // Verificar se tem plano
    if (!conta.plano) {
      return NextResponse.json(
        { error: 'É necessário ter um plano ativo para gerar cardápios. Acesse a página de planos.' },
        { status: 403 }
      )
    }

    // Garantir que a conta tem o array de cardápios
    if (!conta.cardapios) {
      conta.cardapios = []
    }

    const dadosUsuario: DadosUsuario = await request.json()

    // Validar dados obrigatórios
    if (!dadosUsuario.peso || !dadosUsuario.altura || !dadosUsuario.idade) {
      return NextResponse.json(
        { error: 'Dados incompletos. Peso, altura e idade são obrigatórios.' },
        { status: 400 }
      )
    }

    if (!dadosUsuario.condicao_digestiva) {
      return NextResponse.json(
        { error: 'Condição digestiva é obrigatória.' },
        { status: 400 }
      )
    }

    // Montar plano semanal
    const plano = montarPlanoSemanal(dadosUsuario)

    // Formatar para exibição
    const planoFormatado = formatarPlano(plano)

    // Determinar número de dias
    const dias = plano.dias.length

    // Calcular semana e mês atual
    const agora = new Date()
    const semana = Math.ceil(agora.getDate() / 7)
    const mes = agora.getMonth() + 1
    const ano = agora.getFullYear()

    // Salvar cardápio na conta
    const cardapioSalvo = salvarCardapio(conta.id, {
      dadosUsuario,
      plano,
      planoFormatado,
      dias,
      semana,
      mes,
      ano,
    })

    return NextResponse.json({
      plano,
      planoFormatado,
      dadosUsuario,
      cardapioId: cardapioSalvo.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao montar plano alimentar', details: error.message },
      { status: 500 }
    )
  }
}
