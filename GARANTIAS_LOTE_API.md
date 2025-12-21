# 📚 Documentação da API - Garantias Lote (Lote de Compra)

## 🎯 Objetivo

Esta documentação descreve como utilizar a API de **Garantias Lote** no front-end. A tabela `Garantia_Lote` registra a aquisição de produtos de fornecedores, vinculando Produto a Fornecedor através de um lote de compra.

---

## 📋 Estrutura de Dados

### Interface GarantiaLote (Resposta da API)

```typescript
export interface GarantiaLote {
  id_garantia_lote: number;
  data_compra: string; // Formato: YYYY-MM-DD
  identificador_garantia: string; // Ex: "GAR-998877"
  tempo_garantia_fabricante: number; // Em meses
  produto: {
    id: number;
    nome: string;
    prazo_abnt: number; // Prazo ABNT em meses
  };
  fornecedor: {
    nome: string;
    cnpj: string;
  };
  contato_suporte: {
    nome: string;
    telefone: string;
  };
}
```

### DTO para Criar Garantia Lote

```typescript
export interface CriarGarantiaLoteDTO {
  id_produto: number;        // ✅ OBRIGATÓRIO
  id_fornecedor: number;     // ✅ OBRIGATÓRIO
  id_contato: number;        // ✅ OBRIGATÓRIO
  data_compra: string;       // Formato: YYYY-MM-DD (opcional, usa data atual se não informado)
  id_garantia: string;       // ✅ OBRIGATÓRIO - Identificador da garantia (Ex: "GAR-998877")
  tempo_garantia_fabricante_meses: number; // ✅ OBRIGATÓRIO - Tempo em meses
}
```

### DTO para Atualizar Garantia Lote

```typescript
export interface AtualizarGarantiaLoteDTO {
  data_compra?: string;      // Opcional
  id_garantia?: string;      // Opcional - Identificador da garantia
  tempo_garantia_fabricante_meses?: number; // Opcional
  id_contato?: number;       // Opcional - Pode alterar o contato de suporte
}
```

**⚠️ IMPORTANTE:** `id_produto` e `id_fornecedor` **NÃO podem ser alterados** após a criação.

---

## 🔌 Endpoints da API

### Base URL
```
http://localhost:3000/api/garantias-lote
```

### 1. Listar Todas as Garantias Lote

**GET** `/api/garantias-lote`

**Resposta (200):**
```json
[
  {
    "id_garantia_lote": 1,
    "data_compra": "2025-12-17",
    "identificador_garantia": "GAR-998877",
    "tempo_garantia_fabricante": 12,
    "produto": {
      "id": 10,
      "nome": "Torneira Monocomando Deca",
      "prazo_abnt": 24
    },
    "fornecedor": {
      "nome": "ConstruShop LTDA",
      "cnpj": "00.000.000/0001-00"
    },
    "contato_suporte": {
      "nome": "Ricardo Técnico",
      "telefone": "(85) 99999-9999"
    }
  }
]
```

### 2. Buscar Garantia Lote por ID

**GET** `/api/garantias-lote/:id`

**Exemplo:**
```
GET /api/garantias-lote/1
```

**Resposta (200):** Mesma estrutura do item da lista acima

**Resposta (404):**
```json
{
  "error": "Garantia lote não encontrada"
}
```

### 3. Criar Garantia Lote

**POST** `/api/garantias-lote`

**Body:**
```json
{
  "id_produto": 10,
  "id_fornecedor": 5,
  "id_contato": 3,
  "data_compra": "2025-12-17",
  "id_garantia": "GAR-998877",
  "tempo_garantia_fabricante_meses": 12
}
```

**Campos obrigatórios:**
- `id_produto` (number)
- `id_fornecedor` (number)
- `id_contato` (number)
- `id_garantia` (string) - **Este campo é mapeado para a coluna `id_garantia` no banco**
- `tempo_garantia_fabricante_meses` (number)

**Campos opcionais:**
- `data_compra` (string, formato YYYY-MM-DD) - Se não informado, usa a data atual

**Resposta (201):**
```json
{
  "id_garantia_lote": 1,
  "data_compra": "2025-12-17",
  "identificador_garantia": "GAR-998877",
  "tempo_garantia_fabricante": 12,
  "produto": { ... },
  "fornecedor": { ... },
  "contato_suporte": { ... }
}
```

**Resposta (400):**
```json
{
  "error": "id_produto e id_fornecedor são obrigatórios"
}
```

**Resposta (409):**
```json
{
  "error": "Já existe uma garantia lote para este produto e fornecedor"
}
```

### 4. Atualizar Garantia Lote

**PUT** `/api/garantias-lote/:id`

**Body:**
```json
{
  "data_compra": "2025-12-20",
  "id_garantia": "GAR-998877-NEW",
  "tempo_garantia_fabricante_meses": 18,
  "id_contato": 4
}
```

**Nota:** `id_produto` e `id_fornecedor` não podem ser alterados após a criação.

**Resposta (200):** Mesma estrutura da criação

