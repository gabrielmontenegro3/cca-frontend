import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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
  const { hasPermission } = useAuth()
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
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Garantias</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie as garantias do sistema</p>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por produto, local, fornecedor, duração, cobertura..."
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
                <span>Nova Garantia</span>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Duração</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Compra</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Expiração</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {garantiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium mb-1">
                        {busca ? 'Nenhuma garantia encontrada' : 'Nenhuma garantia cadastrada'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {busca ? 'Tente ajustar os termos de busca' : hasPermission('editar') ? 'Comece adicionando uma nova garantia' : ''}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                garantiasFiltradas.map((garantia) => (
                  <tr 
                    key={garantia.id} 
                    onClick={() => abrirModalVisualizar(garantia)}
                    className="hover:bg-gray-700/30 transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
                          <span className="text-xs font-bold text-green-400">#{garantia.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors">
                        {garantia.produto?.nome || <span className="text-gray-500 italic">Sem produto</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {garantia.local ? (
                        <div className="text-sm text-gray-300 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{garantia.local.nome}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Sem local</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {garantia.fornecedor ? (
                        <div className="text-sm text-gray-300 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{garantia.fornecedor.nome}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Sem fornecedor</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {garantia.duracao || <span className="text-gray-500 italic">Não informado</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatarData(garantia.data_compra)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatarData(garantia.data_expiracao)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirModalVisualizar(garantia)
                          }}
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
                              onClick={(e) => {
                                e.stopPropagation()
                                abrirModalEditar(garantia)
                              }}
                              className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                              title="Editar garantia"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(garantia.id)
                              }}
                              className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                              title="Excluir garantia"
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingGarantia ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                    {editingGarantia ? (
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
                      {editingGarantia ? 'Editar Garantia' : 'Nova Garantia'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingGarantia ? 'Atualize as informações da garantia' : 'Preencha os dados para cadastrar uma nova garantia'}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Fornecedor (opcional)
                    </label>
                    <select
                      value={formData.fornecedor_id}
                      onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Selecione um fornecedor (opcional)</option>
                      {fornecedores.map((fornecedor) => (
                        <option key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Duração (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.duracao}
                      onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                      placeholder="Ex: 12 meses, 2 anos"
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Cobertura (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.cobertura}
                      onChange={(e) => setFormData({ ...formData, cobertura: e.target.value })}
                      placeholder="Ex: Defeitos de fabricação"
                      className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Data de Compra (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.data_compra}
                      onChange={(e) => setFormData({ ...formData, data_compra: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                      Data de Expiração (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.data_expiracao}
                      onChange={(e) => setFormData({ ...formData, data_expiracao: e.target.value })}
                      className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Documentos (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.documentos}
                    onChange={(e) => setFormData({ ...formData, documentos: e.target.value })}
                    placeholder="URLs ou referências de documentos"
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição da garantia"
                    rows={4}
                    className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                    Perda de Garantia (opcional)
                  </label>
                  <textarea
                    value={formData.perda_garantia}
                    onChange={(e) => setFormData({ ...formData, perda_garantia: e.target.value })}
                    placeholder="Condições que resultam na perda da garantia"
                    rows={3}
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
                        <span>{editingGarantia ? 'Atualizar' : 'Criar Garantia'}</span>
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
      {showViewModal && viewingGarantia && (
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
                      Detalhes da Garantia
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Informações completas da garantia
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Informações Básicas
                  </h4>
                  <div className="bg-gray-700/50 rounded-xl p-5 space-y-4 border border-gray-600/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</label>
                        <p className="text-white font-bold text-lg">{viewingGarantia.id}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Duração</label>
                        <p className="text-white font-semibold text-lg">{viewingGarantia.duracao || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cobertura</label>
                        <p className="text-white">{viewingGarantia.cobertura || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data de Compra</label>
                        <p className="text-white">{viewingGarantia.data_compra ? formatarData(viewingGarantia.data_compra) : '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data de Expiração</label>
                        <p className="text-white">{viewingGarantia.data_expiracao ? formatarData(viewingGarantia.data_expiracao) : '-'}</p>
                      </div>
                    </div>
                    {viewingGarantia.descricao && (
                      <div className="border-t border-gray-600/50 pt-4">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</label>
                        <p className="text-white mt-2">{viewingGarantia.descricao}</p>
                      </div>
                    )}
                    {viewingGarantia.documentos && (
                      <div className="border-t border-gray-600/50 pt-4">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Documentos</label>
                        <p className="text-white mt-2">{viewingGarantia.documentos}</p>
                      </div>
                    )}
                    {viewingGarantia.perda_garantia && (
                      <div className="border-t border-gray-600/50 pt-4">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Perda de Garantia</label>
                        <p className="text-white mt-2">{viewingGarantia.perda_garantia}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Produto */}
                {viewingGarantia.produto && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Produto
                    </h4>
                    <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
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
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Especificação Técnica</label>
                            <p className="text-white">{viewingGarantia.produto.especificacao_tecnica}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Local */}
                {viewingGarantia.local && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Local
                    </h4>
                    <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                          <p className="text-white font-semibold">{viewingGarantia.local.nome}</p>
                        </div>
                        {viewingGarantia.local.plano_preventivo && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Plano Preventivo</label>
                            <p className="text-white">{viewingGarantia.local.plano_preventivo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fornecedor */}
                {viewingGarantia.fornecedor && (
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
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </label>
                            <p className="text-white">{viewingGarantia.fornecedor.email}</p>
                          </div>
                        )}
                        {viewingGarantia.fornecedor.telefone && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Telefone
                            </label>
                            <p className="text-white">{viewingGarantia.fornecedor.telefone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer do Modal */}
            <div className="bg-gray-800/50 border-t border-gray-700 p-6 flex justify-end space-x-3">
              {hasPermission('editar') && viewingGarantia && (
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    abrirModalEditar(viewingGarantia)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar Garantia</span>
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
                Tem certeza que deseja excluir esta garantia? Todos os dados relacionados serão perdidos permanentemente.
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
                  Excluir Garantia
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




