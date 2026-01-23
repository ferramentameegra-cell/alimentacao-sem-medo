'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BarraProgressoCardapio from './BarraProgressoCardapio'
import FormularioRestricoes, { RestricoesCompletas } from './FormularioRestricoes'

// Componente de Login inline
function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok && data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('userEmail', email)
        onLoginSuccess()
      } else {
        setErro(data.error || 'Email ou senha incorretos')
        setCarregando(false)
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setErro('Erro ao fazer login. Tente novamente.')
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email-login" className="block text-base font-semibold text-text-primary mb-3">
          Email
        </label>
        <input
          id="email-login"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-5 py-4 bg-dark-card border border-dark-border rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
          placeholder="seu@email.com"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>

      <div>
        <label htmlFor="senha-login" className="block text-base font-semibold text-text-primary mb-3">
          Senha
        </label>
        <input
          id="senha-login"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="w-full px-5 py-4 bg-dark-card border border-dark-border rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
          placeholder="••••••••"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>

      {erro && (
        <div className="p-4 bg-dark-card border-2 border-neon-pink/30 rounded-xl">
          <p className="text-base text-neon-pink font-medium">{erro}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full py-4 px-6 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-lg text-lg font-bold transition-all duration-300 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)'
        }}
      >
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push('/criar-conta')}
          className="text-base text-neon-cyan hover:text-lilac font-medium transition-colors"
        >
          Não tem conta? Criar conta
        </button>
      </div>
    </form>
  )
}

interface DadosFormulario {
  idade: number | null
  peso: number | null
  altura: number | null
  sexo: 'M' | 'F' | null
  rotina: 'sedentaria' | 'levemente_ativa' | 'moderadamente_ativa' | 'ativa' | null
  condicao_digestiva: 'azia' | 'refluxo' | 'ambos' | null
  objetivo: 'conforto' | 'manutencao' | 'leve_perda_peso' | null
  dias_cardapio: 1 | 7 | null
}

