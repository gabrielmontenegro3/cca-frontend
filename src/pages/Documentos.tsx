import { useState } from 'react'

interface Documento {
  id: number
  nome: string
  tipo: string
  data: string
  tamanho: string
  pasta: string
}

const Documentos = () => {
  const [documentos] = useState<Documento[]>([
    {
      id: 1,
      nome: 'Manual do Proprietário',
      tipo: 'PDF',
      data: '15/03/2024',
      tamanho: '2.5 MB',
      pasta: 'Manuais'
    },
    {
      id: 2,
      nome: 'Garantias e Especificações',
      tipo: 'PDF',
      data: '15/03/2024',
      tamanho: '1.8 MB',
      pasta: 'Garantias'
    },
    {
      id: 3,
      nome: 'Planta do Imóvel',
      tipo: 'PDF',
      data: '15/03/2024',
      tamanho: '3.2 MB',
      pasta: 'Plantas'
    },
    {
      id: 4,
      nome: 'Certificado de Garantia - Ar Condicionado',
      tipo: 'PDF',
      data: '20/03/2024',
      tamanho: '0.8 MB',
      pasta: 'Garantias'
    },
    {
      id: 5,
      nome: 'Manual de Instalação',
      tipo: 'PDF',
      data: '10/03/2024',
      tamanho: '1.5 MB',
      pasta: 'Manuais'
    },
    {
      id: 6,
      nome: 'Planta Baixa - Apartamento',
      tipo: 'PDF',
      data: '15/03/2024',
      tamanho: '2.1 MB',
      pasta: 'Plantas'
    }
  ])

  const [pastaAberta, setPastaAberta] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  // Agrupar documentos por pasta
  const documentosPorPasta = documentos.reduce((acc, doc) => {
    if (!acc[doc.pasta]) {
      acc[doc.pasta] = []
    }
    acc[doc.pasta].push(doc)
    return acc
  }, {} as Record<string, Documento[]>)

  // Filtrar documentos pela busca
  const documentosFiltrados = busca.trim()
    ? documentos.filter(doc =>
        doc.nome.toLowerCase().includes(busca.toLowerCase()) ||
        doc.pasta.toLowerCase().includes(busca.toLowerCase())
      )
    : documentos

  // Se houver busca, agrupar os filtrados
  const documentosFiltradosPorPasta = documentosFiltrados.reduce((acc, doc) => {
    if (!acc[doc.pasta]) {
      acc[doc.pasta] = []
    }
    acc[doc.pasta].push(doc)
    return acc
  }, {} as Record<string, Documento[]>)

  const pastas = Object.keys(busca.trim() ? documentosFiltradosPorPasta : documentosPorPasta)

  const togglePasta = (pasta: string) => {
    setPastaAberta(pastaAberta === pasta ? null : pasta)
  }

  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Documentos</h1>
          <p className="text-gray-400 text-sm mt-1">Acesse e baixe todos os documentos relacionados ao seu imóvel</p>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar documentos por nome ou pasta..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 pl-12 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
        </div>
      </div>

      {/* Pastas e Documentos */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700">
        {pastas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg font-medium mb-1">
                Nenhum documento encontrado
              </p>
              <p className="text-gray-500 text-sm">
                Tente ajustar os termos de busca
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {pastas.map((pasta) => {
              const docsNaPasta = busca.trim() ? documentosFiltradosPorPasta[pasta] : documentosPorPasta[pasta]
              const estaAberta = pastaAberta === pasta || busca.trim() !== ''

              return (
                <div key={pasta} className="transition-all">
                  {/* Cabeçalho da Pasta */}
                  <button
                    onClick={() => togglePasta(pasta)}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-700/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        <svg
                          className={`w-5 h-5 text-blue-400 transition-transform ${estaAberta ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {pasta}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {docsNaPasta.length} {docsNaPasta.length === 1 ? 'documento' : 'documentos'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Documentos da Pasta */}
                  {estaAberta && (
                    <div className="bg-gray-700/20 border-t border-gray-700/50">
                      {docsNaPasta.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                          Nenhum documento nesta pasta
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700/30">
                          {docsNaPasta.map((documento) => (
                            <div
                              key={documento.id}
                              className="p-5 hover:bg-gray-700/20 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                  <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center border border-red-500/30">
                                    <span className="text-red-400 font-bold text-xs">PDF</span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                                      {documento.nome}
                                    </h4>
                                    <div className="flex items-center space-x-4 mt-1.5">
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        {documento.tipo}
                                      </span>
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {documento.data}
                                      </span>
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                        {documento.tamanho}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 font-medium transform hover:scale-[1.02]">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  <span>Download</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documentos