**Resposta (404):**
```json
{
  "error": "Garantia lote não encontrada"
}
```

### 5. Excluir Garantia Lote

**DELETE** `/api/garantias-lote/:id`

**Exemplo:**
```
DELETE /api/garantias-lote/1
```

**Resposta (200):**
```json
{
  "message": "Garantia lote removida com sucesso"
}
```

**Resposta (404):**
```json
{
  "error": "Garantia lote não encontrada"
}
```

---

## 🎨 Implementação no Front-end

### ⚠️ IMPORTANTE: Preparação dos Dados

**ANTES de abrir o formulário de cadastro, você DEVE:**

1. **Listar Produtos** - Para popular o dropdown de seleção
2. **Listar Fornecedores** - Para popular o dropdown de seleção
3. **Listar Contatos** - Para popular o dropdown de seleção (opcionalmente filtrar por fornecedor)

### Exemplo de Código:

```typescript
// 1. Carregar dados para os dropdowns
const [produtos, setProdutos] = useState<Produto[]>([])
const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
const [contatos, setContatos] = useState<Contato[]>([])

useEffect(() => {
  const carregarDados = async () => {
    const [produtosData, fornecedoresData, contatosData] = await Promise.all([
      produtosService.listar(),
      fornecedoresService.listar(),
      contatosService.listar()
    ])
    setProdutos(produtosData)
    setFornecedores(fornecedoresData)
    setContatos(contatosData)
  }
  carregarDados()
}, [])
```

### Formulário de Criação:

```typescript
// 2. Criar formulário com dropdowns
<form onSubmit={handleSubmit}>
  {/* Dropdown de Produtos */}
  <select
    value={formData.id_produto}
    onChange={(e) => setFormData({ ...formData, id_produto: e.target.value })}
    required
  >
    <option value="">Selecione um produto...</option>
    {produtos.map((produto) => (
      <option key={produto.id} value={produto.id}>
        {produto.nome_produto} - {produto.codigo_sku}
      </option>
    ))}
  </select>

  {/* Dropdown de Fornecedores */}
  <select
    value={formData.id_fornecedor}
    onChange={(e) => {
      setFormData({ ...formData, id_fornecedor: e.target.value })
      // Filtrar contatos do fornecedor selecionado
      if (e.target.value) {
        contatosService.listar({ id_fornecedor: parseInt(e.target.value) })
          .then(setContatos)
      }
    }}
    required
  >
    <option value="">Selecione um fornecedor...</option>
    {fornecedores.map((fornecedor) => (
      <option key={fornecedor.id} value={fornecedor.id}>
        {fornecedor.nome} - {fornecedor.cnpj}
      </option>
    ))}
  </select>

  {/* Dropdown de Contatos (filtrado por fornecedor) */}
  <select
    value={formData.id_contato}
    onChange={(e) => setFormData({ ...formData, id_contato: e.target.value })}
    required
  >
    <option value="">Selecione um contato...</option>
    {contatos
      .filter(contato => contato.id_fornecedor === parseInt(formData.id_fornecedor))
      .map((contato) => (
        <option key={contato.id} value={contato.id}>
          {contato.nome} - {contato.telefone}
        </option>
      ))}
  </select>

  {/* Campo de Data de Compra */}
  <input
    type="date"
    value={formData.data_compra}
    onChange={(e) => setFormData({ ...formData, data_compra: e.target.value })}
  />

  {/* Campo id_garantia - IMPORTANTE: Este campo é mapeado para id_garantia no banco */}
  <input
    type="text"
    value={formData.id_garantia}
    onChange={(e) => setFormData({ ...formData, id_garantia: e.target.value })}
    placeholder="Ex: GAR-998877"
    required
  />
  <small>
    ⚠️ Este campo será mapeado para a coluna id_garantia no banco de dados
  </small>

  {/* Campo Tempo de Garantia */}
  <input
    type="number"
    value={formData.tempo_garantia_fabricante_meses}
    onChange={(e) => setFormData({ ...formData, tempo_garantia_fabricante_meses: e.target.value })}
    placeholder="Ex: 12"
    min="1"
    required
  />
</form>
```

### Envio dos Dados:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const dados: CriarGarantiaLoteDTO = {
    id_produto: parseInt(formData.id_produto),
    id_fornecedor: parseInt(formData.id_fornecedor),
    id_contato: parseInt(formData.id_contato),
    data_compra: formData.data_compra || new Date().toISOString().split('T')[0],
    id_garantia: formData.id_garantia, // ✅ Este campo vai para id_garantia no banco
    tempo_garantia_fabricante_meses: parseInt(formData.tempo_garantia_fabricante_meses)
  }

  await garantiasLoteService.criar(dados)
}
```

---

## 🔑 Pontos Importantes

### 1. Mapeamento do Campo `id_garantia`

**⚠️ CRÍTICO:** O campo que o usuário digita na tela (`id_garantia` no formulário) **DEVE ser mapeado para a coluna `id_garantia`** no banco de dados.

```typescript
// ✅ CORRETO
{
  id_garantia: "GAR-998877" // Campo do formulário → coluna id_garantia no banco
}

