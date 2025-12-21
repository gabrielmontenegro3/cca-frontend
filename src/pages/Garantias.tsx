import { useState, useEffect } from 'react'
import { garantiasNovoService } from '../services/garantiasNovoService'
import { produtosNovoService } from '../services/produtosNovoService'
import { locaisService } from '../services/locaisService'
import { fornecedoresNovoService } from '../services/fornecedoresNovoService'
import { GarantiaNovo, ProdutoNovo, Local, FornecedorNovo, CriarGarantiaNovoDTO, AtualizarGarantiaNovoDTO } from '../types'
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

interface GarantiasProps {
  setActivePage: (page: Page) => void
}

const Garantias = ({ setActivePage }: GarantiasProps) => {
  const [garantias, setGarantias] = useState<GarantiaNovo[]>([])
  const [garantiasFiltradas, setGarantiasFiltradas] = useState<GarantiaNovo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingGarantia, setEditingGarantia] = useState<GarantiaNovo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [busca, setBusca] = useState('')
  
  // Estados para modal de visualização
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingGarantia, setViewingGarantia] = useState<GarantiaNovo | null>(null)
  
  // Toast
  const { showToast, removeToast, toasts } = useToast()

  // Dados para dropdowns
  const [produtos, setProdutos] = useState<ProdutoNovo[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [fornecedores, setFornecedores] = useState<FornecedorNovo[]>([])

  const [formData, setFormData] = useState({
    produto_id: '',
    local_id: '',
    fornecedor_id: '',
    duracao: '',
    cobertura: '',
    documentos: '',
    descricao: '',
    perda_garantia: '',
    data_compra: '',
    data_expiracao: ''
  })

  useEffect(() => {
    carregarGarantias()
  }, [])

  // Verificar se há uma garantia para visualizar (vindo de outra página)
  useEffect(() => {
    const garantiaIdToView = localStorage.getItem('garantiaToView')
    if (garantiaIdToView && garantias.length > 0) {
      localStorage.removeItem('garantiaToView')
      const id = parseInt(garantiaIdToView)
      const garantia = garantias.find(g => g.id === id)
      if (garantia) {
        // Abrir modal diretamente sem chamar a função async
        setViewingGarantia(garantia)
        setShowViewModal(true)
        // Buscar dados completos em background
        garantiasNovoService.buscarPorId(garantia.id)
          .then(garantiaCompleta => {
            setViewingGarantia(garantiaCompleta)
          })
          .catch(err => {
            console.error('Erro ao carregar garantia completa:', err)
          })
      }
    }
  }, [garantias])

  // Carregar dados relacionados quando o modal abrir
  useEffect(() => {
    if (showModal) {
      const carregarDados = async () => {
        try {
          const [produtosData, locaisData, fornecedoresData] = await Promise.all([
            produtosNovoService.listar(),
            locaisService.listar(),
            fornecedoresNovoService.listar()
          ])
          setProdutos(produtosData)
          setLocais(locaisData)
          setFornecedores(fornecedoresData)
        } catch (err) {
          console.error('Erro ao carregar dados:', err)
        }
      }
      carregarDados()
    }
  }, [showModal])

  const carregarGarantias = async () => {
    try {
      setLoading(true)
      const dados = await garantiasNovoService.listar()
      setGarantias(dados)
      setGarantiasFiltradas(dados)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar garantias')
      console.error('Erro ao carregar garantias:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar garantias pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setGarantiasFiltradas(garantias)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = garantias.filter(
        (garantia) =>
          garantia.duracao?.toLowerCase().includes(termoBusca) ||
          garantia.cobertura?.toLowerCase().includes(termoBusca) ||
          garantia.descricao?.toLowerCase().includes(termoBusca) ||
          garantia.produto?.nome?.toLowerCase().includes(termoBusca) ||
          garantia.local?.nome?.toLowerCase().includes(termoBusca) ||
          garantia.fornecedor?.nome?.toLowerCase().includes(termoBusca)
      )
      setGarantiasFiltradas(filtrados)
    }
  }, [busca, garantias])

  const abrirModalNovo = () => {
    setEditingGarantia(null)
    setFormData({
      produto_id: '',
      local_id: '',
      fornecedor_id: '',
      duracao: '',
      cobertura: '',
      documentos: '',
      descricao: '',
      perda_garantia: '',
      data_compra: '',
      data_expiracao: ''
    })
    setShowModal(true)
  }

  const abrirModalVisualizar = async (garantia: GarantiaNovo) => {
    if (!garantia.id) {
      showToast('Erro: Garantia não possui ID válido', 'error')
      return
    }
    
    try {
      // Buscar garantia completa com relacionamentos
      const garantiaCompleta = await garantiasNovoService.buscarPorId(garantia.id)
      setViewingGarantia(garantiaCompleta)
      setShowViewModal(true)
    } catch (err) {
      console.error('Erro ao carregar garantia:', err)
      showToast('Erro ao carregar detalhes da garantia', 'error')
    }
  }

  const fecharModalVisualizar = () => {
    setShowViewModal(false)
    setViewingGarantia(null)
  }

  const abrirModalEditar = (garantia: GarantiaNovo) => {
    if (!garantia.id) {
      showToast('Erro: Garantia não possui ID válido para edição', 'error')
      return
    }
    
    setEditingGarantia(garantia)
    setFormData({
      produto_id: garantia.produto_id?.toString() || '',
      local_id: garantia.local_id?.toString() || '',
      fornecedor_id: garantia.fornecedor_id?.toString() || '',
      duracao: garantia.duracao || '',
      cobertura: garantia.cobertura || '',
      documentos: garantia.documentos || '',
      descricao: garantia.descricao || '',
      perda_garantia: garantia.perda_garantia || '',
      data_compra: garantia.data_compra || '',
      data_expiracao: garantia.data_expiracao || ''
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingGarantia(null)
    setFormData({
      produto_id: '',
      local_id: '',
      fornecedor_id: '',
      duracao: '',
      cobertura: '',
      documentos: '',
      descricao: '',
      perda_garantia: '',
      data_compra: '',
      data_expiracao: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (editingGarantia && editingGarantia.id) {
        // ✅ EDITAR: PUT /api/garantias-novo/{id}
        const dados: AtualizarGarantiaNovoDTO = {
          produto_id: formData.produto_id ? parseInt(formData.produto_id) : undefined,
          local_id: formData.local_id ? parseInt(formData.local_id) : undefined,
          fornecedor_id: formData.fornecedor_id ? parseInt(formData.fornecedor_id) : undefined,
          duracao: formData.duracao.trim() || undefined,
          cobertura: formData.cobertura.trim() || undefined,
          documentos: formData.documentos.trim() || undefined,
          descricao: formData.descricao.trim() || undefined,
          perda_garantia: formData.perda_garantia.trim() || undefined,
          data_compra: formData.data_compra || undefined,
          data_expiracao: formData.data_expiracao || undefined
        }
        
        await garantiasNovoService.atualizar(editingGarantia.id, dados)
        showToast('Garantia atualizada com sucesso!', 'success')
      } else {
        // ✅ CRIAR: POST /api/garantias-novo
        const dados: CriarGarantiaNovoDTO = {
          produto_id: formData.produto_id ? parseInt(formData.produto_id) : undefined,
          local_id: formData.local_id ? parseInt(formData.local_id) : undefined,
          fornecedor_id: formData.fornecedor_id ? parseInt(formData.fornecedor_id) : undefined,
          duracao: formData.duracao.trim() || undefined,
          cobertura: formData.cobertura.trim() || undefined,
          documentos: formData.documentos.trim() || undefined,
          descricao: formData.descricao.trim() || undefined,
          perda_garantia: formData.perda_garantia.trim() || undefined,
          data_compra: formData.data_compra || undefined,
          data_expiracao: formData.data_expiracao || undefined
        }
        
        await garantiasNovoService.criar(dados)
        showToast('Garantia criada com sucesso!', 'success')
      }

      await carregarGarantias()
      fecharModal()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao salvar garantia'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao salvar garantia:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (!id) {
        showToast('ID da garantia não encontrado', 'error')
        return
      }

      await garantiasNovoService.remover(id)
      await carregarGarantias()
      setShowDeleteConfirm(null)
      showToast('Garantia removida com sucesso!', 'success')
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao remover garantia'
      showToast(mensagemErro, 'error')
      console.error('Erro completo ao remover garantia:', err)
    }
  }

  const formatarData = (data?: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Garantias</h1>
        <p className="text-gray-400 mb-6">Gerencie as garantias do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando garantias...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Garantias</h1>
        <p className="text-gray-400 mb-6">Gerencie as garantias do sistema</p>
        <div className="bg-red-900 border border-red-700 p-6 rounded-lg shadow-lg">
          <p className="text-red-200">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Garantias</h1>
      <p className="text-gray-400 mb-6">Gerencie as garantias do sistema</p>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por produto, local, fornecedor, duração, cobertura..."
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
            <span>Nova Garantia</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duração</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Expiração</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {garantiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                    {busca ? 'Nenhuma garantia encontrada com o termo buscado.' : 'Nenhuma garantia cadastrada.'}
                  </td>
                </tr>
              ) : (
                garantiasFiltradas.map((garantia) => (
                  <tr 
                    key={garantia.id} 
                    className="hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => abrirModalVisualizar(garantia)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{garantia.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{garantia.produto?.nome || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{garantia.local?.nome || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{garantia.fornecedor?.nome || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{garantia.duracao || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatarData(garantia.data_compra)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatarData(garantia.data_expiracao)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => abrirModalEditar(garantia)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(garantia.id)}
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
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingGarantia ? 'Editar Garantia' : 'Nova Garantia'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingGarantia ? 'Atualize os dados da garantia' : 'Preencha os dados para cadastrar uma nova garantia'}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fornecedor (opcional)
                  </label>
                  <select
                    value={formData.fornecedor_id}
                    onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.duracao}
                    onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                    placeholder="Ex: 12 meses, 2 anos"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cobertura (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.cobertura}
                    onChange={(e) => setFormData({ ...formData, cobertura: e.target.value })}
                    placeholder="Ex: Defeitos de fabricação"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Compra (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.data_compra}
                    onChange={(e) => setFormData({ ...formData, data_compra: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Expiração (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.data_expiracao}
                    onChange={(e) => setFormData({ ...formData, data_expiracao: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Documentos (opcional)
                </label>
                <input
                  type="text"
                  value={formData.documentos}
                  onChange={(e) => setFormData({ ...formData, documentos: e.target.value })}
                  placeholder="URLs ou referências de documentos"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da garantia"
                  rows={3}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Perda de Garantia (opcional)
                </label>
                <textarea
                  value={formData.perda_garantia}
                  onChange={(e) => setFormData({ ...formData, perda_garantia: e.target.value })}
                  placeholder="Condições que resultam na perda da garantia"
                  rows={2}
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
                  {submitting ? 'Salvando...' : editingGarantia ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && viewingGarantia && (
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
                    Detalhes da Garantia
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Informações completas da garantia
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
              {/* Informações Básicas */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Informações Básicas
                </h4>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">ID</label>
                      <p className="text-white font-semibold">{viewingGarantia.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Duração</label>
                      <p className="text-white font-semibold">{viewingGarantia.duracao || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Cobertura</label>
                      <p className="text-white">{viewingGarantia.cobertura || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Data de Compra</label>
                      <p className="text-white">{viewingGarantia.data_compra ? formatarData(viewingGarantia.data_compra) : '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Data de Expiração</label>
                      <p className="text-white">{viewingGarantia.data_expiracao ? formatarData(viewingGarantia.data_expiracao) : '-'}</p>
                    </div>
                  </div>
                  {viewingGarantia.descricao && (
                    <div className="border-t border-gray-600 pt-3">
                      <label className="text-xs font-medium text-gray-400 uppercase">Descrição</label>
                      <p className="text-white mt-1">{viewingGarantia.descricao}</p>
                    </div>
                  )}
                  {viewingGarantia.documentos && (
                    <div className="border-t border-gray-600 pt-3">
                      <label className="text-xs font-medium text-gray-400 uppercase">Documentos</label>
                      <p className="text-white mt-1">{viewingGarantia.documentos}</p>
                    </div>
                  )}
                  {viewingGarantia.perda_garantia && (
                    <div className="border-t border-gray-600 pt-3">
                      <label className="text-xs font-medium text-gray-400 uppercase">Perda de Garantia</label>
                      <p className="text-white mt-1">{viewingGarantia.perda_garantia}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Produto */}
              {viewingGarantia.produto && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Produto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                      <button
                        onClick={() => {
                          if (viewingGarantia.produto?.id) {
                            localStorage.setItem('produtoToView', viewingGarantia.produto.id.toString())
                            setActivePage('produtos')
                          }
                        }}
                        className="text-white font-semibold hover:text-blue-400 transition-colors cursor-pointer text-left"
                      >
                        {viewingGarantia.produto.nome}
                      </button>
                    </div>
                    {viewingGarantia.produto.especificacao_tecnica && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Especificação Técnica</label>
                        <p className="text-white">{viewingGarantia.produto.especificacao_tecnica}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Local */}
              {viewingGarantia.local && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Local</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                      <p className="text-white font-semibold">{viewingGarantia.local.nome}</p>
                    </div>
                    {viewingGarantia.local.plano_preventivo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Plano Preventivo</label>
                        <p className="text-white">{viewingGarantia.local.plano_preventivo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fornecedor */}
              {viewingGarantia.fornecedor && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Fornecedor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                      <button
                        onClick={() => {
                          if (viewingGarantia.fornecedor?.id) {
                            localStorage.setItem('fornecedorToView', viewingGarantia.fornecedor.id.toString())
                            setActivePage('fornecedores')
                          }
                        }}
                        className="text-white font-semibold hover:text-blue-400 transition-colors cursor-pointer text-left"
                      >
                        {viewingGarantia.fornecedor.nome}
                      </button>
                    </div>
                    {viewingGarantia.fornecedor.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <p className="text-white">{viewingGarantia.fornecedor.email}</p>
                      </div>
                    )}
                    {viewingGarantia.fornecedor.telefone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                        <p className="text-white">{viewingGarantia.fornecedor.telefone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                Tem certeza que deseja excluir esta garantia? Esta ação não pode ser desfeita.
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

export default Garantias



