import api from './api';
import { PreventivoArquivo, CriarPreventivoArquivoDTO, AtualizarPreventivoArquivoDTO } from '../types';

export interface FiltrosPreventivoArquivos {
  preventivo_id?: number;
  tipo?: string;
}

export const preventivoArquivosService = {
  // Listar todos os arquivos
  listar: async (filtros?: FiltrosPreventivoArquivos): Promise<PreventivoArquivo[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.preventivo_id) {
        params.append('preventivo_id', filtros.preventivo_id.toString());
      }
      if (filtros?.tipo) {
        params.append('tipo', filtros.tipo);
      }

      const url = `/preventivo-arquivos${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar arquivos:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar arquivos');
    }
  },

  // Buscar arquivo por ID
  buscarPorId: async (id: number): Promise<PreventivoArquivo> => {
    try {
      if (!id) {
        throw new Error('ID do arquivo é obrigatório');
      }
      const response = await api.get(`/preventivo-arquivos/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar arquivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar arquivo');
    }
  },

  // Criar arquivo
  criar: async (dados: CriarPreventivoArquivoDTO): Promise<PreventivoArquivo> => {
    try {
      if (!dados.preventivo_id) {
        throw new Error('preventivo_id é obrigatório');
      }
      if (!dados.tipo || !dados.tipo.trim()) {
        throw new Error('tipo é obrigatório');
      }
      if (!dados.arquivo || !dados.arquivo.trim()) {
        throw new Error('arquivo é obrigatório');
      }

      const response = await api.post('/preventivo-arquivos', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar arquivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar arquivo');
    }
  },

  // Atualizar arquivo
  atualizar: async (id: number, dados: AtualizarPreventivoArquivoDTO): Promise<PreventivoArquivo> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do arquivo é obrigatório');
      }

      const response = await api.put(`/preventivo-arquivos/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar arquivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar arquivo');
    }
  },

  // Remover arquivo
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do arquivo é obrigatório');
      }

      await api.delete(`/preventivo-arquivos/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover arquivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover arquivo');
    }
  },
};




