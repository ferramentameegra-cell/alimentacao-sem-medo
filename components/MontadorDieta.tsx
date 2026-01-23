'use client'

import { useState } from 'react'

interface DadosUsuario {
  peso: number
  altura: number
  idade: number
  sexo: 'M' | 'F'
  rotina: 'sedentaria' | 'ativa' | 'muito_ativa'
  horarios: {
    cafe_manha: string
    almoco: string
    lanche_tarde: string
    jantar: string
  }
  condicao_digestiva: 'azia' | 'refluxo' | 'ambos'
  objetivo: 'conforto' | 'manutencao' | 'leve_perda_peso'
}

export default function MontadorDieta() {
  const [dados, setDados] = useState<Partial<DadosUsuario>>({
    rotina: 'sedentaria',
    sexo: 'F',
    condicao_digestiva: 'azia',
    objetivo: 'conforto',
    horarios: {
      cafe_manha: '07:00',
      almoco: '12:30',
      lanche_tarde: '16:00',
      jantar: '19:00',
    },
  })
  const [plano, setPlano] = useState<string>('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await fetch('/api/dieta/montar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })

      if (response.ok) {
        const data = await response.json()
        setPlano(data.planoFormatado)
      } else {
        const error = await response.json()
        setErro(error.error || 'Erro ao gerar plano')
      }
    } catch (error) {
      setErro('Erro ao gerar plano alimentar')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-text-soft mb-8">
        Montar Plano Alimentar Personalizado
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={dados.peso || ''}
              onChange={(e) => setDados({ ...dados, peso: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Altura (cm)
            </label>
            <input
              type="number"
              required
              value={dados.altura || ''}
              onChange={(e) => setDados({ ...dados, altura: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Idade
            </label>
            <input
              type="number"
              required
              value={dados.idade || ''}
              onChange={(e) => setDados({ ...dados, idade: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Sexo
            </label>
            <select
              required
              value={dados.sexo || 'F'}
              onChange={(e) => setDados({ ...dados, sexo: e.target.value as 'M' | 'F' })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            >
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Rotina
            </label>
            <select
              required
              value={dados.rotina || 'sedentaria'}
              onChange={(e) => setDados({ ...dados, rotina: e.target.value as any })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            >
              <option value="sedentaria">Sedentária</option>
              <option value="ativa">Ativa</option>
              <option value="muito_ativa">Muito Ativa</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Condição Digestiva
            </label>
            <select
              required
              value={dados.condicao_digestiva || 'azia'}
              onChange={(e) => setDados({ ...dados, condicao_digestiva: e.target.value as any })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            >
              <option value="azia">Azia</option>
              <option value="refluxo">Refluxo</option>
              <option value="ambos">Azia e Refluxo</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Objetivo
            </label>
            <select
              required
              value={dados.objetivo || 'conforto'}
              onChange={(e) => setDados({ ...dados, objetivo: e.target.value as any })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            >
              <option value="conforto">Conforto Digestivo</option>
              <option value="manutencao">Manutenção</option>
              <option value="leve_perda_peso">Leve Perda de Peso</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Café da manhã
            </label>
            <input
              type="time"
              required
              value={dados.horarios?.cafe_manha || '07:00'}
              onChange={(e) => setDados({
                ...dados,
                horarios: { ...dados.horarios!, cafe_manha: e.target.value }
              })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Almoço
            </label>
            <input
              type="time"
              required
              value={dados.horarios?.almoco || '12:30'}
              onChange={(e) => setDados({
                ...dados,
                horarios: { ...dados.horarios!, almoco: e.target.value }
              })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Lanche da tarde
            </label>
            <input
              type="time"
              required
              value={dados.horarios?.lanche_tarde || '16:00'}
              onChange={(e) => setDados({
                ...dados,
                horarios: { ...dados.horarios!, lanche_tarde: e.target.value }
              })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-text-soft mb-2">
              Jantar
            </label>
            <input
              type="time"
              required
              value={dados.horarios?.jantar || '19:00'}
              onChange={(e) => setDados({
                ...dados,
                horarios: { ...dados.horarios!, jantar: e.target.value }
              })}
              className="w-full px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft"
            />
          </div>
        </div>

        {erro && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-base text-red-400">{erro}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-4 px-6 bg-neon-blue/20 hover:bg-neon-blue/30 border-2 border-neon-blue rounded-lg text-xl font-semibold text-neon-blue transition-all duration-300 glow-blue disabled:opacity-50"
        >
          {carregando ? 'Gerando plano...' : 'Gerar Plano Alimentar Semanal'}
        </button>
      </form>

      {plano && (
        <div className="mt-8 p-6 bg-dark-secondary border-2 border-neon-green/30 rounded-lg">
          <h2 className="text-2xl font-bold text-text-soft mb-4">
            Seu Plano Alimentar Semanal
          </h2>
          <pre className="text-base text-text-soft whitespace-pre-wrap font-sans">
            {plano}
          </pre>
        </div>
      )}
    </div>
  )
}