// ❌ ERRADO
{
  identificador_garantia: "GAR-998877" // Não existe esta coluna
}
```

### 2. Validação de IDs

O backend valida se `id_produto` e `id_fornecedor` existem antes de inserir. Se não existirem, retornará erro 400.

### 3. Contatos por Fornecedor

Ao selecionar um fornecedor, filtre os contatos para mostrar apenas os contatos daquele fornecedor:

```typescript
// Filtrar contatos do fornecedor selecionado
const contatosDoFornecedor = contatos.filter(
  contato => contato.id_fornecedor === parseInt(formData.id_fornecedor)
)
```

### 4. Formato de Data

Sempre use o formato `YYYY-MM-DD` para datas:

```typescript
// ✅ CORRETO
"2025-12-17"

// ❌ ERRADO
"17/12/2025"
"2025-12-17T00:00:00Z"
```

---

## 📊 Exemplo de Resposta Completa

```json
[
  {
    "id_garantia_lote": 1,
    "data_compra": "2025-12-17",
    "identificador_garantia": "GAR-998877",
    "tempo_garantia_fabricante": 12,
    "produto": {
      "id": 10,
      "nome": "Torneira Monocomando Deca",
      "prazo_abnt": 24
    },
    "fornecedor": {
      "nome": "ConstruShop LTDA",
      "cnpj": "00.000.000/0001-00"
    },
    "contato_suporte": {
      "nome": "Ricardo Técnico",
      "telefone": "(85) 99999-9999"
    }
  },
  {
    "id_garantia_lote": 2,
    "data_compra": "2025-11-15",
    "identificador_garantia": "GAR-112233",
    "tempo_garantia_fabricante": 18,
    "produto": {
      "id": 15,
      "nome": "Vaso Sanitário",
      "prazo_abnt": 36
    },
    "fornecedor": {
      "nome": "Leroy Merlin",
      "cnpj": "11.111.111/0001-11"
    },
    "contato_suporte": {
      "nome": "Maria Suporte",
      "telefone": "(11) 88888-8888"
    }
  }
]
```

---

## ✅ Checklist de Implementação

### Antes de Implementar:

- [ ] Verificar se o serviço de Produtos está funcionando
- [ ] Verificar se o serviço de Fornecedores está funcionando
- [ ] Verificar se o serviço de Contatos está funcionando
- [ ] Criar serviço `garantiasLoteService.ts`
- [ ] Criar página `GarantiasLote.tsx`

### No Formulário de Criação:

- [ ] Dropdown de Produtos populado
- [ ] Dropdown de Fornecedores populado
- [ ] Dropdown de Contatos filtrado por fornecedor
- [ ] Campo `id_garantia` mapeado corretamente
- [ ] Validação de campos obrigatórios
- [ ] Formato de data correto (YYYY-MM-DD)

### Funcionalidades:

- [ ] Listar garantias lote
- [ ] Criar nova garantia lote
- [ ] Editar garantia lote existente
- [ ] Excluir garantia lote
- [ ] Buscar/filtrar garantias lote
- [ ] Tratamento de erros

---

## 🐛 Troubleshooting

### Erro: "id_produto e id_fornecedor são obrigatórios"
**Causa:** Campos não foram preenchidos ou não foram enviados corretamente.
**Solução:** Verificar se os valores estão sendo convertidos para número: `parseInt(formData.id_produto)`

### Erro: "Já existe uma garantia lote para este produto e fornecedor"
**Causa:** Tentativa de criar duplicata.
**Solução:** Verificar se já existe um lote para aquele produto/fornecedor antes de criar.

### Contatos não aparecem no dropdown
**Causa:** Contatos não foram carregados ou não estão filtrados corretamente.
**Solução:** Verificar se está chamando `contatosService.listar({ id_fornecedor: ... })` após selecionar o fornecedor.

### Campo id_garantia não está sendo salvo
**Causa:** Nome do campo no body não está correto.
**Solução:** Garantir que está enviando `id_garantia` (não `identificador_garantia`).

---

## 📝 Resumo

### Endpoints:
- `GET /api/garantias-lote` - Listar todas
- `GET /api/garantias-lote/:id` - Buscar por ID
- `POST /api/garantias-lote` - Criar
- `PUT /api/garantias-lote/:id` - Atualizar
- `DELETE /api/garantias-lote/:id` - Excluir

### Campos Obrigatórios na Criação:
- `id_produto` (number)
- `id_fornecedor` (number)
- `id_contato` (number)
- `id_garantia` (string) - **Mapeado para coluna id_garantia no banco**
- `tempo_garantia_fabricante_meses` (number)

### Preparação Necessária:
1. Listar Produtos para dropdown
2. Listar Fornecedores para dropdown
3. Listar Contatos (filtrados por fornecedor) para dropdown

---

**Última atualização:** Janeiro 2024





