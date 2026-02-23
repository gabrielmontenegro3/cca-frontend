import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { chamadosService } from '../services/chamadosService'
import { Chamado } from '../types'
import { GaleriaImagens } from '../components/GaleriaImagens'
import { ChatChamado } from '../components/ChatChamado'
import { compressImages } from '../utils/imageCompression'

// Componente de seleção de status com animação interativa
interface StatusSelectorProps {
  status: string
  chamadoId: number
  onStatusChange: (id: number, novoStatus: string) => void
  getStatusColor: (status: string) => string
  getStatusLabel: (status: string) => string
}

const StatusSelector = ({ status, chamadoId, onStatusChange, getStatusColor, getStatusLabel }: StatusSelectorProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const statusOptions = [
    { value: 'aberto', label: 'Aberto' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'resolvido', label: 'Resolvido' },
    { value: 'cancelado', label: 'Cancelado' }
  ]

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    // Adiciona um pequeno delay antes de fechar para dar tempo de mover o mouse
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 200)
  }

  const handleStatusClick = (novoStatus: string) => {
    if (novoStatus !== status) {
      onStatusChange(chamadoId, novoStatus)
    }
  }

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Badge do status atual */}
      <div className="relative z-[100] flex-shrink-0">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Painel de seleção com animação - abre para a esquerda (z-index alto para sobrepor menu lateral em telas pequenas) */}
      <div
        className={`
          absolute right-full top-0 z-[100]
          flex items-center gap-3
          bg-gray-800 border border-gray-600 rounded-lg
          shadow-2xl
          backdrop-blur-sm
          transition-all duration-500 ease-out
          ${isHovered 
            ? 'opacity-100 translate-x-0 w-auto pointer-events-auto visible px-4 py-2 overflow-visible mr-2' 
            : 'opacity-0 translate-x-4 w-0 pointer-events-none invisible px-0 py-0 overflow-hidden mr-0 border-0'
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformOrigin: 'right center',
          maxWidth: isHovered ? 'none' : '0',
          minWidth: isHovered ? 'auto' : '0',
          transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.5s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), margin 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), min-width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div className="flex items-center gap-3 whitespace-nowrap">
          {statusOptions.map((option, index) => (
            <label
              key={option.value}
              className={`
                flex items-center gap-2 cursor-pointer
                transition-all duration-300 ease-out
                ${isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-2'}
                hover:scale-110 active:scale-105
                group
              `}
              style={{
                transitionDelay: isHovered ? `${index * 70}ms` : `${(statusOptions.length - index - 1) * 40}ms`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="radio"
                name={`status-${chamadoId}`}
                value={option.value}
                checked={status === option.value}
                onChange={() => handleStatusClick(option.value)}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-4 h-4
                  text-blue-600
                  bg-gray-700 border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                  cursor-pointer
                  transition-all duration-200
                  hover:border-blue-400
                "
              />
              <span className={`
                text-xs font-medium
                transition-colors duration-200
                ${status === option.value 
                  ? 'text-blue-400 font-semibold' 
                  : 'text-gray-300 hover:text-white'
                }
              `}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente de filtro de status com animação interativa
interface StatusFilterSelectorProps {
  filtroStatus: string
  onFiltroChange: (novoFiltro: string) => void
  getStatusColor: (status: string) => string
  getStatusLabel: (status: string) => string
}

const StatusFilterSelector = ({ filtroStatus, onFiltroChange, getStatusColor, getStatusLabel }: StatusFilterSelectorProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'aberto', label: 'Aberto' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'resolvido', label: 'Resolvido' },
    { value: 'cancelado', label: 'Cancelado' }
  ]

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    // Adiciona um pequeno delay antes de fechar para dar tempo de mover o mouse
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 200)
  }

  const handleFiltroClick = (novoFiltro: string) => {
    if (novoFiltro !== filtroStatus) {
      onFiltroChange(novoFiltro)
    }
  }

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Determinar o label e cor do badge atual
  const currentLabel = filtroStatus ? getStatusLabel(filtroStatus) : 'Todos os status'
  const currentColor = filtroStatus ? getStatusColor(filtroStatus) : 'bg-gray-500 text-white'

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge do filtro atual */}
      <div className="relative z-[100] flex-shrink-0">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${currentColor}`}>
          {currentLabel}
        </span>
      </div>

      {/* Painel de seleção com animação - abre para a direita (z-index alto para sobrepor menu lateral em telas pequenas) */}
      <div
        className={`
          absolute left-full top-0 z-[100]
          flex items-center gap-3
          bg-gray-800 border border-gray-600 rounded-lg
          shadow-2xl
          backdrop-blur-sm
          transition-all duration-500 ease-out
          ${isHovered 
            ? 'opacity-100 translate-x-0 w-auto pointer-events-auto visible px-4 py-2 overflow-visible ml-2' 
            : 'opacity-0 -translate-x-4 w-0 pointer-events-none invisible px-0 py-0 overflow-hidden ml-0 border-0'
          }
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformOrigin: 'left center',
          maxWidth: isHovered ? 'none' : '0',
          minWidth: isHovered ? 'auto' : '0',
          transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.5s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), margin 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), min-width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div className="flex items-center gap-3 whitespace-nowrap">
          {statusOptions.map((option, index) => (
            <label
              key={option.value || 'todos'}
              className={`
                flex items-center gap-2 cursor-pointer
                transition-all duration-300 ease-out
                ${isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-2'}
                hover:scale-110 active:scale-105
                group
              `}
              style={{
                transitionDelay: isHovered ? `${index * 70}ms` : `${(statusOptions.length - index - 1) * 40}ms`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <input
                type="radio"
                name={`filtro-status`}
                value={option.value}
                checked={filtroStatus === option.value}
                onChange={() => handleFiltroClick(option.value)}
                className="
                  w-4 h-4
                  text-blue-600
                  bg-gray-700 border-gray-600
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                  cursor-pointer
                  transition-all duration-200
                  hover:border-blue-400
                "
              />
              <span className={`
                text-xs font-medium
                transition-colors duration-200
                ${filtroStatus === option.value 
                  ? 'text-blue-400 font-semibold' 
                  : 'text-gray-300 hover:text-white'
                }
              `}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

const AssistenciaTecnica = () => {
  const { hasPermission, usuario: usuarioLogado } = useAuth()
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: ''
  })
  const [editingChamado, setEditingChamado] = useState<Chamado | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [chamadoSelecionadoChat, setChamadoSelecionadoChat] = useState<number | null>(null)
  const [anexosForm, setAnexosForm] = useState<File[]>([])
  const [anexosPreview, setAnexosPreview] = useState<string[]>([])
  const [chatRefreshKey, setChatRefreshKey] = useState(0)
  const [showModalCriarChamado, setShowModalCriarChamado] = useState(false)

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint do Tailwind
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        
        // Preparar filtros
        const filtros: any = {}
        
        // Filtrar por status se houver
        if (filtroStatus) {
          filtros.status = filtroStatus as any
        }
        
        // Construtora e Gestão Técnica podem ver todos os chamados
        // Outros usuários (morador) veem apenas seus próprios chamados
        if (usuarioLogado) {
          const tipoNormalizado = String(usuarioLogado.tipo).trim().toLowerCase()
          const podeVerTodos = tipoNormalizado === 'construtora' || tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica'
          
          if (!podeVerTodos) {
            filtros.usuario = usuarioLogado.id
          }
        }
        
        // Se não houver filtros, passar undefined para listar todos
        const filtrosParaEnviar = Object.keys(filtros).length > 0 ? filtros : undefined
        const chamadosData = await chamadosService.listar(filtrosParaEnviar)
        
        // Ordenar por data de criação (mais recentes primeiro)
        const chamadosOrdenados = chamadosData.sort((a, b) => {
          const dataA = a.created_at || a.data_criacao || ''
          const dataB = b.created_at || b.data_criacao || ''
          if (!dataA && !dataB) return 0
          if (!dataA) return 1
          if (!dataB) return -1
          return new Date(dataB).getTime() - new Date(dataA).getTime()
        })
        
        setChamados(chamadosOrdenados)
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [filtroStatus, hasPermission, usuarioLogado])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'bg-red-600 text-white'
      case 'em_andamento':
        return 'bg-yellow-600 text-white'
      case 'resolvido':
        return 'bg-green-600 text-white'
      case 'cancelado':
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      em_andamento: 'Em Andamento',
      resolvido: 'Resolvido',
      cancelado: 'Cancelado'
    }
    return labels[status] || status
  }

  const formatarData = (data?: string) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim()) {
      alert('Por favor, preencha o título do chamado')
      return
    }

    // Se for morador, usar o ID do usuário logado
    const usuarioId = usuarioLogado?.id
    if (!usuarioId) {
      alert('Erro: Usuário não identificado')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingChamado) {
        // Editar chamado existente
        const chamadoAtualizado = await chamadosService.atualizar(editingChamado.id, {
          titulo: formData.titulo,
          descricao: formData.descricao || undefined
        })
        
        setChamados(chamados.map(c => c.id === editingChamado.id ? chamadoAtualizado : c))
        setEditingChamado(null)
        alert('Chamado atualizado com sucesso!')
      } else {
        // Criar novo chamado com anexos
        const anexosParaEnviar = anexosForm.length > 0 ? anexosForm : (selectedImageFile ? [selectedImageFile] : [])
        
        const novoChamado = await chamadosService.criar({
          titulo: formData.titulo,
          usuario: usuarioId,
          status: 'aberto',
          descricao: formData.descricao || undefined,
          anexos: anexosParaEnviar.length > 0 ? anexosParaEnviar : undefined
        })
        
        setChamados([novoChamado, ...chamados])
        alert('Chamado criado com sucesso!')
        
        // Abrir chat do chamado criado
        setChamadoSelecionadoChat(novoChamado.id)
      }
      
      setFormData({ titulo: '', descricao: '' })
      setSelectedImageFile(null)
      setAnexosForm([])
      setAnexosPreview([])
      setEditingChamado(null)
      setShowModalCriarChamado(false) // Fechar modal após criar/editar
    } catch (err) {
      alert(err instanceof Error ? err.message : editingChamado ? 'Erro ao atualizar chamado' : 'Erro ao criar chamado')
      console.error('Erro ao processar chamado:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditarChamado = (chamado: Chamado) => {
    // Verificar se o morador pode editar este chamado (deve ser o próprio chamado)
    if (hasPermission('editar_proprio_chamado') && usuarioLogado && chamado.usuario !== usuarioLogado.id) {
      alert('Você só pode editar seus próprios chamados')
      return
    }
    
    setEditingChamado(chamado)
    setFormData({
      titulo: chamado.titulo,
      descricao: chamado.descricao || ''
    })
    setShowModalCriarChamado(true) // Abrir modal para editar
  }

  const handleCancelarEdicao = () => {
    setEditingChamado(null)
    setFormData({ titulo: '', descricao: '' })
    setSelectedImageFile(null)
    setAnexosForm([])
    setAnexosPreview([])
    setShowModalCriarChamado(false) // Fechar modal
  }

  const handleAnexosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Ao abrir chamado: apenas 1 foto (imagem). O bloco de anexos só aparece em novo chamado.
    const isNovoChamado = !editingChamado
    let fileArray = Array.from(files)
    if (isNovoChamado) {
      fileArray = fileArray.slice(0, 1)
      if (fileArray.length > 0 && !fileArray[0].type.startsWith('image/')) {
        alert('Para abrir um chamado é permitido apenas uma foto (imagem).')
        e.target.value = ''
        return
      }
    }

    const validFiles: File[] = []
    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`O arquivo ${file.name} excede 10MB e será ignorado`)
        continue
      }
      validFiles.push(file)
    }

    const processedFiles = await compressImages(validFiles, 1, 1920)
    const finalFiles = isNovoChamado ? processedFiles : [...anexosForm, ...processedFiles].slice(0, 10)

    if (isNovoChamado) {
      setAnexosForm(finalFiles)
      if (processedFiles[0]?.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setAnexosPreview([reader.result as string])
        reader.readAsDataURL(processedFiles[0])
      } else {
        setAnexosPreview([])
      }
    } else {
      processedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onloadend = () => setAnexosPreview(prev => [...prev, reader.result as string])
          reader.readAsDataURL(file)
        } else {
          setAnexosPreview(prev => [...prev, ''])
        }
      })
      setAnexosForm(finalFiles)
    }
  }

  const removerAnexo = (index: number) => {
    setAnexosForm(prev => prev.filter((_, i) => i !== index))
    setAnexosPreview(prev => prev.filter((_, i) => i !== index))
    const fileInput = document.getElementById('chamado-anexos-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleAtualizarStatus = async (id: number, novoStatus: string) => {
    try {
      // Buscar o chamado atual para obter o status anterior
      const chamadoAtual = chamados.find(c => c.id === id)
      const statusAnterior = chamadoAtual?.status || 'aberto'
      
      // Atualizar o status
      const chamadoAtualizado = await chamadosService.atualizarStatus(id, novoStatus as any)
      setChamados(chamados.map(c => c.id === id ? chamadoAtualizado : c))
      
      // Se o usuário for Gestão Técnica, registrar a mudança no chat
      if (usuarioLogado) {
        const tipoNormalizado = String(usuarioLogado.tipo).trim().toLowerCase()
        const isGestaoTecnica = tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica'
        
        if (isGestaoTecnica && statusAnterior !== novoStatus) {
          // Criar mensagem automática sobre a mudança de status
          const statusLabels: Record<string, string> = {
            aberto: 'Aberto',
            em_andamento: 'Em Andamento',
            resolvido: 'Resolvido',
            cancelado: 'Cancelado'
          }
          
          const mensagemStatus = `Status alterado de "${statusLabels[statusAnterior] || statusAnterior}" para "${statusLabels[novoStatus] || novoStatus}"`
          
          try {
            await chamadosService.enviarMensagem(id, {
              mensagem: mensagemStatus
            })
            
            // Se o chat estiver aberto, forçar recarregamento para mostrar o novo aviso
            if (chamadoSelecionadoChat === id) {
              setChatRefreshKey(prev => prev + 1)
            }
          } catch (err) {
            console.error('Erro ao registrar mudança de status no chat:', err)
            // Não mostrar erro ao usuário, pois o status já foi atualizado
          }
        }
      }
    } catch (err) {
      alert('Erro ao atualizar status do chamado')
      console.error('Erro ao atualizar status:', err)
    }
  }

  const handleDeletarChamado = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este chamado?')) return

    try {
      await chamadosService.deletar(id)
      setChamados(chamados.filter(c => c.id !== id))
      alert('Chamado deletado com sucesso!')
    } catch (err) {
      alert('Erro ao deletar chamado')
      console.error('Erro ao deletar chamado:', err)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Ponto crítico</h1>
        <p className="text-gray-400 mb-6">Gerencie os chamados técnicos do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-300">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Ponto crítico</h1>
      <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">Gerencie os chamados técnicos do sistema</p>
      
      {error && (
        <div className="mb-4 md:mb-6 bg-red-900 border border-red-700 p-3 md:p-4 rounded-lg shadow-lg">
          <p className="text-sm md:text-base text-red-200">Erro: {error}</p>
        </div>
      )}

      {/* Barra de Filtros e Ações - apenas desktop */}
      {!isMobile && (
        <div className="bg-gray-700 rounded-lg p-3 md:p-4 mb-4 md:mb-6 shadow-lg">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="w-full">
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Filtrar por Status:</label>
              <div className="w-full">
                <StatusFilterSelector
                  filtroStatus={filtroStatus}
                  onFiltroChange={setFiltroStatus}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Principal - Lista e Chat */}
      <div className={`flex flex-col ${chamadoSelecionadoChat && !isMobile ? 'lg:flex-row' : ''} gap-4 md:gap-6`}>
        <div className={`${chamadoSelecionadoChat && !isMobile ? 'lg:w-1/3' : 'w-full'}`}>
          <div>
            {/* Título e Botão Criar Chamado na mesma linha */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-white">Chamados</h3>
              {hasPermission('criar_chamado') && (
                <button
                  onClick={() => {
                    setEditingChamado(null)
                    setFormData({ titulo: '', descricao: '' })
                    setSelectedImageFile(null)
                    setAnexosForm([])
                    setAnexosPreview([])
                    setShowModalCriarChamado(true)
                  }}
                  className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-semibold flex items-center gap-2 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Criar Chamado</span>
                  <span className="sm:hidden">Criar</span>
                </button>
              )}
            </div>
            <div className="space-y-2 md:space-y-3">
              {chamados.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhum chamado registrado.</p>
                </div>
              ) : (
                chamados.map((chamado) => {
                  // Verificar se o usuário pode abrir o chat deste chamado
                  const podeAbrirChat = () => {
                    if (!usuarioLogado) return false;
                    const tipoNormalizado = String(usuarioLogado.tipo).trim().toLowerCase();
                    // Morador só pode abrir chat de seus próprios chamados
                    if (tipoNormalizado === 'morador' && chamado.usuario !== usuarioLogado.id) {
                      return false;
                    }
                    // Gestão Técnica, Construtora e Administrador podem abrir qualquer chat
                    return true;
                  };

                  return (
                    <div 
                      key={chamado.id} 
                      onClick={(e) => {
                        // Não abrir chat se clicar em botões ou elementos interativos
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('input') || target.closest('label')) {
                          return;
                        }
                        if (podeAbrirChat()) {
                          setChamadoSelecionadoChat(chamado.id);
                        }
                      }}
                      className={`bg-gray-800 border border-gray-600 rounded-lg p-3 md:p-4 transition-colors ${
                        podeAbrirChat() ? 'hover:bg-gray-750 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-base md:text-lg truncate">{chamado.titulo}</h4>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                          {chamado.usuario_dados && (
                            <>Usuário: <strong className="text-gray-300">{chamado.usuario_dados.nome}</strong></>
                          )}
                          {chamado.data_criacao && chamado.usuario_dados && ` • ${formatarData(chamado.data_criacao)}`}
                          {chamado.data_criacao && !chamado.usuario_dados && formatarData(chamado.data_criacao)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 md:ml-4 flex-shrink-0">
                        {(() => {
                          // Apenas usuários do tipo "gestão tecnica" podem mudar o status
                          if (usuarioLogado) {
                            const tipoNormalizado = String(usuarioLogado.tipo).trim().toLowerCase()
                            const podeMudarStatus = tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica'
                            
                            if (podeMudarStatus) {
                              return (
                                <StatusSelector
                                  status={chamado.status}
                                  chamadoId={chamado.id}
                                  onStatusChange={handleAtualizarStatus}
                                  getStatusColor={getStatusColor}
                                  getStatusLabel={getStatusLabel}
                                />
                              )
                            }
                          }
                          
                          // Outros usuários apenas visualizam o status
                          return (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(chamado.status)}`}>
                              {getStatusLabel(chamado.status)}
                            </span>
                          )
                        })()}
                        {/* Botão de editar apenas para moradores (se for o próprio chamado) */}
                        {hasPermission('editar_proprio_chamado') && usuarioLogado && chamado.usuario === usuarioLogado.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarChamado(chamado);
                            }}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Editar chamado"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {/* Botão de deletar apenas para administradores */}
                        {hasPermission('gerenciar_usuarios') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletarChamado(chamado.id);
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Deletar chamado"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {chamado.descricao && (
                      <p className="text-sm text-gray-300 mt-3 pt-3 border-t border-gray-600">{chamado.descricao}</p>
                    )}
                    <GaleriaImagens 
                      chamadoId={chamado.id}
                      canRemove={!!(hasPermission('gerenciar_usuarios') || (hasPermission('editar_proprio_chamado') && usuarioLogado && chamado.usuario === usuarioLogado.id))}
                    />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat do Chamado - Desktop (ao lado) */}
        {chamadoSelecionadoChat && !isMobile && (
          <div className="lg:w-2/3">
            <div className="bg-gray-700 rounded-lg shadow-lg p-3 md:p-6 border border-gray-600 h-[calc(100vh-12rem)] md:h-[800px]">
              <ChatChamado 
                chamadoId={chamadoSelecionadoChat}
                refreshKey={chatRefreshKey}
                onSelecionarChamado={(novoChamadoId) => {
                  setChamadoSelecionadoChat(novoChamadoId);
                }}
                onClose={() => {
                  setChamadoSelecionadoChat(null)
                  // Recarregar chamados para atualizar updated_at
                  const carregarDados = async () => {
                    try {
                      const filtros: any = {}
                      if (filtroStatus) {
                        filtros.status = filtroStatus as any
                      }
                      if (usuarioLogado) {
                        const tipoNormalizado = String(usuarioLogado.tipo).trim().toLowerCase()
                        const podeVerTodos = tipoNormalizado === 'construtora' || tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica'
                        if (!podeVerTodos) {
                          filtros.usuario = usuarioLogado.id
                        }
                      }
                      const filtrosParaEnviar = Object.keys(filtros).length > 0 ? filtros : undefined
                      const chamadosData = await chamadosService.listar(filtrosParaEnviar)
                      
                      // Ordenar por data de criação (mais recentes primeiro)
                      const chamadosOrdenados = chamadosData.sort((a, b) => {
                        const dataA = a.created_at || a.data_criacao || ''
                        const dataB = b.created_at || b.data_criacao || ''
                        if (!dataA && !dataB) return 0
                        if (!dataA) return 1
                        if (!dataB) return -1
                        return new Date(dataB).getTime() - new Date(dataA).getTime()
                      })
                      
                      setChamados(chamadosOrdenados)
                    } catch (err) {
                      console.error('Erro ao recarregar chamados:', err)
                    }
                  }
                  carregarDados()
                }}
              />
            </div>
          </div>
        )}

        {/* Chat do Chamado - Mobile (fullscreen) */}
        {chamadoSelecionadoChat && isMobile && (
          <div className="fixed inset-0 z-50 bg-gray-900 lg:hidden">
            <div className="h-full flex flex-col">
              {/* Header com botão X */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                <h2 className="text-lg font-semibold text-white">Chat</h2>
                <button
                  onClick={() => {
                    setChamadoSelecionadoChat(null)
                    // Recarregar chamados para atualizar updated_at
                    const carregarDados = async () => {
                      try {
                        const filtros: any = {}
                        if (filtroStatus) {
                          filtros.status = filtroStatus as any
                        }
                        if (usuarioLogado) {
                          const tipoNormalizado = String(usuarioLogado.tipo).trim().toLowerCase()
                          const podeVerTodos = tipoNormalizado === 'construtora' || tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica'
                          if (!podeVerTodos) {
                            filtros.usuario = usuarioLogado.id
                          }
                        }
                        const filtrosParaEnviar = Object.keys(filtros).length > 0 ? filtros : undefined
                        const chamadosData = await chamadosService.listar(filtrosParaEnviar)
                        
                        // Ordenar por data de criação (mais recentes primeiro)
                        const chamadosOrdenados = chamadosData.sort((a, b) => {
                          const dataA = a.created_at || a.data_criacao || ''
                          const dataB = b.created_at || b.data_criacao || ''
                          if (!dataA && !dataB) return 0
                          if (!dataA) return 1
                          if (!dataB) return -1
                          return new Date(dataB).getTime() - new Date(dataA).getTime()
                        })
                        
                        setChamados(chamadosOrdenados)
                      } catch (err) {
                        console.error('Erro ao recarregar chamados:', err)
                      }
                    }
                    carregarDados()
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Fechar chat"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Chat */}
              <div className="flex-1 overflow-hidden bg-gray-800">
                <ChatChamado 
                  chamadoId={chamadoSelecionadoChat}
                  refreshKey={chatRefreshKey}
                  onSelecionarChamado={(novoChamadoId) => {
                    setChamadoSelecionadoChat(novoChamadoId);
                  }}
                  onClose={undefined}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Chamado */}
      {showModalCriarChamado && hasPermission('criar_chamado') && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCancelarEdicao}
        >
          <div 
            className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 md:p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {editingChamado ? 'Editar Chamado' : 'Novo Chamado'}
              </h3>
              <button
                onClick={handleCancelarEdicao}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-300 mb-2">
                    Título do Chamado *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full bg-gray-700/50 text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-600/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm md:text-base"
                    required
                    placeholder="Ex: Problema no ar condicionado"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-300 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full bg-gray-700/50 text-white placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-600/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm md:text-base"
                    rows={4}
                    placeholder="Descreva o problema em detalhes..."
                  />
                </div>

                {!editingChamado && (
                  <div>
                    <label className="block text-sm md:text-base font-semibold text-gray-300 mb-2">
                      Foto (opcional, no máximo 1 imagem, 10MB)
                    </label>
                    <div className="space-y-2">
                      <input
                        id="chamado-anexos-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAnexosChange}
                        disabled={submitting}
                        className="
                          block w-full text-sm text-gray-300
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          file:hover:bg-blue-700
                          file:cursor-pointer
                          file:disabled:opacity-50 file:disabled:cursor-not-allowed
                          disabled:opacity-50 disabled:cursor-not-allowed
                          bg-gray-700/50 border border-gray-600/50 rounded-xl
                        "
                      />
                      {anexosForm.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {anexosForm.map((arquivo, index) => (
                            <div
                              key={index}
                              className="relative bg-gray-700/50 border border-gray-600/50 rounded-lg p-2"
                            >
                              {anexosPreview[index] ? (
                                <img
                                  src={anexosPreview[index]}
                                  alt="Preview"
                                  className="w-full h-20 object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removerAnexo(index)}
                                disabled={submitting}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                ×
                              </button>
                              <p className="text-xs text-gray-400 mt-1 truncate">{arquivo.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 italic">
                        A foto será enviada com a mensagem inicial do chamado
                      </p>
                    </div>
                  </div>
                )}

                {usuarioLogado && (
                  <div className="text-sm text-gray-400 bg-gray-700/50 rounded-xl p-3 border border-gray-600/30">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Usuário: <strong className="text-white">{usuarioLogado.nome}</strong>
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelarEdicao}
                    disabled={submitting}
                    className="w-full sm:flex-1 px-6 py-3 bg-gray-600/50 text-white rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingChamado ? 'Salvando...' : 'Criando...'}
                      </>
                    ) : (
                      <>
                        {editingChamado ? 'Salvar Alterações' : 'Criar Chamado'}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssistenciaTecnica








