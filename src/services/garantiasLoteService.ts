import api from './api';
import { GarantiaLote, CriarGarantiaLoteDTO, AtualizarGarantiaLoteDTO } from '../types';
import { normalizarGarantiaLote, normalizarGarantiasLote } from '../utils/garantiaLoteUtils';

export const garantiasLoteService = {
  // Listar todas as garantias lote (com filtros opcionais)
  listar: async (filtros?: {
    id_produto?: number;
    id_fornecedor?: number;
    id_contato?: number;
  }): Promise<GarantiaLote[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.id_produto) {
        params.append('id_produto', filtros.id_produto.toString());
      }
      if (filtros?.id_fornecedor) {
        params.append('id_fornecedor', filtros.id_fornecedor.toString());
      }
      if (filtros?.id_contato) {
        params.append('id_contato', filtros.id_contato.toString());
      }

      const queryString = params.toString();
      const url = `/garantia-lote${queryString ? '?' + queryString : ''}`;
      
      console.log('📋 GET', url);
      const response = await api.get(url);
      
      // ✅ Normalizar IDs
      return normalizarGarantiasLote(response.data);
    } catch (error: any) {
      console.error('Erro ao listar garantias lote:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar garantias lote');
    }
  },

  // Buscar garantia lote por ID
  buscarPorId: async (id: number): Promise<GarantiaLote> => {
    try {
      if (!id) {
        throw new Error('ID da garantia lote é obrigatório');
      }
      console.log('🔍 GET /garantia-lote/' + id);
      const response = await api.get(`/api/garantia-lote/${id}`);
      // ✅ Normalizar ID
      return normalizarGarantiaLote(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar garantia lote:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar garantia lote');
    }
  },

  // Criar garantia lote
  criar: async (dados: CriarGarantiaLoteDTO): Promise<GarantiaLote> => {
    try {
      if (!dados.id_produto || !dados.data_compra) {
        throw new Error('id_produto e data_compra são obrigatórios');
      }

      console.log('➕ POST /garantia-lote', dados);
      
      const response = await api.post('/api/garantia-lote', dados);
      
      // ✅ Normalizar ID
      return normalizarGarantiaLote(response.data);
    } catch (error: any) {
      console.error('Erro ao criar garantia lote:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar garantia lote');
    }
  },

  // Atualizar garantia lote
  atualizar: async (id: number, dados: AtualizarGarantiaLoteDTO): Promise<GarantiaLote> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID da garantia lote é obrigatório');
      }

      // CRÍTICO: Remover campos que não devem ser enviados
      const { id_garantia_lote, produto, fornecedor, contato_suporte, ...dadosSemRelacionados } = dados as any;

      console.log('🔄 PUT /garantia-lote/' + id, dadosSemRelacionados);
      
      const response = await api.put(`/api/garantia-lote/${id}`, dadosSemRelacionados);
      
      // ✅ Normalizar ID
      return normalizarGarantiaLote(response.data);
    } catch (error: any) {
      console.error('Erro ao atualizar garantia lote:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar garantia lote');
    }
  },

  // Remover garantia lote
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID da garantia lote é obrigatório');
      }

      console.log('🗑️ DELETE /garantia-lote/' + id);
      await api.delete(`/api/garantia-lote/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover garantia lote:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover garantia lote');
    }
  },
};





