import api from './api';
import { ProdutoNovo, CriarProdutoNovoDTO, AtualizarProdutoNovoDTO } from '../types';

export interface FiltrosProdutosNovo {
  fornecedor_id?: number;
}

export const produtosNovoService = {
  // Listar todos os produtos (com fornecedor e locais)
  listar: async (filtros?: FiltrosProdutosNovo): Promise<ProdutoNovo[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros?.fornecedor_id) {
        params.append('fornecedor_id', filtros.fornecedor_id.toString());
      }

      const url = `/api/produtos-novo${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar produtos:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar produtos');
    }
  },

  // Buscar produto por ID (com dados relacionados)
  buscarPorId: async (id: number): Promise<ProdutoNovo> => {
    try {
      if (!id) {
        throw new Error('ID do produto é obrigatório');
      }
      const response = await api.get(`/api/produtos-novo/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar produto:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar produto');
    }
  },

  // Criar produto
  criar: async (dados: CriarProdutoNovoDTO): Promise<ProdutoNovo> => {
    try {
      if (!dados.nome || !dados.nome.trim()) {
        throw new Error('nome é obrigatório');
      }

      const response = await api.post('/api/produtos-novo', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar produto');
    }
  },

  // Atualizar produto
  atualizar: async (id: number, dados: AtualizarProdutoNovoDTO): Promise<ProdutoNovo> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do produto é obrigatório');
      }

      const response = await api.put(`/api/produtos-novo/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar produto');
    }
  },

  // Remover produto
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do produto é obrigatório');
      }

      await api.delete(`/api/produtos-novo/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover produto:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover produto');
    }
  },
};




