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
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Preventivos</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie os preventivos do sistema</p>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por produto, local, status, empresa, técnico..."
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
                <span>Novo Preventivo</span>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Local</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Preventiva</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Periodicidade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Exigência</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Custo</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {preventivosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        {busca ? 'Nenhum preventivo encontrado' : 'Nenhum preventivo cadastrado'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {busca ? 'Tente ajustar os termos de busca' : hasPermission('editar') ? 'Comece adicionando um novo preventivo' : ''}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                preventivosFiltrados.map((preventivo) => (
                  <tr 
                    key={preventivo.id} 
                    className="hover:bg-gray-700/30 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                          <span className="text-xs font-bold text-blue-400">#{preventivo.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {preventivo.produto?.nome || <span className="text-gray-500 italic">Sem produto</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{preventivo.local?.nome || <span className="text-gray-500 italic">Sem local</span>}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatarData(preventivo.data_preventiva)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{preventivo.periodicidade || <span className="text-gray-500 italic">Não informado</span>}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        preventivo.status === 'concluido' ? 'bg-green-600/20 text-green-400 border border-green-500/30' :
                        preventivo.status === 'pendente' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {preventivo.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{preventivo.exigencia || <span className="text-gray-500 italic">Não informado</span>}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 font-medium">{formatarMoeda(preventivo.custo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission('editar') && (
                          <>
                            <button
                              onClick={() => abrirModalEditar(preventivo)}
                              className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                              title="Editar preventivo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(preventivo.id)}
                              className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                              title="Excluir preventivo"
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
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-800/80 p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingPreventivo ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                    {editingPreventivo ? (
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
                      {editingPreventivo ? 'Editar Preventivo' : 'Novo Preventivo'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingPreventivo ? 'Atualize as informações do preventivo' : 'Preencha os dados para cadastrar um novo preventivo'}
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
                      Produto (opcional)
                    </label>
                    <select
                      value={formData.produto_id}
                      onChange={(e) => setFormData({ ...formData, produto_id: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Selecione um produto (opcional)</option>
                      {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Local (opcional)
                    </label>
                    <select
                      value={formData.local_id}
                      onChange={(e) => setFormData({ ...formData, local_id: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Selecione um local (opcional)</option>
                      {locais.map((local) => (
                        <option key={local.id} value={local.id}>
                          {local.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Data Preventiva (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.data_preventiva}
                      onChange={(e) => setFormData({ ...formData, data_preventiva: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Periodicidade (opcional)
                    </label>
                    <select
                      value={formData.periodicidade}
                      onChange={(e) => setFormData({ ...formData, periodicidade: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Selecione</option>
                      <option value="mensal">Mensal</option>
                      <option value="3 meses">3 meses</option>
                      <option value="6 meses">6 meses</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Exigência (opcional)
                    </label>
                    <select
                      value={formData.exigencia}
                      onChange={(e) => setFormData({ ...formData, exigencia: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Selecione</option>
                      <option value="obrigatorio">Obrigatório</option>
                      <option value="recomendado">Recomendado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Status (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      placeholder="Ex: pendente, concluido"
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Custo (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.custo}
                      onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Empresa Responsável (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.empresa_responsavel}
                      onChange={(e) => setFormData({ ...formData, empresa_responsavel: e.target.value })}
                      placeholder="Nome da empresa"
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Técnico Responsável (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.tecnico_responsavel}
                      onChange={(e) => setFormData({ ...formData, tecnico_responsavel: e.target.value })}
                      placeholder="Nome do técnico"
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Anotações (opcional)
                  </label>
                  <textarea
                    value={formData.anotacoes}
                    onChange={(e) => setFormData({ ...formData, anotacoes: e.target.value })}
                    placeholder="Anotações sobre o preventivo"
                    rows={4}
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
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
                        <span>{editingPreventivo ? 'Atualizar' : 'Criar Preventivo'}</span>
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
                Tem certeza que deseja excluir este preventivo? Todos os dados relacionados serão perdidos permanentemente.
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
                  Excluir Preventivo
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




