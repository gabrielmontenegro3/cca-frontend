import api from './api';
import { Unidade, ProdutoUnidade, FiltrosUnidades } from '../types';
import { normalizarUnidades, normalizarUnidade } from '../utils/unidadeUtils';

export const unidadesService = {
  // Listar unidades (com filtro opcional)
  listar: async (filtros?: FiltrosUnidades): Promise<Unidade[]> => {
    const params = new URLSearchParams();
    if (filtros?.id_empreendimento) {
      params.append('id_empreendimento', filtros.id_empreendimento.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/unidades?${queryString}` : '/api/unidades';
    const response = await api.get(url);
    // ✅ NORMALIZAR: Garantir que todas as unidades tenham o campo `numero`
    return normalizarUnidades(response.data);
  },

  // Buscar unidade por ID
  buscarPorId: async (id: number): Promise<Unidade> => {
    const response = await api.get(`/api/unidades/${id}`);
    // ✅ NORMALIZAR: Garantir que a unidade tenha o campo `numero`
    return normalizarUnidade(response.data);
  },

  // Criar unidade
  criar: async (unidade: Omit<Unidade, 'id'>): Promise<Unidade> => {
    const response = await api.post('/api/unidades', unidade);
    // ✅ NORMALIZAR: Garantir que a unidade retornada tenha o campo `numero`
    return normalizarUnidade(response.data);
  },

  // Atualizar unidade
  atualizar: async (id: number, unidade: Partial<Unidade>): Promise<Unidade> => {
    const response = await api.put(`/api/unidades/${id}`, unidade);
    // ✅ NORMALIZAR: Garantir que a unidade retornada tenha o campo `numero`
    return normalizarUnidade(response.data);
  },

  // Listar produtos da unidade (com cálculos de garantia)
  listarProdutos: async (idUnidade: number): Promise<ProdutoUnidade[]> => {
    const response = await api.get(`/unidades/${idUnidade}/produtos`);
    return response.data;
  },

  // Adicionar produto à unidade
  adicionarProduto: async (
    idUnidade: number,
    dados: { id_produto: number; data_instalacao?: string }
  ): Promise<ProdutoUnidade> => {
    const response = await api.post(`/api/unidades/${idUnidade}/produtos`, dados);
    return response.data;
  },
};






