import api from './api';
import { FornecedorNovo, CriarFornecedorNovoDTO, AtualizarFornecedorNovoDTO } from '../types';

export const fornecedoresNovoService = {
  // Listar todos os fornecedores
  listar: async (): Promise<FornecedorNovo[]> => {
    try {
      const response = await api.get('/api/fornecedores-novo');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar fornecedores:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar fornecedores');
    }
  },

  // Buscar fornecedor por ID
  buscarPorId: async (id: number): Promise<FornecedorNovo> => {
    try {
      if (!id) {
        throw new Error('ID do fornecedor é obrigatório');
      }
      const response = await api.get(`/api/fornecedores-novo/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar fornecedor:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar fornecedor');
    }
  },

  // Criar fornecedor
  criar: async (dados: CriarFornecedorNovoDTO): Promise<FornecedorNovo> => {
    try {
      if (!dados.nome || !dados.nome.trim()) {
        throw new Error('nome é obrigatório');
      }

      const response = await api.post('/api/fornecedores-novo', dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar fornecedor:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar fornecedor');
    }
  },

  // Atualizar fornecedor
  atualizar: async (id: number, dados: AtualizarFornecedorNovoDTO): Promise<FornecedorNovo> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do fornecedor é obrigatório');
      }

      const response = await api.put(`/api/fornecedores-novo/${id}`, dados);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar fornecedor');
    }
  },

  // Remover fornecedor
  remover: async (id: number): Promise<void> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do fornecedor é obrigatório');
      }

      await api.delete(`/api/fornecedores-novo/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover fornecedor:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover fornecedor');
    }
  },
};




