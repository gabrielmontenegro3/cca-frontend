import api from './api';

export interface Imagem {
  id: number;
  path: string;
  bucket: string;
  chamado_id: number;
  created_at: string;
  url?: string;
  tamanho?: number;
  tipo?: string;
  nome_original?: string;
}

export interface UploadResponse extends Imagem {
  url: string;
  tamanho: number;
  tipo: string;
  nome_original: string;
}

export interface DownloadResponse {
  id: number;
  url: string;
  path: string;
  bucket: string;
  chamado_id: number;
  expires_in: number;
}

export const imagemService = {
  // Listar imagens (opcionalmente filtrar por chamado_id)
  listar: async (chamadoId?: number): Promise<Imagem[]> => {
    const url = chamadoId 
      ? `/api/imagens?chamado_id=${chamadoId}`
      : '/api/imagens';
    
    const response = await api.get(url);
    return response.data;
  },

  // Buscar imagem por ID
  buscarPorId: async (id: number): Promise<Imagem> => {
    const response = await api.get(`/api/imagens/${id}`);
    return response.data;
  },

  // Upload de imagem
  upload: async (file: File, chamadoId: number): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chamado_id', chamadoId.toString());

    const response = await api.post('/api/imagens/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Gerar URL de download (renovar URL expirada)
  download: async (id: number): Promise<DownloadResponse> => {
    const response = await api.get(`/api/imagens/${id}/download`);
    return response.data;
  },

  // Remover imagem
  remover: async (id: number): Promise<void> => {
    await api.delete(`/api/imagens/${id}`);
  },
};
