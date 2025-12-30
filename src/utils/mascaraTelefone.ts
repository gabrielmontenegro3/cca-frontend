/**
 * Aplica máscara de telefone brasileiro
 * Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatarTelefone(value: string): string {
  // Remove tudo que não é número
  const numeros = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (máximo para celular brasileiro)
  const numerosLimitados = numeros.slice(0, 11);
  
  // Aplica máscara baseada no tamanho
  if (numerosLimitados.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return numerosLimitados.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, ddd, parte1, parte2) => {
      if (parte2) {
        return `(${ddd}) ${parte1}-${parte2}`;
      } else if (parte1) {
        return `(${ddd}) ${parte1}`;
      } else if (ddd) {
        return `(${ddd}`;
      }
      return match;
    });
  } else {
    // Celular: (XX) XXXXX-XXXX
    return numerosLimitados.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

/**
 * Remove a máscara do telefone, retornando apenas números
 */
export function removerMascaraTelefone(value: string): string {
  return value.replace(/\D/g, '');
}

