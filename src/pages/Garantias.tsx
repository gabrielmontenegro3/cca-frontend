import { useState, useEffect } from 'react'
import { dadosEstaticos, getProdutoById, getFornecedorById, getLocalById } from '../data/dadosEstaticos'

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

interface GarantiasProps {
  setActivePage: (page: Page) => void
}

const Garantias = ({ setActivePage }: GarantiasProps) => {
  const [garantiasFiltradas, setGarantiasFiltradas] = useState(dadosEstaticos.garantias)
  const [busca, setBusca] = useState('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingGarantia, setViewingGarantia] = useState<typeof dadosEstaticos.garantias[0] | null>(null)

  // Verificar se há uma garantia para visualizar (vindo de outra página)
  useEffect(() => {
    const garantiaIdToView = localStorage.getItem('garantiaToView')
    if (garantiaIdToView) {
      localStorage.removeItem('garantiaToView')
      const id = parseInt(garantiaIdToView)
      const garantia = dadosEstaticos.garantias.find(g => g.id === id)
      if (garantia) {
        abrirModalVisualizar(garantia)
      }
    }
  }, [])

  // Filtrar garantias pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setGarantiasFiltradas(dadosEstaticos.garantias)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = dadosEstaticos.garantias.filter((garantia) => {
        const produto = getProdutoById(garantia.produto_id)
        const fornecedor = getFornecedorById(garantia.fornecedor_id)
        return (
          garantia.tempo?.toLowerCase().includes(termoBusca) ||
          produto?.nome?.toLowerCase().includes(termoBusca) ||
          fornecedor?.nome?.toLowerCase().includes(termoBusca) ||
          garantia.perda_garantia.some(item => item.toLowerCase().includes(termoBusca)) ||
          garantia.cuidados_produto.some(item => item.toLowerCase().includes(termoBusca))
        )
      })
      setGarantiasFiltradas(filtrados)
    }
  }, [busca])

  const abrirModalVisualizar = (garantia: typeof dadosEstaticos.garantias[0]) => {
    setViewingGarantia(garantia)
    setShowViewModal(true)
  }

  const fecharModalVisualizar = () => {
    setShowViewModal(false)
    setViewingGarantia(null)
  }

  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Prazos e escopos</h1>
          <p className="text-gray-400 text-sm mt-1">Listagem de garantias do sistema</p>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por produto, fornecedor, tempo, perda de garantia, cuidados..."
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Local</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Tempo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Compra</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Final</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {garantiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        Nenhuma garantia encontrada
                      </p>
                      <p className="text-gray-500 text-sm">
                        Tente ajustar os termos de busca
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                garantiasFiltradas.map((garantia) => {
                  const produto = getProdutoById(garantia.produto_id)
                  const fornecedor = getFornecedorById(garantia.fornecedor_id)
                  const locais = garantia.locais_ids.map(id => getLocalById(id)).filter(Boolean)
                  
                  return (
                    <tr 
                      key={garantia.id} 
                      onClick={() => abrirModalVisualizar(garantia)}
                      className="hover:bg-gray-700/30 transition-all duration-200 group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
                            <span className="text-xs font-bold text-green-400">#{garantia.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors">
                          {produto?.nome || <span className="text-gray-500 italic">Sem produto</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {locais.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {locais.slice(0, 2).map((local) => local && (
                              <span key={local.id} className="text-sm text-gray-300">
                                {local.nome}
                              </span>
                            ))}
                            {locais.length > 2 && (
                              <span className="text-xs text-gray-400">+{locais.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Sem local</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {fornecedor ? (
                          <div className="text-sm text-gray-300 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{fornecedor.nome}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Sem fornecedor</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {garantia.tempo || <span className="text-gray-500 italic">Não informado</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {garantia.data_compra}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {garantia.data_final}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              abrirModalVisualizar(garantia)
                            }}
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Visualização */}
      {showViewModal && viewingGarantia && (() => {
        const produto = getProdutoById(viewingGarantia.produto_id)
        const fornecedor = getFornecedorById(viewingGarantia.fornecedor_id)
        const locais = viewingGarantia.locais_ids.map(id => getLocalById(id)).filter(Boolean)
        
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
                        Detalhes da Garantia
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Informações completas da garantia
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Informações da Garantia
                    </h4>
                    <div className="bg-gray-700/50 rounded-xl p-5 space-y-4 border border-gray-600/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</label>
                          <p className="text-white font-bold text-lg">{viewingGarantia.id}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tempo</label>
                          <p className="text-white font-semibold text-lg">{viewingGarantia.tempo}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data da compra</label>
                          <p className="text-white">{viewingGarantia.data_compra}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data final da garantia</label>
                          <p className="text-white">{viewingGarantia.data_final}</p>
                        </div>
                      </div>
                      {viewingGarantia.perda_garantia.length > 0 && (
                        <div className="border-t border-gray-600/50 pt-4 mt-4">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Perda da garantia em caso de:</label>
                          <ul className="mt-2 space-y-1">
                            {viewingGarantia.perda_garantia.map((item, index) => (
                              <li key={index} className="text-white text-sm flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {viewingGarantia.cuidados_produto.length > 0 && (
                        <div className="border-t border-gray-600/50 pt-4 mt-4">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cuidados com o produto:</label>
                          <ul className="mt-2 space-y-1">
                            {viewingGarantia.cuidados_produto.map((item, index) => (
                              <li key={index} className="text-white text-sm flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Produto */}
                  {produto && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Produto
                      </h4>
                      <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                          <button
                            onClick={() => {
                              localStorage.setItem('produtoToView', produto.id.toString())
                              setActivePage('produtos')
                            }}
                            className="text-white font-semibold hover:text-blue-400 transition-colors cursor-pointer text-left"
                          >
                            {produto.nome}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Local */}
                  {locais.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Locais ({locais.length})
                      </h4>
                      <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50">
                        <div className="flex flex-wrap gap-2">
                          {locais.map((local) => local && (
                            <button
                              key={local.id}
                              onClick={() => {
                                localStorage.setItem('localToView', local.id.toString())
                                setActivePage('locais')
                              }}
                              className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600"
                            >
                              {local.nome}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fornecedor */}
                  {fornecedor && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Fornecedor
                      </h4>
                      <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                            <button
                              onClick={() => {
                                localStorage.setItem('fornecedorToView', fornecedor.id.toString())
                                setActivePage('fornecedores')
                              }}
                              className="text-white font-semibold hover:text-blue-400 transition-colors cursor-pointer text-left"
                            >
                              {fornecedor.nome}
                            </button>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Local</label>
                            <p className="text-white">{fornecedor.local}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CNPJ</label>
                            <p className="text-white">{fornecedor.cnpj}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone 1</label>
                            <p className="text-white">{fornecedor.telefone1}</p>
                          </div>
                          {fornecedor.telefone2 && (
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone 2</label>
                              <p className="text-white">{fornecedor.telefone2}</p>
                            </div>
                          )}
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Endereço</label>
                            <p className="text-white">{fornecedor.endereco}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

export default Garantias
