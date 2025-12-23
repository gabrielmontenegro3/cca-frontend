import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fornecedoresNovoService } from '../services/fornecedoresNovoService'
import { produtosNovoService } from '../services/produtosNovoService'
import { garantiasNovoService } from '../services/garantiasNovoService'
import { FornecedorNovo, ProdutoNovo, GarantiaNovo, CriarFornecedorNovoDTO, AtualizarFornecedorNovoDTO } from '../types'
import { estadosBrasil, getCidadesByEstado } from '../utils/estadosCidades'
import { maskTelefone, maskCEP, unmask } from '../utils/masks'
import { useToast, ToastContainer } from '../components/ToastContainer'

type Page = 
  | 'visao-geral'
  | 'empreendimento'
  | 'meu-imovel'
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

interface FornecedoresProps {
  setActivePage: (page: Page) => void
}

const Fornecedores = ({ setActivePage }: FornecedoresProps) => {
  const { hasPermission } = useAuth()
  const [fornecedores, setFornecedores] = useState<FornecedorNovo[]>([])
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState<FornecedorNovo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<FornecedorNovo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  
  // Estados para modal de visualização
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingFornecedor, setViewingFornecedor] = useState<FornecedorNovo | null>(null)
  const [produtosFornecedor, setProdutosFornecedor] = useState<ProdutoNovo[]>([])
  const [garantiasFornecedor, setGarantiasFornecedor] = useState<GarantiaNovo[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [loadingGarantias, setLoadingGarantias] = useState(false)
  
  // Toast
  const { showToast, removeToast, toasts } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    complemento: '',
    ponto_referencia: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  useEffect(() => {
    carregarFornecedores()
  }, [])

  // Verificar se há um fornecedor para visualizar (vindo de outra página)
  useEffect(() => {
    const fornecedorIdToView = localStorage.getItem('fornecedorToView')
    if (fornecedorIdToView && fornecedores.length > 0) {
      localStorage.removeItem('fornecedorToView')
      const id = parseInt(fornecedorIdToView)
      const fornecedor = fornecedores.find(f => f.id === id)
      if (fornecedor) {
        abrirModalVisualizar(fornecedor)
      }
    }
  }, [fornecedores])

  const carregarFornecedores = async () => {
    try {
      setLoading(true)
      const dados = await fornecedoresNovoService.listar()
      setFornecedores(dados)
      setFornecedoresFiltrados(dados)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fornecedores')
      console.error('Erro ao carregar fornecedores:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar fornecedores pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setFornecedoresFiltrados(fornecedores)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = fornecedores.filter(
        (fornecedor) =>
          fornecedor.nome?.toLowerCase().includes(termoBusca) ||
          fornecedor.email?.toLowerCase().includes(termoBusca) ||
          fornecedor.telefone?.toLowerCase().includes(termoBusca) ||
          fornecedor.endereco?.toLowerCase().includes(termoBusca) ||
          fornecedor.cidade?.toLowerCase().includes(termoBusca) ||
          fornecedor.estado?.toLowerCase().includes(termoBusca) ||
          fornecedor.cep?.toLowerCase().includes(termoBusca)
      )
      setFornecedoresFiltrados(filtrados)
    }
  }, [busca, fornecedores])

  const abrirModalNovo = () => {
    setEditingFornecedor(null)
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      complemento: '',
      ponto_referencia: '',
      cidade: '',
      estado: '',
      cep: ''
    })
    setShowModal(true)
  }

  const abrirModalEditar = (fornecedor: FornecedorNovo) => {
    if (!fornecedor.id) {
      showToast('Erro: Fornecedor não possui ID válido para edição', 'error')
      return
    }
    
    setEditingFornecedor(fornecedor)
    setFormData({
      nome: fornecedor.nome || '',
      email: fornecedor.email || '',
      telefone: fornecedor.telefone || '',
      endereco: fornecedor.endereco || '',
      complemento: fornecedor.complemento || '',
      ponto_referencia: fornecedor.ponto_referencia || '',
      cidade: fornecedor.cidade || '',
      estado: fornecedor.estado || '',
      cep: fornecedor.cep || ''
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingFornecedor(null)
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      complemento: '',
      ponto_referencia: '',
      cidade: '',
      estado: '',
      cep: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (editingFornecedor && editingFornecedor.id) {
        // ✅ EDITAR: PUT /api/fornecedores-novo/{id}
        const dados: AtualizarFornecedorNovoDTO = {
          nome: formData.nome.trim() || undefined,
          email: formData.email.trim() || undefined,
          telefone: unmask(formData.telefone) || undefined,
          endereco: formData.endereco.trim() || undefined,
          complemento: formData.complemento.trim() || undefined,
          ponto_referencia: formData.ponto_referencia.trim() || undefined,
          cidade: formData.cidade.trim() || undefined,
          estado: formData.estado.trim() || undefined,
          cep: unmask(formData.cep) || undefined
        }
        
        await fornecedoresNovoService.atualizar(editingFornecedor.id, dados)
        showToast('Fornecedor atualizado com sucesso!', 'success')
      } else {
        // ✅ CRIAR: POST /api/fornecedores-novo
        if (!formData.nome.trim()) {
          throw new Error('Nome é obrigatório')
        }
        
        const dados: CriarFornecedorNovoDTO = {
          nome: formData.nome.trim(),
          email: formData.email.trim() || undefined,
          telefone: unmask(formData.telefone) || undefined,
          endereco: formData.endereco.trim() || undefined,
          complemento: formData.complemento.trim() || undefined,
          ponto_referencia: formData.ponto_referencia.trim() || undefined,
          cidade: formData.cidade.trim() || undefined,
          estado: formData.estado.trim() || undefined,
          cep: unmask(formData.cep) || undefined
        }
        
        await fornecedoresNovoService.criar(dados)
        showToast('Fornecedor criado com sucesso!', 'success')
      }

      await carregarFornecedores()
      fecharModal()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao salvar fornecedor'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao salvar fornecedor:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (!id) {
        showToast('ID do fornecedor não encontrado', 'error')
        return
      }

      await fornecedoresNovoService.remover(id)
      await carregarFornecedores()
      setShowDeleteConfirm(null)
      showToast('Fornecedor removido com sucesso!', 'success')
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao remover fornecedor'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao remover fornecedor:', err)
    }
  }

  const abrirModalVisualizar = async (fornecedor: FornecedorNovo) => {
    if (!fornecedor.id) {
      showToast('Erro: Fornecedor não possui ID válido', 'error')
      return
    }
    
    setViewingFornecedor(fornecedor)
    setShowViewModal(true)
    setLoadingProdutos(true)
    setLoadingGarantias(true)
    
    try {
      // Buscar produtos e garantias relacionados ao fornecedor
      const [produtos, garantias] = await Promise.all([
        produtosNovoService.listar({ fornecedor_id: fornecedor.id }),
        garantiasNovoService.listar({ fornecedor_id: fornecedor.id })
      ])
      setProdutosFornecedor(produtos)
      setGarantiasFornecedor(garantias)
    } catch (err) {
      console.error('Erro ao carregar dados do fornecedor:', err)
      setProdutosFornecedor([])
      setGarantiasFornecedor([])
    } finally {
      setLoadingProdutos(false)
      setLoadingGarantias(false)
    }
  }

  const fecharModalVisualizar = () => {
    setShowViewModal(false)
    setViewingFornecedor(null)
    setProdutosFornecedor([])
    setGarantiasFornecedor([])
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Fornecedores</h1>
        <p className="text-gray-400 mb-6">Gerencie sua base de fornecedores</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando fornecedores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Fornecedores</h1>
        <p className="text-gray-400 mb-6">Gerencie sua base de fornecedores</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Fornecedores</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie sua base de fornecedores e parceiros</p>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone, endereço, cidade..."
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
                <span>Novo Fornecedor</span>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>ID</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Localização</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {fornecedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        {busca ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {busca ? 'Tente ajustar os termos de busca' : hasPermission('editar') ? 'Comece adicionando um novo fornecedor' : ''}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                fornecedoresFiltrados.map((fornecedor) => (
                  <tr 
                    key={fornecedor.id} 
                    className="hover:bg-gray-700/30 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                          <span className="text-xs font-bold text-blue-400">#{fornecedor.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {fornecedor.nome}
                        </div>
                        {fornecedor.email && (
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {fornecedor.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {fornecedor.telefone && (
                          <div className="text-sm text-gray-300 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{fornecedor.telefone}</span>
                          </div>
                        )}
                        {!fornecedor.telefone && (
                          <span className="text-xs text-gray-500 italic">Sem telefone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {fornecedor.endereco ? (
                          <>
                            <div className="text-sm text-gray-300 flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <div>{fornecedor.endereco}</div>
                                {fornecedor.complemento && (
                                  <div className="text-xs text-gray-400">{fornecedor.complemento}</div>
                                )}
                              </div>
                            </div>
                            {(fornecedor.cidade || fornecedor.estado) && (
                              <div className="text-xs text-gray-400 ml-6">
                                {fornecedor.cidade || ''}
                                {fornecedor.cidade && fornecedor.estado && ' - '}
                                {fornecedor.estado || ''}
                                {fornecedor.cep && ` • CEP: ${fornecedor.cep}`}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Sem endereço</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalVisualizar(fornecedor)}
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
                              onClick={() => abrirModalEditar(fornecedor)}
                              className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                              title="Editar fornecedor"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(fornecedor.id)}
                              className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                              title="Excluir fornecedor"
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingFornecedor ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                    {editingFornecedor ? (
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
                      {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingFornecedor ? 'Atualize as informações do fornecedor' : 'Preencha os dados para cadastrar um novo fornecedor'}
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
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Fornecedor XYZ"
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@xyz.com"
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Telefone (opcional)
                  </label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => {
                        const masked = maskTelefone(e.target.value)
                        setFormData({ ...formData, telefone: masked })
                      }}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                  Endereço (opcional)
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua Exemplo, 123"
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                  Complemento (opcional)
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  placeholder="Apto 101, Bloco A"
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                  Ponto de Referência (opcional)
                </label>
                <input
                  type="text"
                  value={formData.ponto_referencia}
                  onChange={(e) => setFormData({ ...formData, ponto_referencia: e.target.value })}
                  placeholder="Próximo ao shopping"
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Estado (opcional)
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        estado: e.target.value,
                        cidade: '' // Limpar cidade quando mudar estado
                      })
                    }}
                    className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Selecione um estado</option>
                    {estadosBrasil.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.sigla} - {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Cidade (opcional)
                  </label>
                  <select
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    disabled={!formData.estado}
                    className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.estado ? 'Selecione uma cidade' : 'Selecione um estado primeiro'}
                    </option>
                    {formData.estado && getCidadesByEstado(formData.estado).map((cidade) => (
                      <option key={cidade} value={cidade}>
                        {cidade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    CEP (opcional)
                  </label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => {
                        const masked = maskCEP(e.target.value)
                        setFormData({ ...formData, cep: masked })
                      }}
                      placeholder="01234-567"
                      maxLength={9}
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
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
                      <span>{editingFornecedor ? 'Atualizar' : 'Criar Fornecedor'}</span>
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
      {showViewModal && viewingFornecedor && (
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
                      Detalhes do Fornecedor
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Informações completas e produtos relacionados
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
                {/* Informações do Fornecedor */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Informações do Fornecedor
                </h4>
                <div className="bg-gray-700/50 rounded-xl p-5 space-y-4 border border-gray-600/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</label>
                      <p className="text-white font-bold text-lg">{viewingFornecedor.id}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                      <p className="text-white font-semibold text-lg">{viewingFornecedor.nome}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </label>
                      <p className="text-white">{viewingFornecedor.email || <span className="text-gray-500 italic">Não informado</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Telefone
                      </label>
                      <p className="text-white">{viewingFornecedor.telefone ? maskTelefone(viewingFornecedor.telefone) : <span className="text-gray-500 italic">Não informado</span>}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-600/50 pt-4 mt-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Endereço Completo
                    </label>
                    <div className="text-white space-y-2">
                      {viewingFornecedor.endereco ? (
                        <>
                          <p className="font-medium">{viewingFornecedor.endereco}</p>
                          {viewingFornecedor.complemento && (
                            <p className="text-gray-300 text-sm">{viewingFornecedor.complemento}</p>
                          )}
                          {viewingFornecedor.ponto_referencia && (
                            <p className="text-gray-400 text-sm">📍 {viewingFornecedor.ponto_referencia}</p>
                          )}
                          <p className="text-gray-300">
                            {viewingFornecedor.cidade || ''}
                            {viewingFornecedor.cidade && viewingFornecedor.estado && ' - '}
                            {viewingFornecedor.estado || ''}
                            {viewingFornecedor.cep && ` • CEP: ${maskCEP(viewingFornecedor.cep)}`}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500 italic">Endereço não informado</p>
                      )}
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
                  Produtos Relacionados ({produtosFornecedor.length})
                </h4>
                
                {(loadingProdutos || loadingGarantias) ? (
                  <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-gray-600/50">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.69 8 6v2H4z"></path>
                      </svg>
                      <p className="text-gray-300">Carregando dados...</p>
                    </div>
                  </div>
                ) : produtosFornecedor.length === 0 ? (
                  <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-gray-600/50">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-400 font-medium">Nenhum produto relacionado a este fornecedor.</p>
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
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Garantia</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-700/30 divide-y divide-gray-700/50">
                          {produtosFornecedor.map((produto) => {
                            // Buscar garantias deste produto
                            const garantiasProduto = garantiasFornecedor.filter(g => g.produto_id === produto.id)
                            return (
                              <tr key={produto.id} className="hover:bg-gray-600/30 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-white">{produto.id}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (produto.id) {
                                        localStorage.setItem('produtoToView', produto.id.toString())
                                        setActivePage('produtos')
                                      }
                                    }}
                                    className="text-sm text-white font-semibold hover:text-blue-400 transition-colors cursor-pointer text-left"
                                  >
                                    {produto.nome}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-300 max-w-xs truncate">
                                    {produto.especificacao_tecnica || '-'}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-300">
                                    {garantiasProduto.length > 0 ? (
                                      <div className="space-y-1">
                                        {garantiasProduto.map((garantia) => (
                                          <div key={garantia.id} className="text-xs">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                if (garantia.id) {
                                                  localStorage.setItem('garantiaToView', garantia.id.toString())
                                                  setActivePage('garantias')
                                                }
                                              }}
                                              className="font-semibold hover:text-blue-400 transition-colors cursor-pointer text-left"
                                            >
                                              {garantia.duracao || 'Sem duração'}
                                            </button>
                                            {garantia.data_expiracao && (
                                              <span className="text-gray-400 ml-2">
                                                (Exp: {new Date(garantia.data_expiracao).toLocaleDateString('pt-BR')})
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">Sem garantia</span>
                                    )}
                                  </div>
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
              {hasPermission('editar') && viewingFornecedor && (
                <button
                  onClick={() => {
                    fecharModalVisualizar()
                    abrirModalEditar(viewingFornecedor)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar Fornecedor</span>
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
                Tem certeza que deseja excluir este fornecedor? Todos os dados relacionados serão perdidos permanentemente.
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
                  Excluir Fornecedor
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

export default Fornecedores





