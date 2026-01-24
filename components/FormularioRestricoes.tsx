'use client'

import { useState, useEffect } from 'react'

export interface RestricoesCompletas {
  restricoes: {
    intolerancia_lactose?: boolean
    intolerancia_gluten?: boolean
    intolerancia_proteina_leite?: boolean
    intolerancia_frutose?: boolean
    intolerancia_histamina?: boolean
    intolerancia_soja?: boolean
    alergia_ovos?: boolean
    alergia_oleaginosas?: boolean
    alergia_frutos_mar?: boolean
    outras_restricoes?: string
  }
  tipo_alimentacao?: 
    | 'onivoro'
    | 'vegetariano'
    | 'ovolactovegetariano'
    | 'vegano'
    | 'pescetariano'
    | 'low_carb'
    | 'cetogenica'
    | 'sem_ultraprocessados'
    | 'anti_inflamatoria'
  condicoes_saude: {
    diabetes?: 'tipo1' | 'tipo2' | false
    resistencia_insulina?: boolean
    hipotireoidismo?: boolean
    hipertireoidismo?: boolean
    sop?: boolean
    hipertensao?: boolean
    colesterol_alto?: boolean
    problemas_gastrointestinais?: (
      | 'azia_refluxo'
      | 'constipacao_intestinal'
      | 'diarreia'
      | 'dor_abdominal'
      | 'sindrome_intestino_irritavel'
      | 'diverticulos_intestinais'
      | 'gases_abdome_distendido'
      | 'retocolite_doenca_crohn'
      | 'disbiose'
      | 'ma_digestao'
    )[]
    nenhuma?: boolean
  }
  preferencias: {
    alimentos_nao_gosta?: string[]
    alimentos_preferidos?: string[]
    frequencia_refeicoes?: 3 | 4 | 5 | 6
    preferencia_preparo?: 'rapido' | 'elaborado' | 'indiferente'
  }
}

interface FormularioRestricoesProps {
  onCompleto: (restricoes: RestricoesCompletas) => void
  dadosIniciais?: Partial<RestricoesCompletas>
}

