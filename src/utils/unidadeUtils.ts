import { Unidade } from '../types';

/**
 * Normaliza uma unidade do banco de dados
 * Garante que o campo `numero` sempre exista, mapeando de `numero_unidade` se necessário
 * @param unidade - Unidade do banco de dados (pode ter `numero` ou `numero_unidade`)
 * @returns Unidade normalizada com campo `numero` garantido
 */
export const normalizarUnidade = (unidade: any): Unidade => {
  if (!unidade) {
    throw new Error('Unidade não pode ser nula ou indefinida');
  }

  // Se já tem `numero`, retorna como está
  if (unidade.numero) {
    return {
      ...unidade,
      id: unidade.id || unidade.id_unidade,
      numero: unidade.numero,
      numero_unidade: unidade.numero_unidade || unidade.numero, // Mantém ambos para compatibilidade
      id_empreendimento: unidade.id_empreendimento,
      data_instalacao: unidade.data_instalacao
    };
  }

  // Se tem `numero_unidade`, mapeia para `numero`
  if (unidade.numero_unidade) {
    return {
      ...unidade,
      id: unidade.id || unidade.id_unidade,
      numero: unidade.numero_unidade, // ✅ Mapeia numero_unidade para numero
      numero_unidade: unidade.numero_unidade, // Mantém original também
      id_empreendimento: unidade.id_empreendimento,
      data_instalacao: unidade.data_instalacao
    };
  }

  // Se não tem nenhum, usa ID como fallback
  return {
    ...unidade,
    id: unidade.id || unidade.id_unidade,
    numero: `Unidade ${unidade.id || unidade.id_unidade}`, // Fallback: usa ID
    id_empreendimento: unidade.id_empreendimento,
    data_instalacao: unidade.data_instalacao
  };
};

/**
 * Normaliza um array de unidades
 * @param unidades - Array de unidades do banco
 * @returns Array de unidades normalizadas
 */
export const normalizarUnidades = (unidades: any[]): Unidade[] => {
  return unidades.map(normalizarUnidade);
};





