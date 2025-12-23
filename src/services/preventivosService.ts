import api from './api';
import { Preventivo, CriarPreventivoDTO, AtualizarPreventivoDTO } from '../types';

export interface FiltrosPreventivos {
  produto_id?: number;
  local_id?: number;
  status?: string;
}

export const preventivosService = {
  // Listar todos os preventivos (com produto, local, arquivos)
  listar: async (filtros?: FiltrosPreventivos): Promise<Preventivo[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.produto_id) {
        params.append('produto_id', filtros.produto_id.toString());
      }
      if (filtros?.local_id) {
        params.append('local_id', filtros.local_id.toString());
      }
      if (filtros?.status) {
        params.append('status', filtros.status);
      }

      const url = `/api/preventivos${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar preventivos:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar preventivos');
    }
  },

  // Buscar preventivo por ID
  buscarPorId: async (id: number): Promise<Preventivo> => {
    try {
      if (!id) {
        throw new Error('ID do preventivo é obrigatório');
      }
      const response = await api.get(`/preventivos/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar preventivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar preventivo');
    }
  },

  // Criar preventivo
  criar: async (dados: CriarPreventivoDTO): Promise<Preventivo> => {
    try {
      const response = await api.post('/api/preventivos', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar preventivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar preventivo');
    }
  },

  // Atualizar preventivo
  atualizar: async (id: number, dados: AtualizarPreventivoDTO): Promise<Preventivo> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do preventivo é obrigatório');
      }

      const response = await api.put(`/preventivos/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar preventivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar preventivo');
    }
  },

  // Remover preventivo
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do preventivo é obrigatório');
      }

      await api.delete(`/api/preventivos/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover preventivo:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover preventivo');
    }
  },
};




