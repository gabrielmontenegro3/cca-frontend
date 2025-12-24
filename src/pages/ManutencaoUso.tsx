import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { manutencoesPreventivasNovoService } from '../services/manutencoesPreventivasNovoService'
import { produtosNovoService } from '../services/produtosNovoService'
import { locaisService } from '../services/locaisService'
import { ManutencaoPreventiva, ProdutoNovo, Local, CriarManutencaoPreventivaDTO, AtualizarManutencaoPreventivaDTO } from '../types'
import { useToast, ToastContainer } from '../components/ToastContainer'

const ManutencaoUso = () => {
  const { hasPermission } = useAuth()
  const [manutencoes, setManutencoes] = useState<ManutencaoPreventiva[]>([])
  const [manutencoesFiltradas, setManutencoesFiltradas] = useState<ManutencaoPreventiva[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingManutencao, setEditingManutencao] = useState<ManutencaoPreventiva | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  
  // Toast
  const { showToast, removeToast, toasts } = useToast()

  // Dados para dropdowns
  const [produtos, setProdutos] = useState<ProdutoNovo[]>([])
  const [locais, setLocais] = useState<Local[]>([])

  const [formData, setFormData] = useState({
    local_id: '',
    produto_id: '',
    sistema_construtivo: '',
    arquivos: ''
  })

  useEffect(() => {
    carregarManutencoes()
  }, [])

  // Carregar dados relacionados quando o modal abrir
  useEffect(() => {
    if (showModal) {
      const carregarDados = async () => {
        try {
          const [produtosData, locaisData] = await Promise.all([
            produtosNovoService.listar(),
            locaisService.listar()
          ])
          setProdutos(produtosData)
          setLocais(locaisData)
        } catch (err) {
          console.error('Erro ao carregar dados:', err)
        }
      }
      carregarDados()
    }
  }, [showModal])

  const carregarManutencoes = async () => {
    try {
      setLoading(true)
      const dados = await manutencoesPreventivasNovoService.listar()
      setManutencoes(dados)
      setManutencoesFiltradas(dados)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar manutenções')
      console.error('Erro ao carregar manutenções:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar manutenções pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setManutencoesFiltradas(manutencoes)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = manutencoes.filter(
        (manutencao) =>
          manutencao.sistema_construtivo?.toLowerCase().includes(termoBusca) ||
          manutencao.produto?.nome?.toLowerCase().includes(termoBusca) ||
          manutencao.local?.nome?.toLowerCase().includes(termoBusca)
      )
      setManutencoesFiltradas(filtrados)
    }
  }, [busca, manutencoes])

  const abrirModalNovo = () => {
    setEditingManutencao(null)
    setFormData({
      local_id: '',
      produto_id: '',
      sistema_construtivo: '',
      arquivos: ''
    })
    setShowModal(true)
  }

  const abrirModalEditar = (manutencao: ManutencaoPreventiva) => {
    if (!manutencao.id) {
      showToast('Erro: Manutenção não possui ID válido para edição', 'error')
      return
    }
    
    setEditingManutencao(manutencao)
    setFormData({
      local_id: manutencao.local_id?.toString() || '',
      produto_id: manutencao.produto_id?.toString() || '',
      sistema_construtivo: manutencao.sistema_construtivo || '',
      arquivos: manutencao.arquivos || ''
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingManutencao(null)
    setFormData({
      local_id: '',
      produto_id: '',
      sistema_construtivo: '',
      arquivos: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (editingManutencao && editingManutencao.id) {
        // ✅ EDITAR: PUT /api/manutencoes-preventivas-novo/{id}
        const dados: AtualizarManutencaoPreventivaDTO = {
          local_id: formData.local_id ? parseInt(formData.local_id) : undefined,
          produto_id: formData.produto_id ? parseInt(formData.produto_id) : undefined,
          sistema_construtivo: formData.sistema_construtivo.trim() || undefined,
          arquivos: formData.arquivos.trim() || undefined
        }
        
        await manutencoesPreventivasNovoService.atualizar(editingManutencao.id, dados)
        showToast('Manutenção atualizada com sucesso!', 'success')
      } else {
        // ✅ CRIAR: POST /api/manutencoes-preventivas-novo
        const dados: CriarManutencaoPreventivaDTO = {
          local_id: formData.local_id ? parseInt(formData.local_id) : undefined,
          produto_id: formData.produto_id ? parseInt(formData.produto_id) : undefined,
          sistema_construtivo: formData.sistema_construtivo.trim() || undefined,
          arquivos: formData.arquivos.trim() || undefined
        }
        
        await manutencoesPreventivasNovoService.criar(dados)
        showToast('Manutenção criada com sucesso!', 'success')
      }

      await carregarManutencoes()
      fecharModal()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao salvar manutenção'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao salvar manutenção:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (!id) {
        showToast('ID da manutenção não encontrado', 'error')
        return
      }

      await manutencoesPreventivasNovoService.remover(id)
      await carregarManutencoes()
      setShowDeleteConfirm(null)
      showToast('Manutenção removida com sucesso!', 'success')
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao remover manutenção'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao remover manutenção:', err)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Manutenção e Uso</h1>
        <p className="text-gray-400 mb-6">Gerencie as manutenções preventivas do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando manutenções...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Manutenção e Uso</h1>
        <p className="text-gray-400 mb-6">Gerencie as manutenções preventivas do sistema</p>
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
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Manutenção e Uso</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie as manutenções preventivas do sistema</p>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por sistema construtivo, produto ou local..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 pl-12 rounded-xl border border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
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
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all flex items-center space-x-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 font-semibold transform hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Manutenção</span>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Local</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Sistema Construtivo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Arquivos</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {manutencoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        {busca ? 'Nenhuma manutenção encontrada' : 'Nenhuma manutenção cadastrada'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {busca ? 'Tente ajustar os termos de busca' : hasPermission('editar') ? 'Comece adicionando uma nova manutenção' : ''}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                manutencoesFiltradas.map((manutencao) => (
                  <tr 
                    key={manutencao.id} 
                    className="hover:bg-gray-700/30 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                          <span className="text-xs font-bold text-orange-400">#{manutencao.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {manutencao.local?.nome || <span className="text-gray-500 italic">Sem local</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 flex items-center gap-2">
                        {manutencao.produto ? (
                          <>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span>{manutencao.produto.nome}</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Sem produto</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {manutencao.sistema_construtivo || <span className="text-gray-500 italic">Não informado</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {manutencao.arquivos || <span className="text-gray-500 italic">Nenhum arquivo</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission('editar') ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                abrirModalEditar(manutencao)
                              }}
                              className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                              title="Editar manutenção"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(manutencao.id)
                              }}
                              className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                              title="Excluir manutenção"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">Apenas visualização</span>
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingManutencao ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`}>
                    {editingManutencao ? (
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
                      {editingManutencao ? 'Editar Manutenção' : 'Nova Manutenção'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingManutencao ? 'Atualize as informações da manutenção' : 'Preencha os dados para cadastrar uma nova manutenção'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Local (opcional)
                    </label>
                    <select
                      value={formData.local_id}
                      onChange={(e) => setFormData({ ...formData, local_id: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    >
                      <option value="">Selecione um local (opcional)</option>
                      {locais.map((local) => (
                        <option key={local.id} value={local.id}>
                          {local.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Produto (opcional)
                    </label>
                    <select
                      value={formData.produto_id}
                      onChange={(e) => setFormData({ ...formData, produto_id: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    >
                      <option value="">Selecione um produto (opcional)</option>
                      {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Sistema Construtivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.sistema_construtivo}
                    onChange={(e) => setFormData({ ...formData, sistema_construtivo: e.target.value })}
                    placeholder="Ex: Drywall, Alvenaria estrutural"
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Arquivos (opcional)
                  </label>
                  <textarea
                    value={formData.arquivos}
                    onChange={(e) => setFormData({ ...formData, arquivos: e.target.value })}
                    placeholder="URLs dos arquivos separadas por vírgula ou JSON"
                    rows={4}
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  />
                  <small className="block text-gray-400 text-xs mt-1.5">
                    Você pode inserir URLs separadas por vírgula ou um JSON com as URLs dos arquivos
                  </small>
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
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 font-semibold flex items-center gap-2"
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
                        <span>{editingManutencao ? 'Atualizar' : 'Criar Manutenção'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
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
                Tem certeza que deseja excluir esta manutenção? Todos os dados relacionados serão perdidos permanentemente.
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
                  Excluir Manutenção
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

export default ManutencaoUso



