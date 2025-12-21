import { useState, useEffect } from 'react'
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
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Fornecedores</h1>
      <p className="text-gray-400 mb-6">Gerencie sua base de fornecedores</p>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone, endereço, cidade..."
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
            <span>Novo Fornecedor</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Endereço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cidade/Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {fornecedoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    {busca ? 'Nenhum fornecedor encontrado com o termo buscado.' : 'Nenhum fornecedor cadastrado.'}
                  </td>
                </tr>
              ) : (
                fornecedoresFiltrados.map((fornecedor) => (
                  <tr 
                    key={fornecedor.id} 
                    className="hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => abrirModalVisualizar(fornecedor)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{fornecedor.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-semibold">{fornecedor.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{fornecedor.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{fornecedor.telefone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {fornecedor.endereco || '-'}
                        {fornecedor.complemento && <span className="text-gray-400">, {fornecedor.complemento}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {fornecedor.cidade || '-'}
                        {fornecedor.estado && <span className="text-gray-400">/{fornecedor.estado}</span>}
                        {fornecedor.cep && <span className="text-gray-400 text-xs block">CEP: {fornecedor.cep}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => abrirModalEditar(fornecedor)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(fornecedor.id)}
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
                    {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingFornecedor ? 'Atualize os dados do fornecedor' : 'Preencha os dados para cadastrar um novo fornecedor'}
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
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Fornecedor XYZ"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@xyz.com"
                    className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Endereço (opcional)
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua Exemplo, 123"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Complemento (opcional)
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  placeholder="Apto 101, Bloco A"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ponto de Referência (opcional)
                </label>
                <input
                  type="text"
                  value={formData.ponto_referencia}
                  onChange={(e) => setFormData({ ...formData, ponto_referencia: e.target.value })}
                  placeholder="Próximo ao shopping"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cidade (opcional)
                  </label>
                  <select
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    disabled={!formData.estado}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
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
                  {submitting ? 'Salvando...' : editingFornecedor ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && viewingFornecedor && (
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
                    Detalhes do Fornecedor
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Informações completas e produtos relacionados
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
              {/* Informações do Fornecedor */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Informações do Fornecedor
                </h4>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">ID</label>
                      <p className="text-white font-semibold">{viewingFornecedor.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Nome</label>
                      <p className="text-white font-semibold">{viewingFornecedor.nome}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Email</label>
                      <p className="text-white">{viewingFornecedor.email || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase">Telefone</label>
                      <p className="text-white">{viewingFornecedor.telefone ? maskTelefone(viewingFornecedor.telefone) : '-'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-600 pt-3">
                    <label className="text-xs font-medium text-gray-400 uppercase">Endereço Completo</label>
                    <div className="text-white mt-1">
                      {viewingFornecedor.endereco && (
                        <p>{viewingFornecedor.endereco}</p>
                      )}
                      {viewingFornecedor.complemento && (
                        <p className="text-gray-300">{viewingFornecedor.complemento}</p>
                      )}
                      {viewingFornecedor.ponto_referencia && (
                        <p className="text-gray-300 text-sm">Ponto de referência: {viewingFornecedor.ponto_referencia}</p>
                      )}
                      <p className="text-gray-300">
                        {viewingFornecedor.cidade || ''}
                        {viewingFornecedor.cidade && viewingFornecedor.estado && ' - '}
                        {viewingFornecedor.estado || ''}
                        {viewingFornecedor.cep && ` | CEP: ${maskCEP(viewingFornecedor.cep)}`}
                      </p>
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
                  <div className="bg-gray-700 rounded-lg p-6 text-center">
                    <p className="text-gray-300">Carregando dados...</p>
                  </div>
                ) : produtosFornecedor.length === 0 ? (
                  <div className="bg-gray-700 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Nenhum produto relacionado a este fornecedor.</p>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Especificação Técnica</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Garantia</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-700 divide-y divide-gray-600">
                          {produtosFornecedor.map((produto) => {
                            // Buscar garantias deste produto
                            const garantiasProduto = garantiasFornecedor.filter(g => g.produto_id === produto.id)
                            return (
                              <tr key={produto.id} className="hover:bg-gray-600 transition-colors">
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
                Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
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

export default Fornecedores





