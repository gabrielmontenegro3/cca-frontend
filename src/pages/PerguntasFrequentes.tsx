import { useState } from 'react'

interface Pergunta {
  id: number
  pergunta: string
  resposta: string
  categoria: string
}

const PerguntasFrequentes = () => {
  const [perguntas] = useState<Pergunta[]>([
    {
      id: 1,
      categoria: 'Garantias',
      pergunta: 'Como funciona a garantia dos produtos?',
      resposta: 'Todos os produtos instalados no seu imóvel possuem garantia conforme especificado na documentação. A garantia cobre defeitos de fabricação e problemas relacionados à instalação adequada.'
    },
    {
      id: 2,
      categoria: 'Manutenção',
      pergunta: 'Com que frequência devo fazer manutenção preventiva?',
      resposta: 'Recomendamos manutenção preventiva a cada 6 meses para sistemas de ar condicionado e anualmente para outras instalações. Consulte a seção de Manutenção e Uso para mais detalhes.'
    },
    {
      id: 3,
      categoria: 'Documentos',
      pergunta: 'Como posso acessar os documentos do meu imóvel?',
      resposta: 'Todos os documentos estão disponíveis na seção Documentos. Você pode visualizar e baixar manuais, garantias e plantas do seu imóvel.'
    },
    {
      id: 4,
      categoria: 'Suporte',
      pergunta: 'Como entro em contato em caso de problemas?',
      resposta: 'Você pode entrar em contato através da seção Contatos ou Assistência Técnica. Para emergências, utilize o número de emergência 24 horas disponível.'
    }
  ])

  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const [busca, setBusca] = useState('')
  const categorias = ['Todas', ...Array.from(new Set(perguntas.map(p => p.categoria)))]

  const perguntasFiltradas = categoriaFiltro === 'Todas' 
    ? perguntas 
    : perguntas.filter(p => p.categoria === categoriaFiltro)

  const perguntasFinais = busca.trim()
    ? perguntasFiltradas.filter(p =>
        p.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
        p.resposta.toLowerCase().includes(busca.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busca.toLowerCase())
      )
    : perguntasFiltradas

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Garantias': 'from-green-500 to-green-600',
      'Manutenção': 'from-orange-500 to-orange-600',
      'Documentos': 'from-blue-500 to-blue-600',
      'Suporte': 'from-purple-500 to-purple-600'
    }
    return colors[categoria] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Perguntas Frequentes</h1>
          <p className="text-gray-400 text-sm mt-1">Encontre respostas para as dúvidas mais comuns</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar perguntas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 pl-12 rounded-xl border border-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex gap-3">
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="px-4 py-3 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl border border-gray-600 hover:border-gray-500 transition-all flex items-center space-x-2 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Limpar</span>
              </button>
            )}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-5 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Perguntas */}
      <div className="space-y-4">
        {perguntasFinais.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700 shadow-xl">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg font-medium mb-1">
                Nenhuma pergunta encontrada
              </p>
              <p className="text-gray-500 text-sm">
                {busca ? 'Tente ajustar os termos de busca' : 'Tente selecionar outra categoria'}
              </p>
            </div>
          </div>
        ) : (
          perguntasFinais.map((pergunta) => (
            <div
              key={pergunta.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl hover:border-gray-600 transition-all"
            >
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r ${getCategoriaColor(pergunta.categoria)} text-white shadow-lg`}>
                  {pergunta.categoria}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pergunta.pergunta}
              </h3>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                <p className="text-gray-300 leading-relaxed flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pergunta.resposta}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PerguntasFrequentes

