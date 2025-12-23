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
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Manutenção e Uso</h1>
      <p className="text-gray-400 mb-6">Gerencie as manutenções preventivas do sistema</p>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por sistema construtivo, produto ou local..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-2 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

          {hasPermission('editar') && (
            <button
              onClick={abrirModalNovo}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nova Manutenção</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sistema Construtivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Arquivos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {manutencoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    {busca ? 'Nenhuma manutenção encontrada com o termo buscado.' : 'Nenhuma manutenção cadastrada.'}
                  </td>
                </tr>
              ) : (
                manutencoesFiltradas.map((manutencao) => (
                  <tr key={manutencao.id} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{manutencao.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{manutencao.local?.nome || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{manutencao.produto?.nome || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {manutencao.sistema_construtivo || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {manutencao.arquivos || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {hasPermission('editar') ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => abrirModalEditar(manutencao)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(manutencao.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">Apenas visualização</span>
                      )}
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
                    {editingManutencao ? 'Editar Manutenção' : 'Nova Manutenção'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingManutencao ? 'Atualize os dados da manutenção' : 'Preencha os dados para cadastrar uma nova manutenção'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Local (opcional)
                  </label>
                  <select
                    value={formData.local_id}
                    onChange={(e) => setFormData({ ...formData, local_id: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione um local</option>
                    {locais.map((local) => (
                      <option key={local.id} value={local.id}>
                        {local.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Produto (opcional)
                  </label>
                  <select
                    value={formData.produto_id}
                    onChange={(e) => setFormData({ ...formData, produto_id: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sistema Construtivo (opcional)
                </label>
                <input
                  type="text"
                  value={formData.sistema_construtivo}
                  onChange={(e) => setFormData({ ...formData, sistema_construtivo: e.target.value })}
                  placeholder="Ex: Drywall, Alvenaria estrutural"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Arquivos (opcional)
                </label>
                <textarea
                  value={formData.arquivos}
                  onChange={(e) => setFormData({ ...formData, arquivos: e.target.value })}
                  placeholder="URLs dos arquivos separadas por vírgula ou JSON"
                  rows={4}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <small className="block text-gray-400 text-xs mt-1">
                  Você pode inserir URLs separadas por vírgula ou um JSON com as URLs dos arquivos
                </small>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : editingManutencao ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
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
                Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.
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

export default ManutencaoUso



