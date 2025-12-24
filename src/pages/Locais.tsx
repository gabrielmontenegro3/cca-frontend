import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { locaisService } from '../services/locaisService'
import { produtosNovoService } from '../services/produtosNovoService'
import { Local, ProdutoNovo, CriarLocalDTO, AtualizarLocalDTO } from '../types'
import { useToast, ToastContainer } from '../components/ToastContainer'

const Locais = () => {
  const { hasPermission } = useAuth()
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
          <h1 className="text-3xl font-bold text-white">Locais</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie os locais do sistema</p>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nome ou plano preventivo..."
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

            {hasPermission('editar') && (
              <button
                onClick={abrirModalNovo}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 font-semibold transform hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Local</span>
              </button>
            )}
          </div>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Plano Preventivo</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {locaisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        {busca ? 'Nenhum local encontrado' : 'Nenhum local cadastrado'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {busca ? 'Tente ajustar os termos de busca' : hasPermission('editar') ? 'Comece adicionando um novo local' : ''}
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
                      {local.plano_preventivo ? (
                        <span className="px-2.5 py-1 bg-gray-700/50 rounded-lg text-xs border border-gray-600 text-gray-300">
                          {local.plano_preventivo}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Não informado</span>
                      )}
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
                        {hasPermission('editar') && (
                          <>
                            <button
                              onClick={() => abrirModalEditar(local)}
                              className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                              title="Editar local"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(local.id)}
                              className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                              title="Excluir local"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingLocal ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                    {editingLocal ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editingLocal ? 'Editar Local' : 'Novo Local'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingLocal ? 'Atualize as informações do local' : 'Preencha os dados para cadastrar um novo local'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={fecharModal}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Nome do Local *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Apartamento 101"
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Plano Preventivo (opcional)
                  </label>
                  <select
                    value={formData.plano_preventivo}
                    onChange={(e) => setFormData({ ...formData, plano_preventivo: e.target.value })}
                    className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Selecione um plano (opcional)</option>
                    <option value="mensal">Mensal</option>
                    <option value="3 meses">3 meses</option>
                    <option value="6 meses">6 meses</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="px-6 py-3 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all font-medium border border-gray-600"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 font-semibold flex items-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.69 8 6v2H4z"></path>
                        </svg>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{editingLocal ? 'Atualizar' : 'Criar Local'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && viewingLocal && (
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
                      {viewingLocal.plano_preventivo && (
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Plano Preventivo</label>
                          <p className="text-white">{viewingLocal.plano_preventivo}</p>
                        </div>
                      )}
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
                    <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-gray-600/50">
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.69 8 6v2H4z"></path>
                        </svg>
                        <p className="text-gray-300">Carregando produtos...</p>
                      </div>
                    </div>
                  ) : produtosLocal.length === 0 ? (
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
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Especificação Técnica</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Fornecedor</th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-700/30 divide-y divide-gray-700/50">
                            {produtosLocal.map((produto) => (
                              <tr key={produto.id} className="hover:bg-gray-600/30 transition-colors">
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
            </div>
            
            {/* Footer do Modal */}
            <div className="bg-gray-800/50 border-t border-gray-700 p-6 flex justify-end space-x-3">
              {hasPermission('editar') && viewingLocal && (
                <button
                  onClick={() => {
                    fecharModalVisualizar()
                    abrirModalEditar(viewingLocal)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar Local</span>
                </button>
              )}
              <button
                onClick={fecharModalVisualizar}
                className="px-6 py-3 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all font-medium border border-gray-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 ml-16">
                Tem certeza que deseja excluir este local? Todos os dados relacionados serão perdidos permanentemente.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all font-medium border border-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 font-semibold"
                >
                  Excluir Local
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




