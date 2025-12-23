import api from './api';
import { Produto, CriarProdutoDTO, AtualizarProdutoDTO } from '../types';
import { normalizarProdutos, normalizarProduto } from '../utils/produtoUtils';

export const produtosService = {
  // Listar todos os produtos
  listar: async (): Promise<Produto[]> => {
    try {
      const response = await api.get('/api/produtos');
      // ✅ NORMALIZAR: Mapear id_produto para id
      return normalizarProdutos(response.data);
    } catch (error: any) {
      console.error('Erro ao listar produtos:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao listar produtos');
    }
  },

  // Buscar produto por ID
  buscarPorId: async (id: number): Promise<Produto> => {
    try {
      if (!id) {
        throw new Error('ID do produto é obrigatório');
      }
      const response = await api.get(`/api/produtos/${id}`);
      // ✅ NORMALIZAR: Mapear id_produto para id
      return normalizarProduto(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar produto:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar produto');
    }
  },

  // Criar produto
  criar: async (dados: CriarProdutoDTO): Promise<Produto> => {
    try {
      // Garantir que não há ID no objeto
      const { id: _, id_produto: __, fornecedor: ___, ...dadosSemRelacionados } = dados as any;
      
      // Debug detalhado
      console.log('➕ POST Request - Criar Produto:')
      console.log('  - URL: /produtos')
      console.log('  - Method: POST')
      console.log('  - Body:', dadosSemRelacionados)
      console.log('  - ID foi removido do body?', !dadosSemRelacionados.id ? 'SIM ✅' : 'NÃO ❌')
      
      // ✅ DEVE SER POST para criar
      const response = await api.post('/api/produtos', dadosSemRelacionados);
      
      console.log('✅ POST Response:', response.data)
      // ✅ NORMALIZAR: Mapear id_produto para id
      return normalizarProduto(response.data);
    } catch (error: any) {
      console.error('❌ Erro ao criar produto:', error)
      throw new Error(error.response?.data?.error || error.message || 'Erro ao criar produto');
    }
  },

  // Atualizar produto
  atualizar: async (id: number, dados: AtualizarProdutoDTO): Promise<Produto> => {
    try {
      // ✅ VALIDAÇÃO CRÍTICA DO ID
      if (!id || id === 0 || id === null || id === undefined) {
        console.error('❌ ERRO: ID inválido para atualização:', id)
        throw new Error('ID do produto é obrigatório e deve ser um número válido');
      }
      
      if (typeof id !== 'number') {
        console.error('❌ ERRO: ID não é um número:', id, typeof id)
        throw new Error('ID do produto deve ser um número');
      }
      
      // CRÍTICO: Remover campos que não devem ser enviados
      const { id: produtoId, id_produto: __, fornecedor: ___, ...dadosSemRelacionados } = dados as any;
      
      // ✅ CONSTRUIR URL COM ID
      const url = `/api/produtos/${id}`;
      
      // Debug detalhado
      console.log('🔄 PUT Request - Atualizar Produto:')
      console.log('  - URL:', url)
      console.log('  - Method: PUT')
      console.log('  - ID na URL:', id)
      console.log('  - Body (sem ID e relacionados):', dadosSemRelacionados)
      console.log('  - ID foi removido do body?', !dadosSemRelacionados.id ? 'SIM ✅' : 'NÃO ❌')
      
      // ✅ DEVE SER PUT, NÃO POST!
      const response = await api.put(url, dadosSemRelacionados);
      
      console.log('✅ PUT Response:', response.data)
      // ✅ NORMALIZAR: Mapear id_produto para id
      return normalizarProduto(response.data);
    } catch (error: any) {
      console.error('❌ Erro ao atualizar produto:', error)
      console.error('  - ID usado:', id)
      console.error('  - Erro completo:', error.response || error)
      throw new Error(error.response?.data?.error || error.message || 'Erro ao atualizar produto');
    }
  },

  // Remover produto
  remover: async (id: number): Promise<void> => {
    try {
      if (!id) {
        throw new Error('ID do produto é obrigatório');
      }
      
      await api.delete(`/api/produtos/${id}`);
    } catch (error: any) {
      console.error('Erro ao remover produto:', error);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao remover produto');
    }
  },
};






