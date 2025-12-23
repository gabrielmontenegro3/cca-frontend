import api from './api';
import { Garantia, CriarGarantiaDTO, AtualizarGarantiaDTO } from '../types';
import { normalizarGarantia, normalizarGarantias } from '../utils/garantiaUtils';

export interface FiltrosGarantias {
  id_unidade?: number;
  id_produto?: number;
}

export const garantiasService = {
  // Listar todas as garantias
  listar: async (filtros?: FiltrosGarantias): Promise<Garantia[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.id_unidade) {
        params.append('id_unidade', filtros.id_unidade.toString());
      }
      if (filtros?.id_produto) {
        params.append('id_produto', filtros.id_produto.toString());
      }

      const url = `/garantias${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      
      // ✅ Normalizar IDs
      return normalizarGarantias(response.data);
    } catch (error: any) {
      console.error('Erro ao listar garantias:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar garantias');
    }
  },

  // Buscar garantia por ID
  buscarPorId: async (id: number): Promise<Garantia> => {
    try {
      if (!id) {
        throw new Error('ID da garantia é obrigatório');
      }
      const response = await api.get(`/garantias/${id}`);
      
      // ✅ Normalizar ID
      return normalizarGarantia(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar garantia:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar garantia');
    }
  },

  // Criar garantia
  criar: async (dados: CriarGarantiaDTO): Promise<Garantia> => {
    try {
      if (!dados.id_unidade || !dados.id_produto) {
        throw new Error('id_unidade e id_produto são obrigatórios');
      }

      console.log('➕ POST /garantias', dados);
      
      const response = await api.post('/api/garantias', dados);
      
      // ✅ Normalizar ID
      return normalizarGarantia(response.data);
    } catch (error: any) {
      console.error('Erro ao criar garantia:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar garantia');
    }
  },

  // Atualizar garantia
  atualizar: async (id: number, dados: AtualizarGarantiaDTO): Promise<Garantia> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID da garantia é obrigatório');
      }

      console.log('🔄 PUT /garantias/' + id, dados);
      
      const response = await api.put(`/garantias/${id}`, dados);
      
      // ✅ Normalizar ID
      return normalizarGarantia(response.data);
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

      await api.delete(`/api/garantias/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover garantia:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover garantia');
    }
  },
};





