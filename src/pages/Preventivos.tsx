import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { preventivosService } from '../services/preventivosService'
import { produtosNovoService } from '../services/produtosNovoService'
import { locaisService } from '../services/locaisService'
import { Preventivo, ProdutoNovo, Local, CriarPreventivoDTO, AtualizarPreventivoDTO } from '../types'
import { useToast, ToastContainer } from '../components/ToastContainer'

const Preventivos = () => {
  const { hasPermission } = useAuth()
  const [preventivos, setPreventivos] = useState<Preventivo[]>([])
  const [preventivosFiltrados, setPreventivosFiltrados] = useState<Preventivo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingPreventivo, setEditingPreventivo] = useState<Preventivo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  
  // Toast
  const { showToast, removeToast, toasts } = useToast()

  // Dados para dropdowns
  const [produtos, setProdutos] = useState<ProdutoNovo[]>([])
  const [locais, setLocais] = useState<Local[]>([])

  const [formData, setFormData] = useState({
    produto_id: '',
    local_id: '',
    data_preventiva: '',
    periodicidade: '',
    status: '',
    empresa_responsavel: '',
    tecnico_responsavel: '',
    custo: '',
    anotacoes: '',
    exigencia: ''
  })

  useEffect(() => {
    carregarPreventivos()
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

  const carregarPreventivos = async () => {
    try {
      setLoading(true)
      const dados = await preventivosService.listar()
      setPreventivos(dados)
      setPreventivosFiltrados(dados)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar preventivos')
      console.error('Erro ao carregar preventivos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar preventivos pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setPreventivosFiltrados(preventivos)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = preventivos.filter(
        (preventivo) =>
          preventivo.status?.toLowerCase().includes(termoBusca) ||
          preventivo.periodicidade?.toLowerCase().includes(termoBusca) ||
          preventivo.empresa_responsavel?.toLowerCase().includes(termoBusca) ||
          preventivo.tecnico_responsavel?.toLowerCase().includes(termoBusca) ||
          preventivo.produto?.nome?.toLowerCase().includes(termoBusca) ||
          preventivo.local?.nome?.toLowerCase().includes(termoBusca)
      )
      setPreventivosFiltrados(filtrados)
    }
  }, [busca, preventivos])

  const abrirModalNovo = () => {
    setEditingPreventivo(null)
    setFormData({
      produto_id: '',
      local_id: '',
      data_preventiva: '',
      periodicidade: '',
      status: '',
      empresa_responsavel: '',
      tecnico_responsavel: '',
      custo: '',
      anotacoes: '',
      exigencia: ''
    })
    setShowModal(true)
  }

  const abrirModalEditar = (preventivo: Preventivo) => {
    if (!preventivo.id) {
      showToast('Erro: Preventivo não possui ID válido para edição', 'error')
      return
    }
    
    setEditingPreventivo(preventivo)
    setFormData({
      produto_id: preventivo.produto_id?.toString() || '',
      local_id: preventivo.local_id?.toString() || '',
      data_preventiva: preventivo.data_preventiva || '',
      periodicidade: preventivo.periodicidade || '',
      status: preventivo.status || '',
      empresa_responsavel: preventivo.empresa_responsavel || '',
      tecnico_responsavel: preventivo.tecnico_responsavel || '',
      custo: preventivo.custo?.toString() || '',
      anotacoes: preventivo.anotacoes || '',
      exigencia: preventivo.exigencia || ''
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingPreventivo(null)
    setFormData({
      produto_id: '',
      local_id: '',
      data_preventiva: '',
      periodicidade: '',
      status: '',
      empresa_responsavel: '',
      tecnico_responsavel: '',
      custo: '',
      anotacoes: '',
      exigencia: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (editingPreventivo && editingPreventivo.id) {
        // ✅ EDITAR: PUT /api/preventivos/{id}
        const dados: AtualizarPreventivoDTO = {
          produto_id: formData.produto_id ? parseInt(formData.produto_id) : undefined,
          local_id: formData.local_id ? parseInt(formData.local_id) : undefined,
          data_preventiva: formData.data_preventiva || undefined,
          periodicidade: formData.periodicidade.trim() || undefined,
          status: formData.status.trim() || undefined,
          empresa_responsavel: formData.empresa_responsavel.trim() || undefined,
          tecnico_responsavel: formData.tecnico_responsavel.trim() || undefined,
          custo: formData.custo ? parseFloat(formData.custo) : undefined,
          anotacoes: formData.anotacoes.trim() || undefined,
          exigencia: formData.exigencia.trim() || undefined
        }
        
        await preventivosService.atualizar(editingPreventivo.id, dados)
        showToast('Preventivo atualizado com sucesso!', 'success')
      } else {
        // ✅ CRIAR: POST /api/preventivos
        const dados: CriarPreventivoDTO = {
          produto_id: formData.produto_id ? parseInt(formData.produto_id) : undefined,
          local_id: formData.local_id ? parseInt(formData.local_id) : undefined,
          data_preventiva: formData.data_preventiva || undefined,
          periodicidade: formData.periodicidade.trim() || undefined,
          status: formData.status.trim() || undefined,
          empresa_responsavel: formData.empresa_responsavel.trim() || undefined,
          tecnico_responsavel: formData.tecnico_responsavel.trim() || undefined,
          custo: formData.custo ? parseFloat(formData.custo) : undefined,
          anotacoes: formData.anotacoes.trim() || undefined,
          exigencia: formData.exigencia.trim() || undefined
        }
        
        await preventivosService.criar(dados)
        showToast('Preventivo criado com sucesso!', 'success')
      }

      await carregarPreventivos()
      fecharModal()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao salvar preventivo'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao salvar preventivo:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (!id) {
        showToast('ID do preventivo não encontrado', 'error')
        return
      }

      await preventivosService.remover(id)
      await carregarPreventivos()
      setShowDeleteConfirm(null)
      showToast('Preventivo removido com sucesso!', 'success')
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao remover preventivo'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao remover preventivo:', err)
    }
  }

  const formatarData = (data?: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor?: number | null) => {
    if (!valor) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Preventivos</h1>
        <p className="text-gray-400 mb-6">Gerencie os preventivos do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando preventivos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Preventivos</h1>
        <p className="text-gray-400 mb-6">Gerencie os preventivos do sistema</p>
        <div className="bg-red-900 border border-red-700 p-6 rounded-lg shadow-lg">
          <p className="text-red-200">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Preventivos</h1>
      <p className="text-gray-400 mb-6">Gerencie os preventivos do sistema</p>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por produto, local, status, empresa, técnico..."
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
              <span>Novo Preventivo</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Preventiva</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Periodicidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exigência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Custo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {preventivosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-400">
                    {busca ? 'Nenhum preventivo encontrado com o termo buscado.' : 'Nenhum preventivo cadastrado.'}
                  </td>
                </tr>
              ) : (
                preventivosFiltrados.map((preventivo) => (
                  <tr key={preventivo.id} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{preventivo.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{preventivo.produto?.nome || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{preventivo.local?.nome || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatarData(preventivo.data_preventiva)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{preventivo.periodicidade || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        preventivo.status === 'concluido' ? 'bg-green-600 text-white' :
                        preventivo.status === 'pendente' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {preventivo.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{preventivo.exigencia || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatarMoeda(preventivo.custo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {hasPermission('editar') ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => abrirModalEditar(preventivo)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(preventivo.id)}
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
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingPreventivo ? 'Editar Preventivo' : 'Novo Preventivo'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingPreventivo ? 'Atualize os dados do preventivo' : 'Preencha os dados para cadastrar um novo preventivo'}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Preventiva (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.data_preventiva}
                    onChange={(e) => setFormData({ ...formData, data_preventiva: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Periodicidade (opcional)
                  </label>
                  <select
                    value={formData.periodicidade}
                    onChange={(e) => setFormData({ ...formData, periodicidade: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="mensal">Mensal</option>
                    <option value="3 meses">3 meses</option>
                    <option value="6 meses">6 meses</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exigência (opcional)
                  </label>
                  <select
                    value={formData.exigencia}
                    onChange={(e) => setFormData({ ...formData, exigencia: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="obrigatorio">Obrigatório</option>
                    <option value="recomendado">Recomendado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    placeholder="Ex: pendente, concluido"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custo (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.custo}
                    onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Empresa Responsável (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.empresa_responsavel}
                    onChange={(e) => setFormData({ ...formData, empresa_responsavel: e.target.value })}
                    placeholder="Nome da empresa"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Técnico Responsável (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.tecnico_responsavel}
                    onChange={(e) => setFormData({ ...formData, tecnico_responsavel: e.target.value })}
                    placeholder="Nome do técnico"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Anotações (opcional)
                </label>
                <textarea
                  value={formData.anotacoes}
                  onChange={(e) => setFormData({ ...formData, anotacoes: e.target.value })}
                  placeholder="Anotações sobre o preventivo"
                  rows={4}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
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
                  {submitting ? 'Salvando...' : editingPreventivo ? 'Atualizar' : 'Criar'}
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
                Tem certeza que deseja excluir este preventivo? Esta ação não pode ser desfeita.
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

export default Preventivos



