import api from './api';
import { GarantiaNovo, CriarGarantiaNovoDTO, AtualizarGarantiaNovoDTO } from '../types';

export interface FiltrosGarantiasNovo {
  produto_id?: number;
  local_id?: number;
  fornecedor_id?: number;
}

export const garantiasNovoService = {
  // Listar todas as garantias (com produto, local, fornecedor)
  listar: async (filtros?: FiltrosGarantiasNovo): Promise<GarantiaNovo[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.produto_id) {
        params.append('produto_id', filtros.produto_id.toString());
      }
      if (filtros?.local_id) {
        params.append('local_id', filtros.local_id.toString());
      }
      if (filtros?.fornecedor_id) {
        params.append('fornecedor_id', filtros.fornecedor_id.toString());
      }

      const url = `/garantias-novo${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar garantias:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar garantias');
    }
  },

  // Buscar garantia por ID
  buscarPorId: async (id: number): Promise<GarantiaNovo> => {
    try {
      if (!id) {
        throw new Error('ID da garantia é obrigatório');
      }
      const response = await api.get(`/garantias-novo/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar garantia:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar garantia');
    }
  },

  // Criar garantia
  criar: async (dados: CriarGarantiaNovoDTO): Promise<GarantiaNovo> => {
    try {
      const response = await api.post('/garantias-novo', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar garantia:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar garantia');
    }
  },

  // Atualizar garantia
  atualizar: async (id: number, dados: AtualizarGarantiaNovoDTO): Promise<GarantiaNovo> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID da garantia é obrigatório');
      }

      const response = await api.put(`/garantias-novo/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar garantia:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar garantia');
    }
  },

  // Remover garantia
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID da garantia é obrigatório');
      }

      await api.delete(`/garantias-novo/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover garantia:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover garantia');
    }
  },
};




