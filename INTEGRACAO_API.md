# 🔌 Integração com a API - Front-end CCA

Este documento descreve como o front-end está integrado com a API do backend.

## 📁 Estrutura de Arquivos

### Configuração
- `src/config/api.ts` - URL base da API (`http://localhost:3000/api`)

### Tipos TypeScript
- `src/types/index.ts` - Todas as interfaces TypeScript para as entidades da API

### Serviços (Services)
- `src/services/api.ts` - Cliente HTTP base (Axios) com interceptors
- `src/services/produtosService.ts` - Serviços para produtos
- `src/services/fornecedoresService.ts` - Serviços para fornecedores
- `src/services/contatosService.ts` - Serviços para contatos
- `src/services/empreendimentosService.ts` - Serviços para empreendimentos
- `src/services/unidadesService.ts` - Serviços para unidades e produtos da unidade
- `src/services/chamadosService.ts` - Serviços para chamados
- `src/services/dashboardService.ts` - Serviços para dashboard

## 🎯 Páginas Integradas

### ✅ Visão Geral (Dashboard)
- **Arquivo:** `src/pages/VisaoGeral.tsx`
- **Serviço:** `dashboardService.obter()`
- **Funcionalidades:**
  - Exibe estatísticas gerais (unidades, garantias, chamados)
  - Lista próximos preventivos
  - Estados de loading e erro implementados

### ✅ Produtos
- **Arquivo:** `src/pages/Produtos.tsx`
- **Serviço:** `produtosService.listar()`
- **Funcionalidades:**
  - Lista todos os produtos cadastrados
  - Exibe informações de garantia e preventivos
  - Estados de loading e erro implementados

### ✅ Fornecedores
- **Arquivo:** `src/pages/Fornecedores.tsx`
- **Serviço:** `fornecedoresService.listar()`
- **Funcionalidades:**
  - Lista todos os fornecedores
  - Exibe informações de contato
  - Estados de loading e erro implementados

### ✅ Contatos
- **Arquivo:** `src/pages/Contatos.tsx`
- **Serviço:** `contatosService.listar()`
- **Funcionalidades:**
  - Lista todos os contatos
  - Filtra por tipo (síndico, fornecedor, outro)
  - Estados de loading e erro implementados

### ✅ Garantias
- **Arquivo:** `src/pages/Garantias.tsx`
- **Serviço:** `unidadesService.listarProdutos(idUnidade)`
- **Funcionalidades:**
  - Lista produtos da unidade com cálculos de garantia
  - Exibe status de garantia ABNT e Fábrica
  - Estados de loading e erro implementados

### ✅ Assistência Técnica (Chamados)
- **Arquivo:** `src/pages/AssistenciaTecnica.tsx`
- **Serviços:** 
  - `chamadosService.listar()` - Lista chamados
  - `chamadosService.criar()` - Cria novo chamado
  - `unidadesService.listar()` - Lista unidades para seleção
  - `produtosService.listar()` - Lista produtos para seleção
- **Funcionalidades:**
  - Formulário para criar novos chamados
  - Lista de chamados anteriores
  - Validação automática de garantia (feita pelo backend)
  - Estados de loading e erro implementados

### ✅ Preventivos
- **Arquivo:** `src/pages/Preventivos.tsx`
- **Serviço:** `dashboardService.obter()` (usa `proximos_preventivos`)
- **Funcionalidades:**
  - Lista próximos preventivos baseados na frequência
  - Exibe unidade, produto e data prevista
  - Estados de loading e erro implementados

### ✅ Empreendimento
- **Arquivo:** `src/pages/Empreendimento.tsx`
- **Serviço:** `empreendimentosService.listar()`
- **Funcionalidades:**
  - Exibe informações do empreendimento
  - Lista unidades do empreendimento
  - Exibe contato do síndico
  - Estados de loading e erro implementados

### ✅ Meu Imóvel
- **Arquivo:** `src/pages/MeuImovel.tsx`
- **Serviços:**
  - `unidadesService.listar()` - Busca unidades
  - `empreendimentosService.buscarPorId()` - Busca empreendimento
- **Funcionalidades:**
  - Exibe informações da unidade
  - Exibe informações do empreendimento
  - Estados de loading e erro implementados

## 🔧 Como Usar os Serviços

### Exemplo: Listar Produtos

```typescript
import { produtosService } from '../services/produtosService'
import { useState, useEffect } from 'react'

const MinhaComponente = () => {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setLoading(true)
        const dados = await produtosService.listar()
        setProdutos(dados)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [])

  // ... renderizar dados
}
```

### Exemplo: Criar Chamado

```typescript
import { chamadosService } from '../services/chamadosService'

const criarChamado = async () => {
  try {
    const novoChamado = await chamadosService.criar({
      id_unidade: 1,
      id_produto: 1,
      tipo_chamado: 'MANUTENCAO',
      descricao: 'Descrição do problema',
      status: 'ABERTO'
    })
    console.log('Chamado criado:', novoChamado)
  } catch (error) {
    console.error('Erro ao criar chamado:', error)
  }
}
```

## ⚠️ Tratamento de Erros

Todos os serviços têm tratamento de erro integrado através do interceptor do Axios em `src/services/api.ts`. Os erros são capturados e exibidos nas páginas.

### Tipos de Erro

1. **Erro de Rede:** Quando o servidor não está rodando ou há problema de conexão
2. **Erro de Validação:** Quando os dados enviados são inválidos (400)
3. **Erro de Recurso Não Encontrado:** Quando o ID não existe (404)
4. **Erro do Servidor:** Erros internos do servidor (500)

## 🚀 Como Testar

1. **Inicie o servidor backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Inicie o front-end:**
   ```bash
   npm run dev
   ```

3. **Acesse:** `http://localhost:5173` (ou a porta que o Vite usar)

4. **Verifique se a API está respondendo:**
   - Acesse `http://localhost:3000/health` no navegador
   - Deve retornar uma resposta de sucesso

## 📝 Notas Importantes

1. **URL da API:** A URL base está configurada em `src/config/api.ts`. Se precisar mudar, edite esse arquivo.

2. **CORS:** Certifique-se de que o backend está configurado para aceitar requisições do front-end (CORS).

3. **Estados de Loading:** Todas as páginas implementam estados de loading para melhor UX.

4. **Tratamento de Erros:** Todas as páginas exibem mensagens de erro amigáveis quando algo dá errado.

5. **Validação de Garantia:** A validação de garantia é feita automaticamente pelo backend ao criar um chamado.

6. **Cálculo de Garantias:** Os cálculos de garantia são feitos no backend. O front-end apenas exibe os dados.

## 🔄 Próximos Passos (Melhorias Futuras)

- [ ] Adicionar seleção de unidade na página de Garantias
- [ ] Adicionar seleção de empreendimento na página de Empreendimento
- [ ] Implementar paginação nas listas
- [ ] Adicionar filtros avançados
- [ ] Implementar cache de dados
- [ ] Adicionar refresh automático de dados
- [ ] Implementar notificações em tempo real
- [ ] Adicionar testes unitários para os serviços

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o servidor backend está rodando
2. Verifique a URL da API em `src/config/api.ts`
3. Verifique o console do navegador para erros
4. Verifique a resposta da API usando as ferramentas de desenvolvedor

---

**Última atualização:** Janeiro 2024






