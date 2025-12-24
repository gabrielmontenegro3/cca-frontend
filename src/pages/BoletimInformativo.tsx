import { useState } from 'react'

interface Boletim {
  id: number
  titulo: string
  data: string
  categoria: string
  resumo: string
}

const BoletimInformativo = () => {
  const [boletins] = useState<Boletim[]>([
    {
      id: 1,
      titulo: 'Novas Funcionalidades do Sistema',
      data: '01/04/2024',
      categoria: 'Sistema',
      resumo: 'Conheça as novas funcionalidades disponíveis na plataforma CCA.'
    },
    {
      id: 2,
      titulo: 'Dicas de Manutenção Preventiva',
      data: '15/03/2024',
      categoria: 'Manutenção',
      resumo: 'Aprenda como realizar a manutenção preventiva dos equipamentos do seu imóvel.'
    },
    {
      id: 3,
      titulo: 'Atualização de Garantias',
      data: '10/03/2024',
      categoria: 'Garantias',
      resumo: 'Informações importantes sobre as garantias dos produtos instalados.'
    }
  ])

  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const categorias = ['Todas', ...Array.from(new Set(boletins.map(b => b.categoria)))]

  const boletinsFiltrados = categoriaFiltro === 'Todas' 
    ? boletins 
    : boletins.filter(b => b.categoria === categoriaFiltro)

  const boletinsFinais = busca.trim()
    ? boletinsFiltrados.filter(b =>
        b.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        b.resumo.toLowerCase().includes(busca.toLowerCase()) ||
        b.categoria.toLowerCase().includes(busca.toLowerCase())
      )
    : boletinsFiltrados

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Sistema': 'from-blue-500 to-blue-600',
      'Manutenção': 'from-orange-500 to-orange-600',
      'Garantias': 'from-green-500 to-green-600'
    }
    return colors[categoria] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Boletim Informativo</h1>
          <p className="text-gray-400 text-sm mt-1">Fique por dentro das últimas notícias e atualizações</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar boletins..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 pl-12 rounded-xl border border-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
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
              className="px-5 py-3 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Boletins */}
      <div className="space-y-4">
        {boletinsFinais.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700 shadow-xl">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg font-medium mb-1">
                Nenhum boletim encontrado
              </p>
              <p className="text-gray-500 text-sm">
                {busca ? 'Tente ajustar os termos de busca' : 'Tente selecionar outra categoria'}
              </p>
            </div>
          </div>
        ) : (
          boletinsFinais.map((boletim) => (
            <div
              key={boletim.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r ${getCategoriaColor(boletim.categoria)} text-white shadow-lg`}>
                      {boletim.categoria}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {boletim.data}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors flex items-start gap-2">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    {boletim.titulo}
                  </h3>
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <p className="text-gray-300 leading-relaxed">{boletim.resumo}</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all flex items-center space-x-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 font-medium transform hover:scale-[1.02]">
                <span>Ler mais</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BoletimInformativo