export default function FormularioRestricoes({ onCompleto, dadosIniciais }: FormularioRestricoesProps) {
  const [passoAtual, setPassoAtual] = useState(1)
  const totalPassos = 4
  
  // Estado do formulário
  const [restricoes, setRestricoes] = useState<RestricoesCompletas['restricoes']>({
    intolerancia_lactose: false,
    intolerancia_gluten: false,
    intolerancia_proteina_leite: false,
    intolerancia_frutose: false,
    intolerancia_histamina: false,
    intolerancia_soja: false,
    alergia_ovos: false,
    alergia_oleaginosas: false,
    alergia_frutos_mar: false,
    outras_restricoes: '',
    ...dadosIniciais?.restricoes
  })
  
  const [tipoAlimentacao, setTipoAlimentacao] = useState<RestricoesCompletas['tipo_alimentacao']>(
    dadosIniciais?.tipo_alimentacao || 'onivoro'
  )
  
  const [condicoesSaude, setCondicoesSaude] = useState<RestricoesCompletas['condicoes_saude']>({
    diabetes: false,
    resistencia_insulina: false,
    hipotireoidismo: false,
    hipertireoidismo: false,
    sop: false,
    hipertensao: false,
    colesterol_alto: false,
    problemas_gastrointestinais: [],
    nenhuma: false,
    ...dadosIniciais?.condicoes_saude
  })
  
  const [preferencias, setPreferencias] = useState<RestricoesCompletas['preferencias']>({
    alimentos_nao_gosta: [],
    alimentos_preferidos: [],
    frequencia_refeicoes: 4,
    preferencia_preparo: 'indiferente',
    ...dadosIniciais?.preferencias
  })
  
  const [alimentoNaoGosta, setAlimentoNaoGosta] = useState('')
  const [alimentoPreferido, setAlimentoPreferido] = useState('')
  // Lista de condições gastrointestinais disponíveis
  const condicoesGI = [
    { key: 'azia_refluxo', label: 'Azia e Refluxo' },
    { key: 'constipacao_intestinal', label: 'Constipação Intestinal' },
    { key: 'diarreia', label: 'Diarréia' },
    { key: 'dor_abdominal', label: 'Dor Abdominal' },
    { key: 'sindrome_intestino_irritavel', label: 'Síndrome do Intestino Irritável' },
    { key: 'diverticulos_intestinais', label: 'Divertículos Intestinais' },
    { key: 'gases_abdome_distendido', label: 'Gases e Abdome Distendido' },
    { key: 'retocolite_doenca_crohn', label: 'Retocolite ou Doença de Crohn' },
    { key: 'disbiose', label: 'Disbiose' },
    { key: 'ma_digestao', label: 'Má Digestão' },
  ] as const

  // Carregar dados salvos do perfil
  useEffect(() => {
    const carregarRestricoes = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId')
        const userEmail = localStorage.getItem('userEmail')
        
        if (sessionId || userEmail) {
          const response = await fetch('/api/perfil/restricoes', {
            headers: {
              'X-Session-Id': sessionId || '',
              'X-User-Email': userEmail || '',
            },
          })
          
          if (response.ok) {
            const dados = await response.json()
            if (dados.restricoes) {
              setRestricoes(prev => ({ ...prev, ...dados.restricoes }))
            }
            if (dados.tipo_alimentacao) {
              setTipoAlimentacao(dados.tipo_alimentacao)
            }
            if (dados.condicoes_saude) {
              setCondicoesSaude(prev => ({ ...prev, ...dados.condicoes_saude }))
            }
            if (dados.preferencias) {
              setPreferencias(prev => ({ ...prev, ...dados.preferencias }))
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar restrições:', error)
      }
    }
    
    carregarRestricoes()
  }, [])

  const proximoPasso = () => {
    if (passoAtual < totalPassos) {
      setPassoAtual(passoAtual + 1)
    } else {
      finalizar()
    }
  }

  const passoAnterior = () => {
    if (passoAtual > 1) {
      setPassoAtual(passoAtual - 1)
    }
  }

  const finalizar = () => {
    const dadosCompletos: RestricoesCompletas = {
      restricoes,
      tipo_alimentacao: tipoAlimentacao,
      condicoes_saude: condicoesSaude,
      preferencias
    }
    
    // Salvar no perfil
    salvarRestricoes(dadosCompletos)
    
    onCompleto(dadosCompletos)
  }

  const salvarRestricoes = async (dados: RestricoesCompletas) => {
    try {
      const sessionId = localStorage.getItem('sessionId')
      const userEmail = localStorage.getItem('userEmail')
      
      await fetch('/api/perfil/restricoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId || '',
          'X-User-Email': userEmail || '',
        },
        body: JSON.stringify(dados),
      })
    } catch (error) {
      console.error('Erro ao salvar restrições:', error)
    }
  }

  const adicionarAlimentoNaoGosta = () => {
    if (alimentoNaoGosta.trim()) {
      setPreferencias(prev => ({
        ...prev,
        alimentos_nao_gosta: [...(prev.alimentos_nao_gosta || []), alimentoNaoGosta.trim()]
      }))
      setAlimentoNaoGosta('')
    }
  }

  const removerAlimentoNaoGosta = (index: number) => {
    setPreferencias(prev => ({
      ...prev,
      alimentos_nao_gosta: prev.alimentos_nao_gosta?.filter((_, i) => i !== index) || []
    }))
  }

  const adicionarAlimentoPreferido = () => {
    if (alimentoPreferido.trim()) {
      setPreferencias(prev => ({
        ...prev,
        alimentos_preferidos: [...(prev.alimentos_preferidos || []), alimentoPreferido.trim()]
      }))
      setAlimentoPreferido('')
    }
  }

  const removerAlimentoPreferido = (index: number) => {
    setPreferencias(prev => ({
      ...prev,
      alimentos_preferidos: prev.alimentos_preferidos?.filter((_, i) => i !== index) || []
    }))
  }

  const toggleCondicaoGI = (condicaoKey: typeof condicoesGI[number]['key']) => {
    setCondicoesSaude(prev => {
      const problemasAtuais = prev.problemas_gastrointestinais || []
      const jaExiste = problemasAtuais.includes(condicaoKey)
      
      return {
        ...prev,
        problemas_gastrointestinais: jaExiste
          ? problemasAtuais.filter(c => c !== condicaoKey)
          : [...problemasAtuais, condicaoKey],
        nenhuma: false // Se selecionar alguma condição, desmarcar "nenhuma"
      }
    })
  }

  const toggleRestricao = (key: keyof typeof restricoes) => {
    if (key === 'outras_restricoes') return
    setRestricoes(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleCondicaoSaude = (key: keyof typeof condicoesSaude) => {
    if (key === 'problemas_gastrointestinais') return
    if (key === 'diabetes') {
      setCondicoesSaude(prev => ({
        ...prev,
        diabetes: prev.diabetes === 'tipo1' ? 'tipo2' : prev.diabetes === 'tipo2' ? false : 'tipo1'
      }))
    } else if (key === 'nenhuma') {
      setCondicoesSaude(prev => ({
        ...prev,
        nenhuma: !prev.nenhuma,
        diabetes: false,
        resistencia_insulina: false,
        hipotireoidismo: false,
        hipertireoidismo: false,
        sop: false,
        hipertensao: false,
        colesterol_alto: false,
        problemas_gastrointestinais: []
      }))
    } else {
      setCondicoesSaude(prev => ({
        ...prev,
        [key]: !prev[key],
        nenhuma: false
      }))
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-12">
      {/* Indicador de progresso */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm sm:text-base text-text-secondary">
            Passo {passoAtual} de {totalPassos}
          </span>
          <span className="text-sm sm:text-base text-text-secondary">
            {Math.round((passoAtual / totalPassos) * 100)}%
          </span>
        </div>
        <div className="w-full bg-dark-secondary rounded-full h-2 sm:h-3">
          <div
            className="bg-gradient-to-r from-neon-purple to-lilac h-full rounded-full transition-all duration-300"
            style={{ width: `${(passoAtual / totalPassos) * 100}%` }}
          />
        </div>
      </div>

      {/* PASSO 1: Intolerâncias e Alergias */}
      {passoAtual === 1 && (
        <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
            Intolerâncias e Alergias
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8">
            Selecione todas as restrições que se aplicam a você. Isso garantirá que seu cardápio seja 100% seguro.
          </p>

          <div className="space-y-4 sm:space-y-5">
            {[
              { key: 'intolerancia_lactose', label: 'Intolerância à lactose' },
              { key: 'intolerancia_gluten', label: 'Intolerância ao glúten (doença celíaca ou sensibilidade)' },
              { key: 'intolerancia_proteina_leite', label: 'Intolerância à proteína do leite' },
              { key: 'intolerancia_frutose', label: 'Intolerância à frutose' },
              { key: 'intolerancia_histamina', label: 'Intolerância à histamina' },
              { key: 'intolerancia_soja', label: 'Intolerância à soja' },
              { key: 'alergia_ovos', label: 'Alergia a ovos' },
              { key: 'alergia_oleaginosas', label: 'Alergia a oleaginosas (castanhas, amendoim, nozes)' },
              { key: 'alergia_frutos_mar', label: 'Alergia a frutos do mar' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center p-4 sm:p-5 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-card/80 transition-colors touch-manipulation"
              >
                <input
                  type="checkbox"
                  checked={restricoes[key as keyof typeof restricoes] as boolean || false}
                  onChange={() => toggleRestricao(key as keyof typeof restricoes)}
                  className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border rounded focus:ring-2 focus:ring-lilac/50"
                />
                <span className="ml-4 text-base sm:text-lg text-text-primary">{label}</span>
              </label>
            ))}

            <div className="mt-6">
              <label className="block text-base sm:text-lg font-semibold text-text-primary mb-3">
                Outras intolerâncias ou alergias (opcional)
              </label>
              <textarea
                value={restricoes.outras_restricoes || ''}
                onChange={(e) => setRestricoes(prev => ({ ...prev, outras_restricoes: e.target.value }))}
                placeholder="Descreva outras restrições alimentares que você possui..."
                className="w-full px-4 sm:px-6 py-4 sm:py-5 bg-dark-card border border-dark-border rounded-lg text-base sm:text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* PASSO 2: Tipo de Alimentação */}
      {passoAtual === 2 && (
        <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
            Tipo de Alimentação
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8">
            Selecione o padrão alimentar que você segue. O cardápio será gerado exclusivamente dentro deste padrão.
          </p>

          <div className="space-y-4 sm:space-y-5">
            {[
              { value: 'onivoro', label: 'Onívoro (como de tudo)' },
              { value: 'vegetariano', label: 'Vegetariano' },
              { value: 'ovolactovegetariano', label: 'Ovolactovegetariano' },
              { value: 'vegano', label: 'Vegano' },
              { value: 'pescetariano', label: 'Pescetariano' },
              { value: 'low_carb', label: 'Low carb' },
              { value: 'cetogenica', label: 'Cetogênica' },
              { value: 'sem_ultraprocessados', label: 'Dieta sem ultraprocessados' },
              { value: 'anti_inflamatoria', label: 'Dieta anti-inflamatória' },
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center p-4 sm:p-5 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-card/80 transition-colors touch-manipulation"
              >
                <input
                  type="radio"
                  name="tipo_alimentacao"
                  value={value}
                  checked={tipoAlimentacao === value}
                  onChange={() => setTipoAlimentacao(value as RestricoesCompletas['tipo_alimentacao'])}
                  className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border focus:ring-2 focus:ring-lilac/50"
                />
                <span className="ml-4 text-base sm:text-lg text-text-primary">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* PASSO 3: Condições de Saúde */}
      {passoAtual === 3 && (
        <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
            Condições de Saúde
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8">
            Essas informações ajudam a personalizar o cardápio nutricionalmente.
          </p>

          <div className="space-y-4 sm:space-y-5">
            <label className="flex items-center p-4 sm:p-5 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-card/80 transition-colors touch-manipulation">
              <input
                type="checkbox"
                checked={condicoesSaude.nenhuma || false}
                onChange={() => toggleCondicaoSaude('nenhuma')}
                className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border rounded focus:ring-2 focus:ring-lilac/50"
              />
              <span className="ml-4 text-base sm:text-lg text-text-primary">Nenhuma condição de saúde</span>
            </label>

            <div className="p-4 sm:p-5 bg-dark-card rounded-lg">
              <label className="flex items-center mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={condicoesSaude.diabetes === 'tipo1' || condicoesSaude.diabetes === 'tipo2'}
                  onChange={() => toggleCondicaoSaude('diabetes')}
                  className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border rounded focus:ring-2 focus:ring-lilac/50"
                />
                <span className="ml-4 text-base sm:text-lg text-text-primary">Diabetes</span>
              </label>
              {condicoesSaude.diabetes && (
                <div className="ml-9 mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="diabetes_tipo"
                      checked={condicoesSaude.diabetes === 'tipo1'}
                      onChange={() => setCondicoesSaude(prev => ({ ...prev, diabetes: 'tipo1' }))}
                      className="w-4 h-4 text-neon-purple"
                    />
                    <span className="ml-2 text-sm sm:text-base text-text-secondary">Tipo 1</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="diabetes_tipo"
                      checked={condicoesSaude.diabetes === 'tipo2'}
                      onChange={() => setCondicoesSaude(prev => ({ ...prev, diabetes: 'tipo2' }))}
                      className="w-4 h-4 text-neon-purple"
                    />
                    <span className="ml-2 text-sm sm:text-base text-text-secondary">Tipo 2</span>
                  </label>
                </div>
              )}
            </div>

            {[
              { key: 'resistencia_insulina', label: 'Resistência à insulina' },
              { key: 'hipotireoidismo', label: 'Hipotireoidismo' },
              { key: 'hipertireoidismo', label: 'Hipertireoidismo' },
              { key: 'sop', label: 'SOP (Síndrome dos Ovários Policísticos)' },
              { key: 'hipertensao', label: 'Hipertensão' },
              { key: 'colesterol_alto', label: 'Colesterol alto' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center p-4 sm:p-5 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-card/80 transition-colors touch-manipulation"
              >
                <input
                  type="checkbox"
                  checked={condicoesSaude[key as keyof typeof condicoesSaude] as boolean || false}
                  onChange={() => toggleCondicaoSaude(key as keyof typeof condicoesSaude)}
                  className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border rounded focus:ring-2 focus:ring-lilac/50"
                />
                <span className="ml-4 text-base sm:text-lg text-text-primary">{label}</span>
              </label>
            ))}

            <div className="mt-6">
              <label className="block text-base sm:text-lg font-semibold text-text-primary mb-4">
                Problemas gastrointestinais
              </label>
              <p className="text-sm sm:text-base text-text-secondary mb-4">
                Selecione todas as condições que se aplicam a você. Você pode selecionar múltiplas opções.
              </p>
              <div className="space-y-3 sm:space-y-4">
                {condicoesGI.map(({ key, label }) => {
                  const estaSelecionada = condicoesSaude.problemas_gastrointestinais?.includes(key) || false
                  return (
                    <label
                      key={key}
                      className="flex items-center p-4 sm:p-5 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-card/80 transition-colors touch-manipulation"
                    >
                      <input
                        type="checkbox"
                        checked={estaSelecionada}
                        onChange={() => toggleCondicaoGI(key)}
                        className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border rounded focus:ring-2 focus:ring-lilac/50"
                      />
                      <span className="ml-4 text-base sm:text-lg text-text-primary">{label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASSO 4: Preferências */}
      {passoAtual === 4 && (
        <div className="bg-dark-secondary rounded-xl p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
            Preferências e Aversões
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8">
            Conte-nos sobre seus gostos e preferências para personalizar ainda mais seu cardápio.
          </p>

          <div className="space-y-6 sm:space-y-8">
            <div>
              <label className="block text-base sm:text-lg font-semibold text-text-primary mb-3">
                Alimentos que você não gosta ou não consome
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={alimentoNaoGosta}
                  onChange={(e) => setAlimentoNaoGosta(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarAlimentoNaoGosta()}
                  placeholder="Digite o alimento..."
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-dark-card border border-dark-border rounded-lg text-base sm:text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20"
                />
                <button
                  type="button"
                  onClick={adicionarAlimentoNaoGosta}
                  className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-neon-purple to-lilac text-white rounded-lg font-semibold hover:from-lilac hover:to-neon-purple transition-all touch-manipulation"
                >
                  Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferencias.alimentos_nao_gosta?.map((alimento, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm sm:text-base text-text-primary"
                  >
                    {alimento}
                    <button
                      type="button"
                      onClick={() => removerAlimentoNaoGosta(index)}
                      className="ml-2 text-neon-pink hover:text-neon-pink/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-text-primary mb-3">
                Alimentos preferidos (opcional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={alimentoPreferido}
                  onChange={(e) => setAlimentoPreferido(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarAlimentoPreferido()}
                  placeholder="Digite o alimento..."
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-dark-card border border-dark-border rounded-lg text-base sm:text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20"
                />
                <button
                  type="button"
                  onClick={adicionarAlimentoPreferido}
                  className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-neon-purple to-lilac text-white rounded-lg font-semibold hover:from-lilac hover:to-neon-purple transition-all touch-manipulation"
                >
                  Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferencias.alimentos_preferidos?.map((alimento, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm sm:text-base text-text-primary"
                  >
                    {alimento}
                    <button
                      type="button"
                      onClick={() => removerAlimentoPreferido(index)}
                      className="ml-2 text-neon-pink hover:text-neon-pink/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-text-primary mb-3">
                Frequência desejada de refeições por dia
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[3, 4, 5, 6].map((num) => (
                  <label
                    key={num}
                    className="flex items-center justify-center p-4 sm:p-5 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-card/80 transition-colors touch-manipulation"
                  >
                    <input
                      type="radio"
                      name="frequencia_refeicoes"
                      value={num}
                      checked={preferencias.frequencia_refeicoes === num}
                      onChange={() => setPreferencias(prev => ({ ...prev, frequencia_refeicoes: num as 3 | 4 | 5 | 6 }))}
                      className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border focus:ring-2 focus:ring-lilac/50"
                    />
                    <span className="ml-2 text-base sm:text-lg text-text-primary">{num} refeições</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-text-primary mb-3">
                Preferência por preparo
              </label>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { value: 'rapido', label: 'Refeições rápidas e práticas' },
                  { value: 'elaborado', label: 'Refeições mais elaboradas' },
                  { value: 'indiferente', label: 'Indiferente' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center p-4 sm:p-5 bg-dark-card rounded-lg cursor-pointer hover:bg-dark-card/80 transition-colors touch-manipulation"
                  >
                    <input
                      type="radio"
                      name="preferencia_preparo"
                      value={value}
                      checked={preferencias.preferencia_preparo === value}
                      onChange={() => setPreferencias(prev => ({ ...prev, preferencia_preparo: value as 'rapido' | 'elaborado' | 'indiferente' }))}
                      className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple bg-dark-secondary border-dark-border focus:ring-2 focus:ring-lilac/50"
                    />
                    <span className="ml-4 text-base sm:text-lg text-text-primary">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de navegação */}
      <div className="flex justify-between mt-8 sm:mt-10">
        <button
          type="button"
          onClick={passoAnterior}
          disabled={passoAtual === 1}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-dark-card border border-dark-border text-text-primary rounded-lg font-semibold hover:bg-dark-card/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={proximoPasso}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-neon-purple to-lilac text-white rounded-lg font-semibold hover:from-lilac hover:to-neon-purple transition-all touch-manipulation"
        >
          {passoAtual === totalPassos ? 'Finalizar' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
