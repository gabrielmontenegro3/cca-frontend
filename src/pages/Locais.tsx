import { useState, useEffect } from 'react'
import { locaisService } from '../services/locaisService'
import { produtosNovoService } from '../services/produtosNovoService'
import { Local, ProdutoNovo, CriarLocalDTO, AtualizarLocalDTO } from '../types'
import { useToast, ToastContainer } from '../components/ToastContainer'

const Locais = () => {
  const [locais, setLocais] = useState<Local[]>([])
  const [locaisFiltrados, setLocaisFiltrados] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingLocal, setEditingLocal] = useState<Local | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  
  // Estados para modal de visualização
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingLocal, setViewingLocal] = useState<Local | null>(null)
  const [produtosLocal, setProdutosLocal] = useState<ProdutoNovo[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  
  // Toast
  const { showToast, removeToast, toasts } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    plano_preventivo: ''
  })

  useEffect(() => {
    carregarLocais()
  }, [])

  // Verificar se há um local para visualizar (vindo de outra página) quando locais forem carregados
  useEffect(() => {
    const localIdToView = localStorage.getItem('localToView')
    if (localIdToView && locais.length > 0) {
      localStorage.removeItem('localToView')
      const id = parseInt(localIdToView)
      const local = locais.find(l => l.id === id)
      if (local) {
        abrirModalVisualizar(local)
      }
    }
  }, [locais])

  const carregarLocais = async () => {
    try {
      setLoading(true)
      const dados = await locaisService.listar()
      setLocais(dados)
      setLocaisFiltrados(dados)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar locais')
      console.error('Erro ao carregar locais:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar locais pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setLocaisFiltrados(locais)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = locais.filter(
        (local) =>
          local.nome?.toLowerCase().includes(termoBusca) ||
          local.plano_preventivo?.toLowerCase().includes(termoBusca)
      )
      setLocaisFiltrados(filtrados)
    }
  }, [busca, locais])

  const abrirModalNovo = () => {
    setEditingLocal(null)
    setFormData({
      nome: '',
      plano_preventivo: ''
    })
    setShowModal(true)
  }

  const abrirModalVisualizar = async (local: Local) => {
    setViewingLocal(local)
    setShowViewModal(true)
    setLoadingProdutos(true)
    
    try {
      // Buscar todos os produtos e filtrar aqueles que têm este local associado
      const todosProdutos = await produtosNovoService.listar()
      const produtosRelacionados = todosProdutos.filter(produto => 
        produto.locais?.some(l => l.id === local.id)
      )
      setProdutosLocal(produtosRelacionados)
    } catch (err) {
      console.error('Erro ao carregar produtos do local:', err)
      setProdutosLocal([])
    } finally {
      setLoadingProdutos(false)
    }
  }

  const fecharModalVisualizar = () => {
    setShowViewModal(false)
    setViewingLocal(null)
    setProdutosLocal([])
  }

  const abrirModalEditar = (local: Local) => {
    if (!local.id) {
      showToast('Erro: Local não possui ID válido para edição', 'error')
      return
    }
    
    setEditingLocal(local)
    setFormData({
      nome: local.nome || '',
      plano_preventivo: local.plano_preventivo || ''
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingLocal(null)
    setFormData({
      nome: '',
      plano_preventivo: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (editingLocal && editingLocal.id) {
        // ✅ EDITAR: PUT /api/locais/{id}
        const dados: AtualizarLocalDTO = {
          nome: formData.nome.trim() || undefined,
          plano_preventivo: formData.plano_preventivo.trim() || undefined
        }
        
        await locaisService.atualizar(editingLocal.id, dados)
        showToast('Local atualizado com sucesso!', 'success')
      } else {
        // ✅ CRIAR: POST /api/locais
        if (!formData.nome.trim()) {
          throw new Error('Nome é obrigatório')
        }
        
        const dados: CriarLocalDTO = {
          nome: formData.nome.trim(),
          plano_preventivo: formData.plano_preventivo.trim() || undefined
        }
        
        await locaisService.criar(dados)
        showToast('Local criado com sucesso!', 'success')
      }

      await carregarLocais()
      fecharModal()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao salvar local'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao salvar local:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (!id) {
        showToast('ID do local não encontrado', 'error')
        return
      }

      await locaisService.remover(id)
      await carregarLocais()
      setShowDeleteConfirm(null)
      showToast('Local removido com sucesso!', 'success')
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao remover local'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao remover local:', err)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Locais</h1>
        <p className="text-gray-400 mb-6">Gerencie os locais do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando locais...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Locais</h1>
        <p className="text-gray-400 mb-6">Gerencie os locais do sistema</p>
        <div className="bg-red-900 border border-red-700 p-6 rounded-lg shadow-lg">
          <p className="text-red-200">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Locais</h1>
      <p className="text-gray-400 mb-6">Gerencie os locais do sistema</p>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nome ou plano preventivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-2 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

          <button
            onClick={() => setBusca('')}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 flex items-center space-x-2"
          >
            <span>Limpar Busca</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors flex items-center space-x-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Local</span>
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plano Preventivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {locaisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    {busca ? 'Nenhum local encontrado com o termo buscado.' : 'Nenhum local cadastrado.'}
                  </td>
                </tr>
              ) : (
                locaisFiltrados.map((local) => (
                  <tr 
                    key={local.id} 
                    className="hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => abrirModalVisualizar(local)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{local.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-semibold">{local.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{local.plano_preventivo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => abrirModalEditar(local)}
                          className="text-gray-400 hover:text-gray-300 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(local.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingLocal ? 'Editar Local' : 'Novo Local'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingLocal ? 'Atualize os dados do local' : 'Preencha os dados para cadastrar um novo local'}
                  </p>
                </div>
                <button
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Apartamento 101"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plano Preventivo (opcional)
                </label>
                <select
                  value={formData.plano_preventivo}
                  onChange={(e) => setFormData({ ...formData, plano_preventivo: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                >
                  <option value="">Selecione um plano</option>
                  <option value="mensal">Mensal</option>
                  <option value="3 meses">3 meses</option>
                  <option value="6 meses">6 meses</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : editingLocal ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && viewingLocal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={fecharModalVisualizar}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Detalhes do Local
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Informações completas do local
                  </p>
                </div>
                <button
                  onClick={fecharModalVisualizar}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informações do Local */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Informações do Local
                </h4>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">ID</label>
                      <p className="text-white font-semibold">{viewingLocal.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Nome</label>
                      <p className="text-white font-semibold">{viewingLocal.nome}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Plano Preventivo</label>
                      <p className="text-white">{viewingLocal.plano_preventivo || '-'}</p>
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
                
                {loadingProdutos ? (
                  <div className="bg-gray-700 rounded-lg p-6 text-center">
                    <p className="text-gray-300">Carregando produtos...</p>
                  </div>
                ) : produtosLocal.length === 0 ? (
                  <div className="bg-gray-700 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Nenhum produto relacionado a este local.</p>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Especificação Técnica</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fornecedor</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-700 divide-y divide-gray-600">
                          {produtosLocal.map((produto) => (
                            <tr key={produto.id} className="hover:bg-gray-600 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-white">{produto.id}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-white font-semibold">{produto.nome}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-300 max-w-xs truncate">
                                  {produto.especificacao_tecnica || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-300">{produto.fornecedor?.nome || '-'}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={fecharModalVisualizar}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja excluir este local? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Locais



