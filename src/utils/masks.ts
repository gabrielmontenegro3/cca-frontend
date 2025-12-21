// Máscaras para formatação de campos

export const maskTelefone = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Aplica máscara conforme o tamanho
  if (numbers.length <= 10) {
    // Telefone fixo: (11) 1234-5678
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  } else {
    // Celular: (11) 91234-5678
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }
}

export const maskCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{5})(\d)/, '$1-$2')
}

export const maskCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export const maskCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1-$2')
}

export const unmask = (value: string): string => {
  return value.replace(/\D/g, '')
}



