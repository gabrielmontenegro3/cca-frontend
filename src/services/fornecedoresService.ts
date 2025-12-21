import api from './api';
import { Fornecedor, CriarFornecedorDTO, AtualizarFornecedorDTO } from '../types';
import { normalizarFornecedor, normalizarFornecedores } from '../utils/fornecedorUtils';

export const fornecedoresService = {
  // Listar todos os fornecedores
  listar: async (): Promise<Fornecedor[]> => {
    try {
      const response = await api.get('/fornecedores');
      // ✅ Normalizar IDs
      return normalizarFornecedores(response.data);
    } catch (error: any) {
      console.error('Erro ao listar fornecedores:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar fornecedores');
    }
  },

  // Buscar fornecedor por ID
  buscarPorId: async (id: number): Promise<Fornecedor> => {
    try {
      if (!id) {
        throw new Error('ID do fornecedor é obrigatório');
      }
      const response = await api.get(`/fornecedores/${id}`);
      // ✅ Normalizar ID
      return normalizarFornecedor(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar fornecedor:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar fornecedor');
    }
  },

  // Criar fornecedor
  criar: async (dados: CriarFornecedorDTO): Promise<Fornecedor> => {
    try {
      if (!dados.nome_fantasia || !dados.nome_fantasia.trim()) {
        throw new Error('nome_fantasia é obrigatório');
      }

      console.log('➕ POST /fornecedores', dados);
      
      const response = await api.post('/fornecedores', dados);
      
      // ✅ Normalizar ID
      return normalizarFornecedor(response.data);
    } catch (error: any) {
      console.error('Erro ao criar fornecedor:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar fornecedor');
    }
  },

  // Atualizar fornecedor
  atualizar: async (id: number, dados: AtualizarFornecedorDTO): Promise<Fornecedor> => {
    try {
      if (!id || id === 0) {
        throw new Error('ID do fornecedor é obrigatório');
      }

      // CRÍTICO: Remover campos que não devem ser enviados
      const { id_fornecedor, id: fornecedorId, nome, telefone, email, ...dadosSemRelacionados } = dados as any;

      console.log('🔄 PUT /fornecedores/' + id, dadosSemRelacionados);
      
      const response = await api.put(`/fornecedores/${id}`, dadosSemRelacionados);
      
      // ✅ Normalizar ID
      return normalizarFornecedor(response.data);
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

      console.log('🗑️ DELETE /fornecedores/' + id);
      await api.delete(`/fornecedores/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover fornecedor:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover fornecedor');
    }
  },
};






