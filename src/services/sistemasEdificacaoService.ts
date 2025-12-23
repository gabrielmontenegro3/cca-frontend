import api from './api';
import { SistemaEdificacao, CriarSistemaEdificacaoDTO, AtualizarSistemaEdificacaoDTO } from '../types';

export interface FiltrosSistemasEdificacao {
  exigencia?: string;
}

export const sistemasEdificacaoService = {
  // Listar todos os sistemas (com garantias relacionadas)
  listar: async (filtros?: FiltrosSistemasEdificacao): Promise<SistemaEdificacao[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.exigencia) {
        params.append('exigencia', filtros.exigencia);
      }

      const url = `/api/sistemas-edificacao${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar sistemas:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar sistemas');
    }
  },

  // Buscar sistema por ID
  buscarPorId: async (id: number): Promise<SistemaEdificacao> => {
    try {
      if (!id) {
        throw new Error('ID do sistema é obrigatório');
      }
      const response = await api.get(`/sistemas-edificacao/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar sistema:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar sistema');
    }
  },

  // Criar sistema
  criar: async (dados: CriarSistemaEdificacaoDTO): Promise<SistemaEdificacao> => {
    try {
      if (!dados.titulo || !dados.titulo.trim()) {
        throw new Error('titulo é obrigatório');
      }

      const response = await api.post('/api/sistemas-edificacao', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar sistema:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar sistema');
    }
  },

  // Atualizar sistema
  atualizar: async (id: number, dados: AtualizarSistemaEdificacaoDTO): Promise<SistemaEdificacao> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do sistema é obrigatório');
      }

      const response = await api.put(`/sistemas-edificacao/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar sistema:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar sistema');
    }
  },

  // Remover sistema
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do sistema é obrigatório');
      }

      await api.delete(`/api/sistemas-edificacao/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover sistema:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover sistema');
    }
  },
};




