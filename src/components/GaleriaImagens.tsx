import React, { useEffect, useState } from 'react';
import { imagemService, Imagem } from '../services/imagemService';

interface GaleriaImagensProps {
  chamadoId: number;
  onImageRemoved?: () => void;
  canRemove?: boolean;
}

export const GaleriaImagens: React.FC<GaleriaImagensProps> = ({ 
  chamadoId, 
  onImageRemoved,
  canRemove = false 
}) => {
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Imagem | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const carregarImagens = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await imagemService.listar(chamadoId);
      setImagens(dados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar imagens');
      console.error('Erro ao carregar imagens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chamadoId) {
      carregarImagens();
    }
  }, [chamadoId]);

  // Renovação automática de URLs a cada 6 dias (antes de expirar em 7 dias)
  useEffect(() => {
    if (!chamadoId || imagens.length === 0) return;

    const interval = setInterval(() => {
      carregarImagens(); // Recarregar todas as imagens para renovar URLs
    }, 6 * 24 * 60 * 60 * 1000); // 6 dias

    return () => clearInterval(interval);
  }, [chamadoId, imagens.length]);

  const handleRemover = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta imagem?')) {
      return;
    }

    try {
      setRemovingId(id);
      await imagemService.remover(id);
      setImagens(imagens.filter(img => img.id !== id));
      if (onImageRemoved) {
        onImageRemoved();
      }
    } catch (err: any) {
      alert(`Erro ao remover imagem: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao remover imagem:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleRenovarUrl = async (imagem: Imagem) => {
    try {
      const { url } = await imagemService.download(imagem.id);
      setImagens(prev => 
        prev.map(img => img.id === imagem.id ? { ...img, url } : img)
      );
    } catch (err: any) {
      console.error('Erro ao renovar URL:', err);
      // Tentar recarregar todas as imagens
      carregarImagens();
    }
  };

  const handleImageError = (imagem: Imagem) => {
    // Se a URL expirou, tentar renovar
    handleRenovarUrl(imagem);
  };

  // Renovação automática de URLs a cada 6 dias (antes de expirar em 7 dias)
  useEffect(() => {
    if (!chamadoId || imagens.length === 0) return;

    const interval = setInterval(() => {
      carregarImagens(); // Recarregar todas as imagens para renovar URLs
    }, 6 * 24 * 60 * 60 * 1000); // 6 dias

    return () => clearInterval(interval);
  }, [chamadoId, imagens.length]);

  const openModal = (imagem: Imagem) => {
    setSelectedImage(imagem);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Fechar modal com ESC e navegação com setas
  useEffect(() => {
    if (!selectedImage) return;

    const navigateImage = (direction: 'prev' | 'next') => {
      const currentIndex = imagens.findIndex(img => img.id === selectedImage.id);
      if (currentIndex === -1) return;

      let newIndex: number;
      if (direction === 'next') {
        newIndex = currentIndex + 1 >= imagens.length ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex - 1 < 0 ? imagens.length - 1 : currentIndex - 1;
      }

      setSelectedImage(imagens[newIndex]);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevenir scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, imagens]);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = imagens.findIndex(img => img.id === selectedImage.id);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= imagens.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? imagens.length - 1 : currentIndex - 1;
    }

    setSelectedImage(imagens[newIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="text-sm text-gray-400">Carregando imagens...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-lg p-2">
        Erro: {error}
      </div>
    );
  }

  if (imagens.length === 0) {
    return null; // Não exibe nada se não houver imagens
  }

  return (
    <>
      <div className="mt-3 pt-3 border-t border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-medium text-gray-300">
            Imagens ({imagens.length})
          </h5>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {imagens.map((imagem) => (
            <div 
              key={imagem.id} 
              className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-600 hover:border-blue-500 transition-all"
            >
              <div className="aspect-square relative">
                {imagem.url ? (
                  <>
                    <img
                      src={imagem.url}
                      alt={`Imagem ${imagem.id}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openModal(imagem)}
                      onError={() => handleImageError(imagem)}
                    />
                    {/* Overlay de erro quando URL expira */}
                    <div className="absolute inset-0 bg-gray-900/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <div className="text-xs text-gray-400 text-center px-2">
                        Clique para visualizar
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-xs text-gray-500">Carregando...</div>
                  </div>
                )}
                
                {/* Overlay com ações ao hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openModal(imagem)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Visualizar em tamanho maior"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                  {canRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemover(imagem.id);
                      }}
                      disabled={removingId === imagem.id}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Remover imagem"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para visualização em tamanho maior */}
      {selectedImage && imagens.length > 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Botão fechar */}
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
              title="Fechar (ESC)"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Botão anterior (apenas se houver mais de uma imagem) */}
            {imagens.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 z-10"
                title="Imagem anterior (←)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Botão próximo (apenas se houver mais de uma imagem) */}
            {imagens.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 z-10"
                title="Próxima imagem (→)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {selectedImage.url ? (
              <img
                src={selectedImage.url}
                alt={`Imagem ${selectedImage.id}`}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
                onError={() => handleImageError(selectedImage)}
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-800 rounded-lg">
                <div className="text-gray-400">Carregando imagem...</div>
              </div>
            )}
            
            <div className="mt-2 text-center text-sm text-gray-400">
              {imagens.length > 1 && (
                <span className="mr-2">
                  {imagens.findIndex(img => img.id === selectedImage.id) + 1} / {imagens.length}
                </span>
              )}
              {selectedImage.nome_original || selectedImage.path}
              {selectedImage.tamanho && ` • ${(selectedImage.tamanho / 1024).toFixed(2)} KB`}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

