import { useState, useRef, useEffect } from 'react'

interface SeletorAnexoProps {
  onFileSelect: (files: File[]) => void
  onClose: () => void
  maxFiles?: number
  accept?: string
}

export const SeletorAnexo = ({ onFileSelect, onClose, maxFiles = 10, accept = 'image/*,application/pdf' }: SeletorAnexoProps) => {
  const [error, setError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isLoadingCamera, setIsLoadingCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleCameraClick = async () => {
    try {
      setError(null) // Limpar erros anteriores
      setIsLoadingCamera(true)
      
      // Tentar primeiro com câmera traseira (mobile)
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        })
      } catch (envError: any) {
        // Se falhar, tentar sem especificar facingMode (desktop ou câmera frontal)
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true
          })
        } catch (fallbackError) {
          throw envError // Lançar o erro original
        }
      }
      
      if (stream) {
        streamRef.current = stream
        setIsLoadingCamera(false)
        // Fechar o modal de seleção apenas se conseguir acessar a câmera
        onClose()
        
        // Pequeno delay para garantir que o modal feche antes de abrir a câmera
        setTimeout(() => {
          setShowCamera(true)
          // Configurar o vídeo imediatamente após abrir
          setTimeout(() => {
            if (videoRef.current && streamRef.current) {
              const video = videoRef.current
              video.srcObject = streamRef.current
              video.play().catch(err => {
                console.error('Erro ao reproduzir vídeo:', err)
              })
            }
          }, 50)
        }, 100)
      }
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err)
      setIsLoadingCamera(false)
      let errorMessage = 'Não foi possível acessar a câmera.'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'A câmera está sendo usada por outro aplicativo.'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'A câmera solicitada não está disponível.'
      }
      
      setError(errorMessage)
      // Não fechar o modal se houver erro, para mostrar a mensagem
    }
  }

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Configurar canvas com as dimensões do vídeo
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Espelhar horizontalmente para reverter o espelhamento do vídeo
    context.translate(canvas.width, 0)
    context.scale(-1, 1)

    // Desenhar o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0)

    // Converter canvas para blob e depois para File
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        // Parar o stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        // Fechar a câmera e passar o arquivo
        setShowCamera(false)
        onFileSelect([file])
      }
    }, 'image/jpeg', 0.95)
  }

  const handleCancelCamera = () => {
    // Parar o stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    onClose()
  }

  // Limpar stream ao desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Atualizar srcObject quando showCamera mudar ou quando o vídeo estiver pronto
  useEffect(() => {
    if (showCamera && streamRef.current) {
      // Pequeno delay para garantir que o DOM foi atualizado
      const timer = setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          const video = videoRef.current
          video.srcObject = streamRef.current
          
          // Garantir que o vídeo comece a reproduzir
          const handleLoadedMetadata = () => {
            video.play().catch(err => {
              console.error('Erro ao reproduzir vídeo:', err)
            })
          }
          
          video.addEventListener('loadedmetadata', handleLoadedMetadata)
          
          // Tentar reproduzir imediatamente também
          video.play().catch(err => {
            console.error('Erro ao reproduzir vídeo:', err)
          })
          
          return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
          }
        }
      }, 100)
      
      return () => {
        clearTimeout(timer)
        // Limpar srcObject quando o componente desmontar ou showCamera mudar
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    }
  }, [showCamera])

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      onClose()
      return
    }

    const fileArray = Array.from(files)
    const validFiles: File[] = []

    fileArray.forEach((file) => {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`O arquivo ${file.name} excede 10MB e será ignorado`)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles.slice(0, maxFiles))
      onClose()
    }

    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Se a câmera estiver aberta, mostrar interface de câmera
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header da câmera */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancelCamera}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              aria-label="Cancelar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-white font-semibold">Tirar Foto</h3>
            <div className="w-10"></div> {/* Espaçador */}
          </div>
        </div>

        {/* Vídeo da câmera */}
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Espelhar o vídeo para parecer mais natural
          />
          <canvas ref={canvasRef} className="hidden" />
          {!streamRef.current && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Carregando câmera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center">
            <button
              onClick={handleTakePhoto}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center justify-center"
              aria-label="Capturar foto"
            >
              <div className="w-16 h-16 bg-white rounded-full"></div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Modal Minimalista */}
        <div 
          className="bg-gray-900 rounded-t-3xl lg:rounded-3xl w-full lg:w-auto lg:min-w-[360px] lg:max-w-[420px] shadow-2xl border-t lg:border border-gray-700/50 animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar para mobile */}
          <div className="pt-3 pb-2 lg:hidden flex justify-center">
            <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
          </div>

          {/* Opções */}
          <div className="px-6 py-4 space-y-2">
            {error && (
              <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-in fade-in">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Câmera */}
            <button
              onClick={handleCameraClick}
              disabled={isLoadingCamera}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/50 rounded-2xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold text-base">
                  {isLoadingCamera ? 'Abrindo câmera...' : 'Tirar Foto'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isLoadingCamera ? 'Aguarde...' : 'Usar câmera do dispositivo'}
                </p>
              </div>
              {isLoadingCamera && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
            </button>

            {/* Galeria */}
            <button
              onClick={handleGalleryClick}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-green-500/50 rounded-2xl transition-all duration-200 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-green-500/30 group-hover:scale-105 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold text-base">Anexar Imagem</p>
                <p className="text-xs text-gray-400 mt-0.5">Escolher da galeria</p>
              </div>
            </button>
          </div>

          {/* Footer minimalista */}
          <div className="px-6 pb-6 pt-2">
            <p className="text-xs text-gray-500 text-center">
              Máximo {maxFiles} arquivos • 10MB cada
            </p>
          </div>
        </div>
      </div>

      {/* Input oculto para galeria */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
