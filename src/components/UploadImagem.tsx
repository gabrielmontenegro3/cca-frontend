import React, { useState } from 'react';
import { imagemService, UploadResponse } from '../services/imagemService';

interface UploadImagemProps {
  chamadoId?: number;
  onUploadSuccess?: (imagem: UploadResponse) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export const UploadImagem: React.FC<UploadImagemProps> = ({
  chamadoId,
  onUploadSuccess,
  onUploadError,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      setError(null);
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Apenas arquivos de imagem são permitidos';
      setError(errorMsg);
      setSelectedFile(null);
      setPreview(null);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'O arquivo deve ter no máximo 10MB';
      setError(errorMsg);
      setSelectedFile(null);
      setPreview(null);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      const errorMsg = 'Selecione um arquivo';
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
      return;
    }

    if (!chamadoId) {
      const errorMsg = 'ID do chamado não informado';
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const resultado = await imagemService.upload(selectedFile, chamadoId);
      
      setSelectedFile(null);
      setPreview(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(resultado);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer upload da imagem';
      setError(errorMessage);
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    // Resetar o input file
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Imagem (opcional)
      </label>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading || disabled || !chamadoId}
            className="
              block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              file:hover:bg-blue-700
              file:cursor-pointer
              file:disabled:opacity-50 file:disabled:cursor-not-allowed
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-gray-800 border border-gray-600 rounded-lg
            "
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-lg p-2">
            {error}
          </div>
        )}

        {preview && selectedFile && (
          <div className="relative bg-gray-800 border border-gray-600 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-24 h-24 object-cover rounded-lg border border-gray-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <div className="flex gap-2 mt-2">
                  {chamadoId && (
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading || disabled}
                      className="
                        px-3 py-1 text-xs bg-blue-600 text-white rounded-lg
                        hover:bg-blue-700 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      {uploading ? 'Enviando...' : 'Enviar Imagem'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={uploading}
                    className="
                      px-3 py-1 text-xs bg-gray-600 text-white rounded-lg
                      hover:bg-gray-500 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!chamadoId && (
          <p className="text-xs text-gray-400 italic">
            A imagem será enviada após criar o chamado
          </p>
        )}
      </div>
    </div>
  );
};

