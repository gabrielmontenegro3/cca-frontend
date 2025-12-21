import { useState, useEffect } from 'react'
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
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Produtos</h1>
      <p className="text-gray-400 mb-6">Gerencie o catálogo de produtos do sistema</p>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nome, especificação técnica ou fornecedor..."
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

          <button
            onClick={abrirModalNovo}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Produto</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Especificação Técnica</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Locais</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    {busca ? 'Nenhum produto encontrado com o termo buscado.' : 'Nenhum produto cadastrado.'}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr 
                    key={produto.id} 
                    className="hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => abrirModalVisualizar(produto)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{produto.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-semibold">{produto.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {produto.fornecedor ? (
                        <div className="text-sm text-white">{produto.fornecedor.nome}</div>
                      ) : (
                        <span className="text-sm text-gray-500">Sem fornecedor</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {produto.especificacao_tecnica || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {produto.locais && produto.locais.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {produto.locais.map((local) => (
                              <span key={local.id} className="px-2 py-1 bg-gray-600 rounded text-xs">
                                {local.nome}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">Nenhum local</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => abrirModalVisualizar(produto)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Visualizar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => abrirModalEditar(produto)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(produto.id)}
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
                    {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingProduto ? 'Atualize as informações do produto' : 'Preencha os dados para cadastrar um novo produto'}
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
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Ar Condicionado Split"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fornecedor (opcional)
                </label>
                <select
                  value={formData.fornecedor_id}
                  onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                  disabled={loadingFornecedores}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione um fornecedor (opcional)</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
                {loadingFornecedores && (
                  <small className="block text-gray-400 text-xs mt-1">Carregando fornecedores...</small>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Especificação Técnica (opcional)
                </label>
                <textarea
                  value={formData.especificacao_tecnica}
                  onChange={(e) => setFormData({ ...formData, especificacao_tecnica: e.target.value })}
                  placeholder="Ex: 12.000 BTUs, Inverter"
                  rows={4}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Locais (Selecione múltiplos) (opcional)
                </label>
                <div className="bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-600">
                  {loadingLocais ? (
                    <p className="text-gray-400 text-sm">Carregando locais...</p>
                  ) : locais.length === 0 ? (
                    <p className="text-gray-400 text-sm">Nenhum local cadastrado</p>
                  ) : (
                    <div className="space-y-2">
                      {locais.map((local) => (
                        <label key={local.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-600 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.locais_ids.includes(local.id)}
                            onChange={() => handleLocaisChange(local.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-white">{local.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.locais_ids.length > 0 && (
                  <small className="block text-gray-400 text-xs mt-1">
                    {formData.locais_ids.length} local(is) selecionado(s)
                  </small>
                )}
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
                  {submitting ? 'Salvando...' : editingProduto ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && viewingProduto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => {
            setShowViewModal(false)
            setViewingProduto(null)
            setGarantiasProduto([])
          }}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Detalhes do Produto
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Informações completas do produto
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setViewingProduto(null)
                    setGarantiasProduto([])
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">ID</label>
                    <p className="text-white">{viewingProduto.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                    <p className="text-white font-semibold">{viewingProduto.nome}</p>
                  </div>
                  {viewingProduto.especificacao_tecnica && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Especificação Técnica</label>
                      <p className="text-white">{viewingProduto.especificacao_tecnica}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fornecedor */}
              {viewingProduto.fornecedor && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Fornecedor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                      <p className="text-white font-semibold">{viewingProduto.fornecedor.nome}</p>
                    </div>
                    {viewingProduto.fornecedor.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <p className="text-white">{viewingProduto.fornecedor.email}</p>
                      </div>
                    )}
                    {viewingProduto.fornecedor.telefone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                        <p className="text-white">{maskTelefone(viewingProduto.fornecedor.telefone)}</p>
                      </div>
                    )}
                    {viewingProduto.fornecedor.endereco && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Endereço</label>
                        <p className="text-white">
                          {viewingProduto.fornecedor.endereco}
                          {viewingProduto.fornecedor.complemento && `, ${viewingProduto.fornecedor.complemento}`}
                        </p>
                      </div>
                    )}
                    {(viewingProduto.fornecedor.cidade || viewingProduto.fornecedor.estado) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Cidade/Estado</label>
                        <p className="text-white">
                          {viewingProduto.fornecedor.cidade || ''}
                          {viewingProduto.fornecedor.cidade && viewingProduto.fornecedor.estado && ' / '}
                          {viewingProduto.fornecedor.estado || ''}
                          {viewingProduto.fornecedor.cep && ` - CEP: ${maskCEP(viewingProduto.fornecedor.cep)}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Locais Associados */}
              {viewingProduto.locais && viewingProduto.locais.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Locais Associados</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduto.locais.map((local) => (
                      <button
                        key={local.id}
                        onClick={() => {
                          localStorage.setItem('localToView', local.id.toString())
                          setActivePage('locais')
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm hover:bg-gray-500 transition-colors cursor-pointer"
                      >
                        {local.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Garantias */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Garantias ({garantiasProduto.length})
                  {loadingGarantias && <span className="text-sm text-gray-400 ml-2">(Carregando...)</span>}
                </h4>
                {loadingGarantias ? (
                  <p className="text-gray-400">Carregando garantias...</p>
                ) : garantiasProduto.length > 0 ? (
                  <div className="bg-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duração</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cobertura</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Local</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Compra</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Expiração</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-700 divide-y divide-gray-600">
                          {garantiasProduto.map((garantia) => (
                            <tr key={garantia.id} className="hover:bg-gray-600 transition-colors">
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
                  <p className="text-gray-400">Nenhuma garantia cadastrada para este produto.</p>
                )}
              </div>

              {/* Botão de Fechar */}
              <div className="flex justify-end pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setViewingProduto(null)
                    setGarantiasProduto([])
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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
    </div>
  )
}

export default Produtos