export default function MontarCardapio() {
  const router = useRouter()
  const [passoAtual, setPassoAtual] = useState(1)
  const [dados, setDados] = useState<DadosFormulario>({
    idade: null,
    peso: null,
    altura: null,
    sexo: null,
    rotina: null,
    condicao_digestiva: null,
    objetivo: null,
    dias_cardapio: null,
  })
  const [cardapioGerado, setCardapioGerado] = useState<string>('')
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [etapaAtual, setEtapaAtual] = useState('Analisando suas necessidades...')
  const [erro, setErro] = useState('')
  const [verificandoDadosPendentes, setVerificandoDadosPendentes] = useState(true)
  const [mostrarPlanos, setMostrarPlanos] = useState(false)
  const [cardapioPronto, setCardapioPronto] = useState(false)
  const [temPlano, setTemPlano] = useState(false)
  const [restricoes, setRestricoes] = useState<RestricoesCompletas | null>(null)
  const [mostrarFormularioRestricoes, setMostrarFormularioRestricoes] = useState(false)

  const totalPassos = 8

  // Verificar se há dados pendentes e gerar automaticamente se tiver plano
  useEffect(() => {
    const verificarEDispararGeracao = async () => {
      try {
        const dadosPendentes = localStorage.getItem('dadosCardapioPendente')
        if (!dadosPendentes) {
          setVerificandoDadosPendentes(false)
          return
        }

        // Verificar se tem plano
        const sessionId = localStorage.getItem('sessionId')
        if (!sessionId) {
          setVerificandoDadosPendentes(false)
          return
        }

        let temPlano = false
        try {
          const sessionResponse = await fetch('/api/auth/session', {
            headers: { 
              'X-Session-Id': sessionId,
              'X-User-Email': localStorage.getItem('userEmail') || '',
            },
          })
          
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            temPlano = sessionData.conta && sessionData.conta.plano
          }
        } catch (error) {
          console.error('Erro ao verificar sessão:', error)
        }

        // Se tem plano e dados pendentes, gerar automaticamente
        if (temPlano) {
          const dadosAPI = JSON.parse(dadosPendentes)
          
          // Restaurar dados no estado
          setDados({
            idade: dadosAPI.idade,
            peso: dadosAPI.peso,
            altura: dadosAPI.altura,
            sexo: dadosAPI.sexo,
            rotina: dadosAPI.rotina,
            condicao_digestiva: dadosAPI.condicao_digestiva,
            objetivo: dadosAPI.objetivo,
            dias_cardapio: dadosAPI.dias_cardapio,
          })

          // Ir direto para a geração
          setPassoAtual(totalPassos + 1) // Passo após o último (geração)
          setVerificandoDadosPendentes(false)
          
          // Disparar geração automaticamente
          await gerarCardapioComDados(dadosAPI, sessionId)
        } else {
          // Se não tem plano, restaurar dados mas manter no formulário
          const dadosAPI = JSON.parse(dadosPendentes)
          setDados({
            idade: dadosAPI.idade,
            peso: dadosAPI.peso,
            altura: dadosAPI.altura,
            sexo: dadosAPI.sexo,
            rotina: dadosAPI.rotina,
            condicao_digestiva: dadosAPI.condicao_digestiva,
            objetivo: dadosAPI.objetivo,
            dias_cardapio: dadosAPI.dias_cardapio,
          })
          setVerificandoDadosPendentes(false)
        }
      } catch (error) {
        console.error('Erro ao verificar dados pendentes:', error)
        setVerificandoDadosPendentes(false)
      }
    }

    verificarEDispararGeracao()
  }, [])

  const proximoPasso = () => {
    if (passoAtual < totalPassos) {
      setPassoAtual(passoAtual + 1)
    } else if (passoAtual === totalPassos) {
      // Após o último passo do formulário básico, mostrar formulário de restrições
      setMostrarFormularioRestricoes(true)
    }
  }

  const passoAnterior = () => {
    if (passoAtual > 1) {
      setPassoAtual(passoAtual - 1)
    }
  }

  // Função para gerar cardápio com dados específicos (usada quando volta de /planos)
  const gerarCardapioComDados = async (dadosAPI: any, sessionId: string) => {
    setErro('')
    setCarregando(true)
    setProgresso(0)
    setEtapaAtual('Analisando suas necessidades...')

    try {
      // Limpar dados pendentes
      localStorage.removeItem('dadosCardapioPendente')

      // Converter dados para formato da API se necessário
      const dadosFormatados = {
        idade: dadosAPI.idade,
        peso: dadosAPI.peso,
        altura: dadosAPI.altura,
        sexo: dadosAPI.sexo,
        rotina: dadosAPI.rotina || (dadosAPI.rotina === 'sedentaria' ? 'sedentaria' : 
                dadosAPI.rotina === 'levemente_ativa' ? 'ativa' :
                dadosAPI.rotina === 'moderadamente_ativa' ? 'ativa' : 'muito_ativa'),
        horarios: dadosAPI.horarios || {
          cafe_manha: '07:00',
          almoco: '12:30',
          lanche_tarde: '16:00',
          jantar: '19:00',
        },
        condicao_digestiva: dadosAPI.condicao_digestiva,
        objetivo: dadosAPI.objetivo,
      }

      // Verificar e reautenticar se necessário
      let sessionIdAtual = sessionId
      const userEmail = localStorage.getItem('userEmail')
      
      if (sessionIdAtual) {
        try {
          const sessionCheck = await fetch('/api/auth/session', {
            headers: {
              'X-Session-Id': sessionIdAtual,
              'X-User-Email': userEmail || '',
            },
          })
          
          if (!sessionCheck.ok && userEmail) {
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
              if (loginData.sessionId) {
                sessionIdAtual = loginData.sessionId
                localStorage.setItem('sessionId', sessionIdAtual)
              }
            }
          }
        } catch (e) {
          console.error('Erro ao verificar sessão:', e)
        }
      }

      // Chamar API com streaming
      const response = await fetch('/api/dieta/montar-stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-Id': sessionIdAtual || '',
          'X-User-Email': userEmail || '',
        },
        body: JSON.stringify(dadosFormatados),
      })

      if (!response.ok) {
        throw new Error('Erro ao iniciar geração do cardápio')
      }

      // Ler stream de progresso
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Não foi possível ler o stream de progresso')
      }

      let buffer = ''
      let cardapioGerado = null

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
                setProgresso(data.progresso)
              }
              if (data.etapa) {
                setEtapaAtual(data.etapa)
              }

              if (data.etapa && data.etapa.startsWith('Erro:')) {
                setErro(data.etapa)
                setCarregando(false)
                setProgresso(0)
                return
              }
              
              if (data.dados && data.dados.cardapioId) {
                cardapioGerado = data.dados
              }
            } catch (e) {
              console.error('Erro ao processar dados do stream:', e)
            }
          }
        }
      }

      if (cardapioGerado) {
        setProgresso(100)
        setCardapioPronto(true)
        
        // Verificar se tem plano
        const sessionId = localStorage.getItem('sessionId')
        let temPlanoVerificado = false
        
        if (sessionId) {
          try {
            const sessionResponse = await fetch('/api/auth/session', {
              headers: { 'X-Session-Id': sessionId },
            })
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json()
              temPlanoVerificado = sessionData.conta && sessionData.conta.plano
            }
          } catch (error) {
            console.error('Erro ao verificar sessão:', error)
          }
        }
        
        // Se não tem plano, mostrar mensagem de parabéns e planos
        if (!temPlanoVerificado) {
          setEtapaAtual('Parabéns, seu cardápio personalizado foi criado!')
          setCarregando(false)
          setMostrarPlanos(true)
        } else {
          setEtapaAtual('Cardápio pronto!')
          // Redirecionar será feito pelo BarraProgressoCardapio
        }
      } else {
        throw new Error('Cardápio não foi gerado corretamente')
      }
    } catch (error: any) {
      console.error('Erro ao gerar cardápio:', error)
      setErro(error.message || 'Erro ao gerar cardápio. Tente novamente.')
      setCarregando(false)
      setProgresso(0)
    }
  }

  const handleGerarCardapio = async () => {
    setErro('')
    
    // Validar se todos os dados estão preenchidos
    if (!dados.idade || !dados.peso || !dados.altura || !dados.sexo || 
        !dados.rotina || !dados.condicao_digestiva || !dados.objetivo || 
        !dados.dias_cardapio) {
      setErro('Por favor, preencha todos os campos antes de gerar o cardápio.')
      return
    }

    // Verificar se tem sessão válida e plano antes de gerar
    const sessionId = localStorage.getItem('sessionId')
    const userEmail = localStorage.getItem('userEmail')
    let temSessaoValida = false
    let temPlano = false

    // Tentar verificar sessão
    if (sessionId || userEmail) {
      try {
        let sessionResponse = sessionId ? await fetch('/api/auth/session', {
          headers: { 
            'X-Session-Id': sessionId,
            'X-User-Email': userEmail || '',
          },
        }) : null

        // Se sessão inválida mas tem email, tentar reautenticar
        if (!sessionResponse || !sessionResponse.ok) {
          if (userEmail) {
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
                if (loginData.sessionId) {
                  localStorage.setItem('sessionId', loginData.sessionId)
                  sessionResponse = await fetch('/api/auth/session', {
                    headers: { 
                      'X-Session-Id': loginData.sessionId,
                      'X-User-Email': userEmail,
                    },
                  })
                }
              }
            } catch (e) {
              console.error('Erro ao reautenticar:', e)
            }
          }
        }

        if (sessionResponse && sessionResponse.ok) {
          const sessionData = await sessionResponse.json()
          temSessaoValida = true
          temPlano = sessionData.conta && sessionData.conta.plano
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      }
    }

    // Se não tem sessão válida ou não tem plano, mostrar planos e login
    if (!temSessaoValida || !temPlano) {
      // Salvar dados do formulário para usar depois
      localStorage.setItem('dadosCardapioPendente', JSON.stringify({
        idade: dados.idade,
        peso: dados.peso,
        altura: dados.altura,
        sexo: dados.sexo,
        rotina: dados.rotina,
        condicao_digestiva: dados.condicao_digestiva,
        objetivo: dados.objetivo,
        dias_cardapio: dados.dias_cardapio,
      }))
      
      // Mostrar planos e login
      setMostrarPlanos(true)
      setTemPlano(false)
      return
    }

    // Se tem sessão e plano, continuar com a geração
    setCarregando(true)
    setProgresso(0)
    setEtapaAtual('Analisando suas necessidades...')
    setTemPlano(true)

    try {
      // Converter dados do formulário para formato da API
      const dadosAPI = {
        idade: dados.idade,
        peso: dados.peso,
        altura: dados.altura,
        sexo: dados.sexo,
        rotina: dados.rotina === 'sedentaria' ? 'sedentaria' : 
                dados.rotina === 'levemente_ativa' ? 'ativa' :
                dados.rotina === 'moderadamente_ativa' ? 'ativa' : 'muito_ativa',
        horarios: {
          cafe_manha: '07:00',
          almoco: '12:30',
          lanche_tarde: '16:00',
          jantar: '19:00',
        },
        condicao_digestiva: dados.condicao_digestiva,
        objetivo: dados.objetivo,
        // Incluir restrições se disponíveis
        ...(restricoes && {
          restricoes: restricoes.restricoes,
          tipo_alimentacao: restricoes.tipo_alimentacao,
          condicoes_saude: restricoes.condicoes_saude,
          preferencias: restricoes.preferencias,
        }),
      }

      // Usar API com streaming para progresso em tempo real
      console.log('Enviando dados para API com streaming:', dadosAPI)
      console.log('SessionId:', sessionId)

      // Verificar e reautenticar se necessário antes de fazer a requisição
      let sessionIdAtual = sessionId
      const userEmail = localStorage.getItem('userEmail')
      
      if (sessionIdAtual) {
        // Verificar se a sessão ainda é válida
        try {
          const sessionCheck = await fetch('/api/auth/session', {
            headers: {
              'X-Session-Id': sessionIdAtual,
              'X-User-Email': userEmail || '',
            },
          })
          
          if (!sessionCheck.ok && userEmail) {
            // Sessão inválida, tentar reautenticar
            console.log('Sessão inválida, tentando reautenticar...')
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
              if (loginData.sessionId) {
                sessionIdAtual = loginData.sessionId
                if (sessionIdAtual) {
                  localStorage.setItem('sessionId', sessionIdAtual)
                  console.log('✅ Reautenticação realizada, novo sessionId:', sessionIdAtual)
                }
              }
            }
          }
        } catch (e) {
          console.error('Erro ao verificar sessão:', e)
        }
      } else if (userEmail) {
        // Não tem sessionId mas tem email, tentar fazer login
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
            if (loginData.sessionId) {
              sessionIdAtual = loginData.sessionId
              if (sessionIdAtual) {
                localStorage.setItem('sessionId', sessionIdAtual)
                console.log('✅ Login realizado, sessionId:', sessionIdAtual)
              }
            }
          }
        } catch (e) {
          console.error('Erro ao fazer login:', e)
        }
      }

      // Usar EventSource ou fetch com streaming
      const response = await fetch('/api/dieta/montar-stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-Id': sessionIdAtual || '',
          'X-User-Email': userEmail || '',
        },
        body: JSON.stringify(dadosAPI),
      })

      // Se resposta não ok, tentar reautenticar e fazer retry
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
      let finalResponse = response
      
      if (!response.ok && userEmail) {
        try {
          console.log('⚠️ Resposta não ok, tentando reautenticar...')
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
            if (loginData.sessionId) {
              localStorage.setItem('sessionId', loginData.sessionId)
              console.log('✅ Reautenticação realizada, tentando novamente...')
              
              // Tentar novamente com nova sessão
              finalResponse = await fetch('/api/dieta/montar-stream', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Session-Id': loginData.sessionId,
                  'X-User-Email': userEmail,
                },
                body: JSON.stringify(dadosAPI),
              })
            }
          }
        } catch (e) {
          console.error('Erro ao reautenticar:', e)
        }
      }
      
      if (!finalResponse.ok) {
        throw new Error('Erro ao iniciar geração do cardápio')
      }

      // Ler stream de progresso
      reader = finalResponse.body?.getReader() || null
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Não foi possível ler o stream de progresso')
      }

      let buffer = ''
      let cardapioGerado = null

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Manter última linha incompleta no buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              // Atualizar progresso e etapa
              if (data.progresso !== undefined) {
                setProgresso(data.progresso)
              }
              if (data.etapa) {
                // Se não tem plano, manter mensagem personalizada
                if (!temPlano && !data.etapa.startsWith('Erro:')) {
                  setEtapaAtual('Gerando cardápio PERSONALIZADO...')
                } else {
                  setEtapaAtual(data.etapa)
                }
              }

              // Se há erro, verificar se é erro de sessão e mostrar planos/login
              if (data.etapa && data.etapa.startsWith('Erro:')) {
                if (data.etapa.includes('Sessão inválida') || data.etapa.includes('Sessão não encontrada') || data.etapa.includes('É necessário ter um plano')) {
                  // Salvar dados do formulário
                  localStorage.setItem('dadosCardapioPendente', JSON.stringify(dados))
                  
                  // Mostrar planos e login ao invés de erro
                  setErro('')
                  setCarregando(false)
                  setProgresso(0)
                  setMostrarPlanos(true)
                  setTemPlano(false)
                  return
                }
                
                // Outros erros, mostrar normalmente
                setErro(data.etapa)
                setCarregando(false)
                setProgresso(0)
                return
              }
              
              // Se recebeu novo sessionId, atualizar
              if (data.dados && data.dados.newSessionId) {
                localStorage.setItem('sessionId', data.dados.newSessionId)
                console.log('✅ Novo sessionId recebido:', data.dados.newSessionId)
              }

              // Se cardápio foi gerado, salvar dados
              if (data.dados && data.dados.cardapioId) {
                cardapioGerado = data.dados
              }
            } catch (e) {
              console.error('Erro ao processar dados do stream:', e)
            }
          }
        }
      }

      // Se chegou aqui, cardápio foi gerado com sucesso
      if (cardapioGerado) {
        console.log('Cardápio gerado com sucesso:', cardapioGerado)
        setProgresso(100)
        setCardapioPronto(true)
        
        // Verificar se tem plano
        const sessionIdFinal = localStorage.getItem('sessionId')
        let temPlanoVerificado = false
        
        if (sessionIdFinal) {
          try {
            const sessionResponse = await fetch('/api/auth/session', {
              headers: { 'X-Session-Id': sessionIdFinal },
            })
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json()
              temPlanoVerificado = sessionData.conta && sessionData.conta.plano
            }
          } catch (error) {
            console.error('Erro ao verificar sessão:', error)
          }
        }
        
        // Se não tem plano, mostrar mensagem de parabéns e planos
        if (!temPlanoVerificado) {
          setEtapaAtual('Parabéns, seu cardápio personalizado foi criado!')
          setCarregando(false)
          setMostrarPlanos(true)
        } else {
          setEtapaAtual('Cardápio pronto!')
          // Não redirecionar imediatamente - deixar a barra mostrar confetes
          // O redirecionamento será feito pelo componente BarraProgressoCardapio
        }
      } else {
        throw new Error('Cardápio não foi gerado corretamente')
      }
    } catch (error: any) {
      console.error('Erro ao gerar cardápio:', error)
      setErro(error.message || 'Erro ao gerar cardápio. Tente novamente.')
      setCarregando(false)
      setProgresso(0)
    }
  }

  const renderizarPergunta = () => {
    switch (passoAtual) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 lg:mb-10 tracking-tight">
              Qual é a sua idade?
            </h2>
            <input
              type="number"
              min="1"
              max="120"
              value={dados.idade || ''}
              onChange={(e) => setDados({ ...dados, idade: parseInt(e.target.value) || null })}
              className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-dark-card border border-dark-border rounded-lg text-xl sm:text-2xl text-text-primary text-center focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
              placeholder="Ex: 58"
              autoFocus
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-6 lg:mb-8">
              Qual é o seu peso atual (kg)?
            </h2>
            <input
              type="number"
              step="0.1"
              min="30"
              max="200"
              value={dados.peso || ''}
              onChange={(e) => setDados({ ...dados, peso: parseFloat(e.target.value) || null })}
              className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-dark-card border border-dark-border rounded-lg text-xl sm:text-2xl text-text-primary text-center focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
              placeholder="Ex: 70.5"
              autoFocus
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-6 lg:mb-8">
              Qual é a sua altura (cm)?
            </h2>
            <input
              type="number"
              min="100"
              max="250"
              value={dados.altura || ''}
              onChange={(e) => setDados({ ...dados, altura: parseInt(e.target.value) || null })}
              className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-dark-card border border-dark-border rounded-lg text-xl sm:text-2xl text-text-primary text-center focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
              placeholder="Ex: 165"
              autoFocus
            />
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-6 lg:mb-8">
              Qual é o seu sexo?
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => {
                  setDados({ ...dados, sexo: 'M' })
                  setTimeout(proximoPasso, 300)
                }}
                className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 touch-manipulation ${
                  dados.sexo === 'M'
                    ? 'border-lilac/60 bg-dark-card'
                    : 'border-dark-border bg-dark-secondary active:border-lilac/40'
                }`}
                style={dados.sexo === 'M' ? {
                  boxShadow: '0 4px 20px rgba(199, 125, 255, 0.3)'
                } : {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary">Masculino</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDados({ ...dados, sexo: 'F' })
                  setTimeout(proximoPasso, 300)
                }}
                className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 touch-manipulation ${
                  dados.sexo === 'F'
                    ? 'border-lilac/60 bg-dark-card'
                    : 'border-dark-border bg-dark-secondary active:border-lilac/40'
                }`}
                style={dados.sexo === 'F' ? {
                  boxShadow: '0 4px 20px rgba(199, 125, 255, 0.3)'
                } : {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary">Feminino</span>
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-6 lg:mb-8">
              Como é a sua rotina diária?
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                { valor: 'sedentaria', label: 'Sedentária' },
                { valor: 'levemente_ativa', label: 'Levemente ativa' },
                { valor: 'moderadamente_ativa', label: 'Moderadamente ativa' },
                { valor: 'ativa', label: 'Ativa' },
              ].map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => {
                    setDados({ ...dados, rotina: opcao.valor as any })
                    setTimeout(proximoPasso, 300)
                  }}
                  className={`w-full p-4 sm:p-5 rounded-xl border transition-all duration-300 text-left touch-manipulation ${
                    dados.rotina === opcao.valor
                      ? 'border-lilac/60 bg-dark-card'
                      : 'border-dark-border bg-dark-secondary active:border-lilac/40'
                  }`}
                  style={dados.rotina === opcao.valor ? {
                    boxShadow: '0 4px 20px rgba(199, 125, 255, 0.3)'
                  } : {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <span className="text-base sm:text-lg lg:text-xl font-medium text-text-primary">{opcao.label}</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-6 lg:mb-8">
              Qual condição digestiva você deseja tratar?
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                { valor: 'azia', label: 'Azia' },
                { valor: 'refluxo', label: 'Refluxo' },
                { valor: 'ambos', label: 'Azia + Refluxo' },
              ].map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => {
                    setDados({ ...dados, condicao_digestiva: opcao.valor as any })
                    setTimeout(proximoPasso, 300)
                  }}
                  className={`w-full p-4 sm:p-5 rounded-xl border transition-all duration-300 text-left touch-manipulation ${
                    dados.condicao_digestiva === opcao.valor
                      ? 'border-neon-cyan/60 bg-dark-card'
                      : 'border-dark-border bg-dark-secondary active:border-neon-cyan/40'
                  }`}
                  style={dados.condicao_digestiva === opcao.valor ? {
                    boxShadow: '0 4px 20px rgba(0, 240, 255, 0.3)'
                  } : {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <span className="text-base sm:text-lg lg:text-xl font-medium text-text-primary">{opcao.label}</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-6 lg:mb-8">
              Qual é o seu principal objetivo?
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                { valor: 'conforto', label: 'Conforto digestivo' },
                { valor: 'manutencao', label: 'Manutenção do peso' },
                { valor: 'leve_perda_peso', label: 'Leve perda de peso' },
              ].map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => {
                    setDados({ ...dados, objetivo: opcao.valor as any })
                    setTimeout(proximoPasso, 300)
                  }}
                  className={`w-full p-4 sm:p-5 rounded-xl border transition-all duration-300 text-left touch-manipulation ${
                    dados.objetivo === opcao.valor
                      ? 'border-lilac/60 bg-dark-card'
                      : 'border-dark-border bg-dark-secondary active:border-lilac/40'
                  }`}
                  style={dados.objetivo === opcao.valor ? {
                    boxShadow: '0 4px 20px rgba(199, 125, 255, 0.3)'
                  } : {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <span className="text-base sm:text-lg lg:text-xl font-medium text-text-primary">{opcao.label}</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-6 lg:mb-8">
              Quantos dias de cardápio você deseja gerar?
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => {
                  setDados({ ...dados, dias_cardapio: 1 })
                }}
                className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 touch-manipulation ${
                  dados.dias_cardapio === 1
                    ? 'border-lilac/60 bg-dark-card'
                    : 'border-dark-border bg-dark-secondary active:border-lilac/40'
                }`}
                style={dados.dias_cardapio === 1 ? {
                  boxShadow: '0 4px 20px rgba(199, 125, 255, 0.3)'
                } : {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary">1 dia</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDados({ ...dados, dias_cardapio: 7 })
                }}
                className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 touch-manipulation ${
                  dados.dias_cardapio === 7
                    ? 'border-lilac/60 bg-dark-card'
                    : 'border-dark-border bg-dark-secondary active:border-lilac/40'
                }`}
                style={dados.dias_cardapio === 7 ? {
                  boxShadow: '0 4px 20px rgba(199, 125, 255, 0.3)'
                } : {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary">7 dias</span>
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const podeAvancar = () => {
    switch (passoAtual) {
      case 1: return dados.idade !== null && dados.idade! > 0
      case 2: return dados.peso !== null && dados.peso! > 0
      case 3: return dados.altura !== null && dados.altura! > 0
      case 4: return dados.sexo !== null
      case 5: return dados.rotina !== null
      case 6: return dados.condicao_digestiva !== null
      case 7: return dados.objetivo !== null
      case 8: return dados.dias_cardapio !== null
      default: return false
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-12 relative">
      {/* Barra de progresso no topo - só mostrar se não estiver mostrando planos */}
      {!mostrarPlanos && (
        <BarraProgressoCardapio
          progresso={progresso}
          etapa={etapaAtual}
          mostrar={carregando}
          onCompleto={() => {
            // Quando cardápio estiver pronto e tem plano, redirecionar para home
            if (temPlano) {
              router.push('/')
            }
          }}
        />
      )}
      
      {/* Espaçamento para a barra de progresso quando estiver visível */}
      {carregando && <div className="h-24" />}
      {/* Header */}
      <div className="mb-8 lg:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 lg:mb-6 tracking-tight">
          Montar meu Cardápio
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 lg:mt-8 mb-4 lg:mb-5">
          {Array.from({ length: totalPassos }).map((_, i) => (
            <div
              key={i}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                i + 1 <= passoAtual
                  ? 'bg-neon-purple w-8 sm:w-12'
                  : 'bg-dark-border w-2 sm:w-2.5'
              }`}
              style={i + 1 <= passoAtual ? {
                boxShadow: '0 0 12px rgba(199, 125, 255, 0.5)'
              } : {}}
            />
          ))}
        </div>
        <p className="text-base sm:text-lg text-text-secondary font-light">
          Passo {passoAtual} de {totalPassos}
        </p>
      </div>

      {/* Mensagem de erro - apenas para erros que não sejam de sessão */}
      {erro && !erro.includes('Sessão') && !erro.includes('sessão') && (
        <div className="mb-6 p-6 bg-dark-card border border-neon-pink/40 rounded-xl"
          style={{
            boxShadow: '0 4px 16px rgba(255, 107, 157, 0.2)'
          }}
        >
          <p className="text-base text-neon-pink font-semibold">{erro}</p>
        </div>
      )}

      {/* Mostrar planos e login quando não tem sessão/plano */}
      {mostrarPlanos && (
        <div className="mb-12 space-y-8">
          {/* Mensagem de parabéns (só se cardápio foi gerado) */}
          {cardapioPronto && (
            <div className="bg-gradient-to-br from-dark-secondary to-dark-tertiary border-2 border-neon-purple/60 rounded-2xl p-12 text-center"
              style={{
                boxShadow: '0 8px 32px rgba(199, 125, 255, 0.4)'
              }}
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Parabéns, seu cardápio personalizado foi criado!
              </h2>
              <p className="text-xl text-text-secondary">
                Agora escolha um plano para acessar seu cardápio completo
              </p>
            </div>
          )}

          {/* Mensagem quando não tem sessão */}
          {!cardapioPronto && (
            <div className="bg-gradient-to-br from-dark-secondary to-dark-tertiary border-2 border-neon-purple/60 rounded-2xl p-12 text-center"
              style={{
                boxShadow: '0 8px 32px rgba(199, 125, 255, 0.4)'
              }}
            >
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Escolha seu plano e comece agora
              </h2>
              <p className="text-xl text-text-secondary">
                Seus dados já foram salvos. Escolha um plano e faça login para gerar seu cardápio personalizado
              </p>
            </div>
          )}

          {/* Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* PLANO 1 - Inteligente */}
            <div className="bg-dark-secondary border-2 border-dark-border rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:border-lilac/40"
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 tracking-tight">
                  Plano Inteligente
                </h2>
                <div className="flex items-baseline gap-2 mb-4 lg:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-neon-cyan">R$ 67</span>
                  <span className="text-lg sm:text-xl text-text-secondary">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Geração automática de cardápios semanais personalizados
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Perfil evolutivo do paciente
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Ajustes automáticos do cardápio
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-cyan">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Acesso total à plataforma
                  </span>
                </li>
              </ul>

              <button
                onClick={() => {
                  router.push('/criar-conta?plano=1')
                }}
                className="w-full py-4 sm:py-5 px-4 sm:px-6 bg-dark-card border-2 border-lilac/40 hover:border-lilac/60 text-white rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 touch-manipulation"
              >
                Assinar Plano Inteligente
              </button>
            </div>

            {/* PLANO 2 - Acompanhado (Premium) */}
            <div className="bg-gradient-to-br from-dark-secondary to-dark-tertiary border-2 border-neon-pink/40 rounded-2xl p-6 sm:p-8 lg:p-10 relative transition-all duration-300 hover:border-neon-pink/60 lg:scale-105"
              style={{
                boxShadow: '0 8px 32px rgba(255, 107, 157, 0.2)'
              }}
            >
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-neon-pink to-lilac rounded-full shadow-neon-pink glow-pink">
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    ⭐ Premium
                  </span>
                </div>
              </div>

              <div className="mb-6 lg:mb-8 mt-3 sm:mt-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 tracking-tight">
                  Plano Acompanhado
                </h2>
                <div className="flex items-baseline gap-2 mb-4 lg:mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-neon-pink">R$ 157</span>
                  <span className="text-lg sm:text-xl text-text-secondary">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-8 lg:mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-primary leading-relaxed font-medium">
                    <strong>Tudo do Plano Inteligente +</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Acompanhamento direto com a nutricionista
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Ajustes manuais no plano alimentar
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Atendimento via WhatsApp
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl sm:text-2xl text-neon-pink">✓</span>
                  <span className="text-base sm:text-lg text-text-secondary leading-relaxed">
                    Área de acompanhamento individual
                  </span>
                </li>
              </ul>

              <button
                onClick={() => {
                  router.push('/criar-conta?plano=2')
                }}
                className="w-full py-4 sm:py-5 px-4 sm:px-6 bg-gradient-to-r from-neon-pink to-lilac hover:from-lilac hover:to-neon-pink text-white rounded-xl text-lg sm:text-xl font-bold transition-all duration-300 shadow-neon-pink hover:shadow-large glow-pink touch-manipulation"
                style={{
                  boxShadow: '0 6px 24px rgba(255, 107, 157, 0.4)'
                }}
              >
                Assinar Plano Acompanhado
              </button>
            </div>
          </div>

          {/* Formulário de Login */}
          <div className="bg-dark-secondary border-2 border-dark-border rounded-2xl p-6 sm:p-8 lg:p-10"
            style={{
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 lg:mb-6 text-center">
              Já tem uma conta? Faça login
            </h3>
            <LoginForm 
              onLoginSuccess={async () => {
                // Após login, verificar se tem plano
                const sessionId = localStorage.getItem('sessionId')
                const dadosPendentes = localStorage.getItem('dadosCardapioPendente')
                
                if (sessionId) {
                  try {
                    const sessionResponse = await fetch('/api/auth/session', {
                      headers: { 
                        'X-Session-Id': sessionId,
                        'X-User-Email': localStorage.getItem('userEmail') || '',
                      },
                    })
                    
                    if (sessionResponse.ok) {
                      const sessionData = await sessionResponse.json()
                      const temPlano = sessionData.conta && sessionData.conta.plano
                      
                      if (temPlano && dadosPendentes) {
                        // Tem plano e dados pendentes, recarregar para gerar automaticamente
                        window.location.reload()
                      } else if (!temPlano) {
                        // Não tem plano, redirecionar para selecionar plano
                        router.push('/planos')
                      } else {
                        // Tem plano mas não tem dados pendentes, ir para home
                        router.push('/')
                      }
                    } else {
                      // Sessão inválida, redirecionar para planos
                      router.push('/planos')
                    }
                  } catch (error) {
                    console.error('Erro ao verificar sessão:', error)
                    router.push('/planos')
                  }
                } else {
                  router.push('/planos')
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Mostrar loading enquanto verifica dados pendentes */}
      {verificandoDadosPendentes ? (
        <div className="bg-dark-secondary border border-dark-border rounded-xl p-12 mb-10 text-center">
          <div className="text-xl text-neon-cyan mb-4 font-semibold">Verificando dados...</div>
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
      ) : !mostrarPlanos && !mostrarFormularioRestricoes && (
        <>
          {/* Pergunta */}
          <div className="bg-dark-secondary border border-dark-border rounded-xl p-6 sm:p-8 lg:p-12 mb-6 lg:mb-10 transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            {renderizarPergunta()}
          </div>

          {/* Navegação */}
          <div className="flex justify-between gap-3 sm:gap-4">
            <button
              onClick={passoAnterior}
              disabled={passoAtual === 1}
              className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-dark-card border border-dark-border rounded-lg text-sm sm:text-base font-semibold text-text-secondary hover:border-lilac/60 hover:text-lilac transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              Anterior
            </button>
            
            {passoAtual < totalPassos ? (
              <button
                onClick={proximoPasso}
                disabled={!podeAvancar()}
                className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-lg text-sm sm:text-base font-bold transition-all duration-300 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{
                  boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)'
                }}
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  // Ao clicar em "Gerar Cardápio", mostrar formulário de restrições primeiro
                  setMostrarFormularioRestricoes(true)
                }}
                disabled={!podeAvancar() || carregando}
                className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-lg text-sm sm:text-base font-bold transition-all duration-300 tracking-tight disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{
                  boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)'
                }}
              >
                Continuar
              </button>
            )}
          </div>
        </>
      )}

      {/* Formulário de Restrições - Passo obrigatório antes da geração */}
      {mostrarFormularioRestricoes && !mostrarPlanos && (
        <FormularioRestricoes
          onCompleto={(restricoesCompletas) => {
            setRestricoes(restricoesCompletas)
            setMostrarFormularioRestricoes(false)
            // Após completar restrições, gerar cardápio automaticamente
            handleGerarCardapio()
          }}
          dadosIniciais={restricoes || undefined}
        />
      )}

    </div>
  )
}
