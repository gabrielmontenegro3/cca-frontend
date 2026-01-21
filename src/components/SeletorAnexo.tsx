import { useState, useRef } from 'react'
import { compressImage } from '../utils/imageCompression'

interface SeletorAnexoProps {
  onFileSelect: (files: File[]) => void
  onClose: () => void
  maxFiles?: number
  accept?: string
}

export const SeletorAnexo = ({ onFileSelect, onClose, maxFiles = 10, accept = 'image/*,application/pdf' }: SeletorAnexoProps) => {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      onClose()
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const fileArray = Array.from(files)
      const validFiles: File[] = []

      // Processar arquivos
      for (const file of fileArray) {
        // Validar tamanho original (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`O arquivo ${file.name} excede 10MB e será ignorado`)
          continue
        }

        // Se for imagem, comprimir
        if (file.type.startsWith('image/')) {
          try {
            const compressedFile = await compressImage(file, 1, 1920)
            validFiles.push(compressedFile)
          } catch (err) {
            console.error('Erro ao comprimir imagem:', err)
            validFiles.push(file) // Se falhar, usar original
          }
        } else {
          validFiles.push(file)
        }
      }

      if (validFiles.length > maxFiles) {
        setError(`Máximo de ${maxFiles} arquivos permitidos`)
        setIsProcessing(false)
        return
      }

      if (validFiles.length > 0) {
        onFileSelect(validFiles.slice(0, maxFiles))
        onClose()
      } else {
        setIsProcessing(false)
      }
    } catch (err) {
      console.error('Erro ao processar arquivos:', err)
      setError('Erro ao processar arquivos')
      setIsProcessing(false)
    }

    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
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

          {/* Conteúdo */}
          <div className="px-6 py-4 space-y-2">
            {error && (
              <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-in fade-in">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {isProcessing && (
              <div className="mb-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 animate-in fade-in">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <p className="text-sm text-blue-400">Comprimindo imagens...</p>
                </div>
              </div>
            )}

            {/* Botão de Seleção */}
            <button
              onClick={handleButtonClick}
              disabled={isProcessing}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/50 rounded-2xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold text-base">
                  Selecionar Arquivos
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Câmera, galeria ou arquivos
                </p>
              </div>
            </button>
          </div>

          {/* Footer minimalista */}
          <div className="px-6 pb-6 pt-2">
            <p className="text-xs text-gray-500 text-center">
              Máximo {maxFiles} arquivos • 10MB cada
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Imagens serão comprimidas automaticamente
            </p>
          </div>
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        capture="environment" // Sugere câmera traseira em mobiles
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
