import api from './api';
import { FornecedorProduto, CriarFornecedorProdutoDTO, AtualizarFornecedorProdutoDTO } from '../types';

export interface FiltrosFornecedorProdutos {
  fornecedor_id?: number;
  produto_id?: number;
}

export const fornecedorProdutosService = {
  // Listar todas as associações (com fornecedor e produto)
  listar: async (filtros?: FiltrosFornecedorProdutos): Promise<FornecedorProduto[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.fornecedor_id) {
        params.append('fornecedor_id', filtros.fornecedor_id.toString());
      }
      if (filtros?.produto_id) {
        params.append('produto_id', filtros.produto_id.toString());
      }

      const url = `/fornecedor-produtos${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar associações:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar associações');
    }
  },

  // Criar associação
  criar: async (dados: CriarFornecedorProdutoDTO): Promise<FornecedorProduto> => {
    try {
      if (!dados.fornecedor_id) {
        throw new Error('fornecedor_id é obrigatório');
      }
      if (!dados.produto_id) {
        throw new Error('produto_id é obrigatório');
      }

      const response = await api.post('/api/fornecedor-produtos', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar associação:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar associação');
    }
  },

  // Atualizar associação
  atualizar: async (fornecedor_id: number, produto_id: number, dados: AtualizarFornecedorProdutoDTO): Promise<FornecedorProduto> => {
    try {
      if (!fornecedor_id || fornecedor_id === 0) {
        throw new Error('fornecedor_id é obrigatório');
      }
      if (!produto_id || produto_id === 0) {
        throw new Error('produto_id é obrigatório');
      }

      const response = await api.put(`/fornecedor-produtos/${fornecedor_id}/${produto_id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar associação:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar associação');
    }
  },

  // Remover associação
  remover: async (fornecedor_id: number, produto_id: number): Promise<void> => {
    try {
      if (!fornecedor_id || fornecedor_id === 0) {
        throw new Error('fornecedor_id é obrigatório');
      }
      if (!produto_id || produto_id === 0) {
        throw new Error('produto_id é obrigatório');
      }

      await api.delete(`/api/fornecedor-produtos/${fornecedor_id}/${produto_id}`);
    } catch (error: any) {
      console.error('Erro ao remover associação:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover associação');
    }
  },
};




