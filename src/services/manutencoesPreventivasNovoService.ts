import api from './api';
import { ManutencaoPreventiva, CriarManutencaoPreventivaDTO, AtualizarManutencaoPreventivaDTO } from '../types';

export interface FiltrosManutencoesPreventivas {
  local_id?: number;
  produto_id?: number;
}

export const manutencoesPreventivasNovoService = {
  // Listar todas as manutenções (com local e produto)
  listar: async (filtros?: FiltrosManutencoesPreventivas): Promise<ManutencaoPreventiva[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.local_id) {
        params.append('local_id', filtros.local_id.toString());
      }
      if (filtros?.produto_id) {
        params.append('produto_id', filtros.produto_id.toString());
      }

      const url = `/api/manutencoes-preventivas-novo${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar manutenções:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar manutenções');
    }
  },

  // Buscar manutenção por ID
  buscarPorId: async (id: number): Promise<ManutencaoPreventiva> => {
    try {
      if (!id) {
        throw new Error('ID da manutenção é obrigatório');
      }
      const response = await api.get(`/api/manutencoes-preventivas-novo/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar manutenção:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar manutenção');
    }
  },

  // Criar manutenção
  criar: async (dados: CriarManutencaoPreventivaDTO): Promise<ManutencaoPreventiva> => {
    try {
      const response = await api.post('/api/manutencoes-preventivas-novo', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar manutenção:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar manutenção');
    }
  },

  // Atualizar manutenção
  atualizar: async (id: number, dados: AtualizarManutencaoPreventivaDTO): Promise<ManutencaoPreventiva> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID da manutenção é obrigatório');
      }

      const response = await api.put(`/api/manutencoes-preventivas-novo/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar manutenção:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar manutenção');
    }
  },

  // Remover manutenção
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID da manutenção é obrigatório');
      }

      await api.delete(`/api/manutencoes-preventivas-novo/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover manutenção:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover manutenção');
    }
  },
};




