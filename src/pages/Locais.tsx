import { useState, useEffect } from 'react'
import { dadosEstaticos, getFornecedorById } from '../data/dadosEstaticos'

type Page = 
  | 'visao-geral'
  | 'empreendimento'
  | 'garantias'
  | 'garantias-lote'
  | 'preventivos'
  | 'manutencao-uso'
  | 'locais'
  | 'produtos'
  | 'fornecedores'
  | 'contatos'
  | 'documentos'
  | 'perguntas-frequentes'
  | 'sobre-nos'
  | 'boletim-informativo'
  | 'assistencia-tecnica'

interface LocaisProps {
  setActivePage: (page: Page) => void
}

const Locais = ({ setActivePage }: LocaisProps) => {
  const [locaisFiltrados, setLocaisFiltrados] = useState(dadosEstaticos.locais)
  const [busca, setBusca] = useState('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingLocal, setViewingLocal] = useState<typeof dadosEstaticos.locais[0] | null>(null)

  // Verificar se há um local para visualizar (vindo de outra página)
  useEffect(() => {
    const localIdToView = localStorage.getItem('localToView')
    if (localIdToView) {
      localStorage.removeItem('localToView')
      const id = parseInt(localIdToView)
      const local = dadosEstaticos.locais.find(l => l.id === id)
      if (local) {
        abrirModalVisualizar(local)
      }
    }
  }, [])

  // Filtrar locais pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setLocaisFiltrados(dadosEstaticos.locais)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = dadosEstaticos.locais.filter(
        (local) => local.nome?.toLowerCase().includes(termoBusca)
      )
      setLocaisFiltrados(filtrados)
    }
  }, [busca])

  const abrirModalVisualizar = (local: typeof dadosEstaticos.locais[0]) => {
    setViewingLocal(local)
    setShowViewModal(true)
  }

  const fecharModalVisualizar = () => {
    setShowViewModal(false)
    setViewingLocal(null)
  }

  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Subsistemas afetados</h1>
          <p className="text-gray-400 text-sm mt-1">Listagem de locais do sistema</p>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nome do local..."
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

      {/* Tabela */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-800/80 border-b border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {locaisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        Nenhum local encontrado
                      </p>
                      <p className="text-gray-500 text-sm">
                        Tente ajustar os termos de busca
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                locaisFiltrados.map((local) => (
                  <tr 
                    key={local.id} 
                    className="hover:bg-gray-700/30 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                          <span className="text-xs font-bold text-purple-400">#{local.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {local.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalVisualizar(local)}
                          className="p-2.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all border border-transparent hover:border-green-500/30"
                          title="Visualizar detalhes"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Visualização */}
      {showViewModal && viewingLocal && (() => {
        const produtosLocal = dadosEstaticos.produtos.filter(p => p.locais_ids.includes(viewingLocal.id))
        
        return (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={fecharModalVisualizar}
          >
            <div 
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 p-6 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Detalhes do Local
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Informações completas do local
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fecharModalVisualizar}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Conteúdo do Modal */}
              <div className="overflow-y-auto flex-1">
                <div className="p-6 space-y-6">
                  {/* Informações Básicas */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Informações Básicas
                    </h4>
                    <div className="bg-gray-700/50 rounded-xl p-5 space-y-4 border border-gray-600/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</label>
                          <p className="text-white font-bold text-lg">{viewingLocal.id}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                          <p className="text-white font-semibold text-lg">{viewingLocal.nome}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Produtos Relacionados */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Produtos Relacionados ({produtosLocal.length})
                    </h4>
                    
                    {produtosLocal.length === 0 ? (
                      <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-gray-600/50">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-gray-400 font-medium">Nenhum produto relacionado a este local.</p>
                      </div>
                    ) : (
                      <div className="bg-gray-700/50 rounded-xl overflow-hidden border border-gray-600/50">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-800/80">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Nome</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Fornecedor</th>
                              </tr>
                            </thead>
                            <tbody className="bg-gray-700/30 divide-y divide-gray-700/50">
                              {produtosLocal.map((produto) => {
                                const fornecedor = getFornecedorById(produto.fornecedor_id)
                                return (
                                  <tr key={produto.id} className="hover:bg-gray-600/30 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm font-medium text-white">{produto.id}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          localStorage.setItem('produtoToView', produto.id.toString())
                                          setActivePage('produtos')
                                        }}
                                        className="text-sm text-white font-semibold hover:text-blue-400 transition-colors cursor-pointer text-left"
                                      >
                                        {produto.nome}
                                      </button>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {fornecedor ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            localStorage.setItem('fornecedorToView', fornecedor.id.toString())
                                            setActivePage('fornecedores')
                                          }}
                                          className="text-sm text-gray-300 hover:text-blue-400 transition-colors cursor-pointer text-left"
                                        >
                                          {fornecedor.nome}
                                        </button>
                                      ) : (
                                        <span className="text-sm text-gray-300">-</span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer do Modal */}
              <div className="bg-gray-800/50 border-t border-gray-700 p-6 flex justify-end space-x-3">
                <button
                  onClick={fecharModalVisualizar}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all font-medium border border-gray-600"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default Locais
