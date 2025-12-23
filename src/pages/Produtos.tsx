import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { produtosNovoService } from '../services/produtosNovoService'
import { fornecedoresNovoService } from '../services/fornecedoresNovoService'
import { locaisService } from '../services/locaisService'
import { garantiasNovoService } from '../services/garantiasNovoService'
import { ProdutoNovo, FornecedorNovo, Local, GarantiaNovo, CriarProdutoNovoDTO, AtualizarProdutoNovoDTO } from '../types'
import { useToast, ToastContainer } from '../components/ToastContainer'
import { maskTelefone, maskCEP } from '../utils/masks'

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

interface ProdutosProps {
  setActivePage: (page: Page) => void
}

const Produtos = ({ setActivePage }: ProdutosProps) => {
  const { hasPermission } = useAuth()
  const [produtos, setProdutos] = useState<ProdutoNovo[]>([])
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoNovo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingProduto, setViewingProduto] = useState<ProdutoNovo | null>(null)
  const [garantiasProduto, setGarantiasProduto] = useState<GarantiaNovo[]>([])
  const [loadingGarantias, setLoadingGarantias] = useState(false)
  
  // Toast
  const { showToast, removeToast, toasts } = useToast()
  const [editingProduto, setEditingProduto] = useState<ProdutoNovo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [busca, setBusca] = useState('')

  // Dados para dropdowns
  const [fornecedores, setFornecedores] = useState<FornecedorNovo[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [loadingFornecedores, setLoadingFornecedores] = useState(false)
  const [loadingLocais, setLoadingLocais] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    fornecedor_id: '',
    especificacao_tecnica: '',
    locais_ids: [] as number[]
  })

  useEffect(() => {
    carregarProdutos()
  }, [])

  // Verificar se há um produto para visualizar (vindo de outra página)
  useEffect(() => {
    const produtoIdToView = localStorage.getItem('produtoToView')
    if (produtoIdToView && produtos.length > 0) {
      localStorage.removeItem('produtoToView')
      const id = parseInt(produtoIdToView)
      const produto = produtos.find(p => p.id === id)
      if (produto) {
        abrirModalVisualizar(produto)
      }
    }
  }, [produtos])

  // Carregar fornecedores e locais quando o modal abrir
  useEffect(() => {
    if (showModal) {
      const carregarDados = async () => {
        try {
          setLoadingFornecedores(true)
          setLoadingLocais(true)
          const [fornecedoresData, locaisData] = await Promise.all([
            fornecedoresNovoService.listar(),
            locaisService.listar()
          ])
          setFornecedores(fornecedoresData)
          setLocais(locaisData)
        } catch (err) {
          console.error('Erro ao carregar dados:', err)
        } finally {
          setLoadingFornecedores(false)
          setLoadingLocais(false)
        }
      }
      carregarDados()
    }
  }, [showModal])

  const carregarProdutos = async () => {
    try {
      setLoading(true)
      const dados = await produtosNovoService.listar()
      setProdutos(dados)
      setProdutosFiltrados(dados)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar produtos pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setProdutosFiltrados(produtos)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = produtos.filter(
        (produto) =>
          produto.nome?.toLowerCase().includes(termoBusca) ||
          produto.especificacao_tecnica?.toLowerCase().includes(termoBusca) ||
          produto.fornecedor?.nome?.toLowerCase().includes(termoBusca)
      )
      setProdutosFiltrados(filtrados)
    }
  }, [busca, produtos])

  const abrirModalNovo = () => {
    setEditingProduto(null)
    setFormData({
      nome: '',
      fornecedor_id: '',
      especificacao_tecnica: '',
      locais_ids: []
    })
    setShowModal(true)
  }

  const abrirModalVisualizar = async (produto: ProdutoNovo) => {
    if (!produto.id) {
      showToast('Erro: Produto não possui ID válido', 'error')
      return
    }
    
    try {
      // Buscar produto completo com relacionamentos
      const produtoCompleto = await produtosNovoService.buscarPorId(produto.id)
      setViewingProduto(produtoCompleto)
      
      // Buscar garantias relacionadas ao produto
      setLoadingGarantias(true)
      try {
        const garantias = await garantiasNovoService.listar({ produto_id: produtoCompleto.id })
        setGarantiasProduto(garantias)
      } catch (err) {
        console.error('Erro ao carregar garantias do produto:', err)
        setGarantiasProduto([])
      } finally {
        setLoadingGarantias(false)
      }
      
      setShowViewModal(true)
    } catch (err) {
      console.error('Erro ao carregar produto:', err)
      showToast('Erro ao carregar detalhes do produto', 'error')
    }
  }

  const abrirModalEditar = (produto: ProdutoNovo) => {
    if (!produto.id) {
      showToast('Erro: Produto não possui ID válido para edição', 'error')
      return
    }
    
    setEditingProduto(produto)
    setFormData({
      nome: produto.nome || '',
      fornecedor_id: produto.fornecedor_id?.toString() || '',
      especificacao_tecnica: produto.especificacao_tecnica || '',
      locais_ids: produto.locais?.map(l => l.id) || []
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingProduto(null)
    setFormData({
      nome: '',
      fornecedor_id: '',
      especificacao_tecnica: '',
      locais_ids: []
    })
  }

  const handleLocaisChange = (localId: number) => {
    setFormData(prev => {
      const locaisIds = prev.locais_ids.includes(localId)
        ? prev.locais_ids.filter(id => id !== localId)
        : [...prev.locais_ids, localId]
      return { ...prev, locais_ids: locaisIds }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (editingProduto && editingProduto.id) {
        // ✅ EDITAR: PUT /api/produtos-novo/{id}
        const dados: AtualizarProdutoNovoDTO = {
          nome: formData.nome.trim() || undefined,
          fornecedor_id: formData.fornecedor_id ? parseInt(formData.fornecedor_id) : undefined,
          especificacao_tecnica: formData.especificacao_tecnica.trim() || undefined,
          locais_ids: formData.locais_ids.length > 0 ? formData.locais_ids : undefined
        }
        
        await produtosNovoService.atualizar(editingProduto.id, dados)
        showToast('Produto atualizado com sucesso!', 'success')
      } else {
        // ✅ CRIAR: POST /api/produtos-novo
        if (!formData.nome.trim()) {
          throw new Error('Nome é obrigatório')
        }
        
        const dados: CriarProdutoNovoDTO = {
          nome: formData.nome.trim(),
          fornecedor_id: formData.fornecedor_id ? parseInt(formData.fornecedor_id) : undefined,
          especificacao_tecnica: formData.especificacao_tecnica.trim() || undefined,
          locais_ids: formData.locais_ids.length > 0 ? formData.locais_ids : undefined
        }
        
        await produtosNovoService.criar(dados)
        showToast('Produto criado com sucesso!', 'success')
      }

      await carregarProdutos()
      fecharModal()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao salvar produto'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao salvar produto:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (!id) {
        showToast('ID do produto não encontrado', 'error')
        return
      }

      await produtosNovoService.remover(id)
      await carregarProdutos()
      setShowDeleteConfirm(null)
      showToast('Produto removido com sucesso!', 'success')
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao remover produto'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao remover produto:', err)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Produtos</h1>
        <p className="text-gray-400 mb-6">Gerencie o catálogo de produtos do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Produtos</h1>
        <p className="text-gray-400 mb-6">Gerencie o catálogo de produtos do sistema</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Produtos</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie o catálogo de produtos do sistema</p>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nome, especificação técnica ou fornecedor..."
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
                <span>Novo Produto</span>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Especificação Técnica</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Locais</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {busca ? 'Tente ajustar os termos de busca' : hasPermission('editar') ? 'Comece adicionando um novo produto' : ''}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr 
                    key={produto.id} 
                    className="hover:bg-gray-700/30 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                          <span className="text-xs font-bold text-purple-400">#{produto.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {produto.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {produto.fornecedor ? (
                        <div className="text-sm text-gray-300 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{produto.fornecedor.nome}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Sem fornecedor</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {produto.especificacao_tecnica || <span className="text-gray-500 italic">Não informado</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {produto.locais && produto.locais.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {produto.locais.map((local) => (
                              <span key={local.id} className="px-2.5 py-1 bg-gray-700/50 rounded-lg text-xs border border-gray-600">
                                {local.nome}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Nenhum local</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModalVisualizar(produto)}
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
                              onClick={() => abrirModalEditar(produto)}
                              className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                              title="Editar produto"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(produto.id)}
                              className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                              title="Excluir produto"
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingProduto ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                    {editingProduto ? (
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
                      {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingProduto ? 'Atualize as informações do produto' : 'Preencha os dados para cadastrar um novo produto'}
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
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Ar Condicionado Split"
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Fornecedor (opcional)
                  </label>
                  <select
                    value={formData.fornecedor_id}
                    onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                    disabled={loadingFornecedores}
                    className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione um fornecedor (opcional)</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </option>
                    ))}
                  </select>
                  {loadingFornecedores && (
                    <small className="block text-gray-400 text-xs mt-1.5">Carregando fornecedores...</small>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Especificação Técnica (opcional)
                  </label>
                  <textarea
                    value={formData.especificacao_tecnica}
                    onChange={(e) => setFormData({ ...formData, especificacao_tecnica: e.target.value })}
                    placeholder="Ex: 12.000 BTUs, Inverter"
                    rows={4}
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Locais (Selecione múltiplos) (opcional)
                  </label>
                  <div className="bg-gray-700/50 rounded-xl p-4 max-h-48 overflow-y-auto border border-gray-600">
                    {loadingLocais ? (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.69 8 6v2H4z"></path>
                        </svg>
                        <span>Carregando locais...</span>
                      </div>
                    ) : locais.length === 0 ? (
                      <p className="text-gray-400 text-sm">Nenhum local cadastrado</p>
                    ) : (
                      <div className="space-y-2">
                        {locais.map((local) => (
                          <label key={local.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-600/50 p-2.5 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.locais_ids.includes(local.id)}
                              onChange={() => handleLocaisChange(local.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-white">{local.nome}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.locais_ids.length > 0 && (
                    <small className="block text-gray-400 text-xs mt-1.5">
                      {formData.locais_ids.length} local(is) selecionado(s)
                    </small>
                  )}
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
                        <span>{editingProduto ? 'Atualizar' : 'Criar Produto'}</span>
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
      {showViewModal && viewingProduto && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowViewModal(false)
            setViewingProduto(null)
            setGarantiasProduto([])
          }}
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
                      Detalhes do Produto
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Informações completas do produto
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setViewingProduto(null)
                    setGarantiasProduto([])
                  }}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Informações Básicas
                  </h4>
                  <div className="bg-gray-700/50 rounded-xl p-5 space-y-4 border border-gray-600/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</label>
                        <p className="text-white font-bold text-lg">{viewingProduto.id}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                        <p className="text-white font-semibold text-lg">{viewingProduto.nome}</p>
                      </div>
                      {viewingProduto.especificacao_tecnica && (
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Especificação Técnica</label>
                          <p className="text-white">{viewingProduto.especificacao_tecnica}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fornecedor */}
                {viewingProduto.fornecedor && (
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
                          <p className="text-white font-semibold">{viewingProduto.fornecedor.nome}</p>
                        </div>
                        {viewingProduto.fornecedor.email && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </label>
                            <p className="text-white">{viewingProduto.fornecedor.email}</p>
                          </div>
                        )}
                        {viewingProduto.fornecedor.telefone && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Telefone
                            </label>
                            <p className="text-white">{maskTelefone(viewingProduto.fornecedor.telefone)}</p>
                          </div>
                        )}
                        {viewingProduto.fornecedor.endereco && (
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Endereço
                            </label>
                            <p className="text-white">
                              {viewingProduto.fornecedor.endereco}
                              {viewingProduto.fornecedor.complemento && `, ${viewingProduto.fornecedor.complemento}`}
                            </p>
                            {(viewingProduto.fornecedor.cidade || viewingProduto.fornecedor.estado) && (
                              <p className="text-gray-300 text-sm mt-1">
                                {viewingProduto.fornecedor.cidade || ''}
                                {viewingProduto.fornecedor.cidade && viewingProduto.fornecedor.estado && ' / '}
                                {viewingProduto.fornecedor.estado || ''}
                                {viewingProduto.fornecedor.cep && ` • CEP: ${maskCEP(viewingProduto.fornecedor.cep)}`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Locais Associados */}
                {viewingProduto.locais && viewingProduto.locais.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Locais Associados ({viewingProduto.locais.length})
                    </h4>
                    <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50">
                      <div className="flex flex-wrap gap-2">
                        {viewingProduto.locais.map((local) => (
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

                {/* Garantias */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Garantias ({garantiasProduto.length})
                  </h4>
                  {loadingGarantias ? (
                    <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-gray-600/50">
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 8 2.69 8 6v2H4z"></path>
                        </svg>
                        <p className="text-gray-300">Carregando garantias...</p>
                      </div>
                    </div>
                  ) : garantiasProduto.length > 0 ? (
                    <div className="bg-gray-700/50 rounded-xl overflow-hidden border border-gray-600/50">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800/80">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Duração</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Cobertura</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Local</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Compra</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Expiração</th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-700/30 divide-y divide-gray-700/50">
                            {garantiasProduto.map((garantia) => (
                              <tr key={garantia.id} className="hover:bg-gray-600/30 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-white">{garantia.id}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm text-white">{garantia.duracao || '-'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-300 max-w-xs truncate">
                                    {garantia.cobertura || '-'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm text-gray-300">{garantia.local?.nome || '-'}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm text-gray-300">
                                    {garantia.data_compra ? new Date(garantia.data_compra).toLocaleDateString('pt-BR') : '-'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm text-gray-300">
                                    {garantia.data_expiracao ? new Date(garantia.data_expiracao).toLocaleDateString('pt-BR') : '-'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-gray-600/50">
                      <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p className="text-gray-400 font-medium">Nenhuma garantia cadastrada para este produto.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer do Modal */}
            <div className="bg-gray-800/50 border-t border-gray-700 p-6 flex justify-end space-x-3">
              {hasPermission('editar') && viewingProduto && (
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    abrirModalEditar(viewingProduto)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar Produto</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setViewingProduto(null)
                  setGarantiasProduto([])
                }}
                className="px-6 py-3 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all font-medium border border-gray-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

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
                Tem certeza que deseja excluir este produto? Todos os dados relacionados serão perdidos permanentemente.
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
                  Excluir Produto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Produtos



