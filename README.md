# Firebird Middleware API

API Node.js para expor dados de bancos Firebird para um site, com leitura e escrita por rotas controladas.

## Requisitos

- Node.js 20 ou superior
- Firebird Server acessÃƒÂ­vel na mÃƒÂ¡quina/porta configurada
- Caminho do arquivo `.fdb` disponÃƒÂ­vel para o servidor Firebird

## ConfiguraÃƒÂ§ÃƒÂ£o

1. Instale as dependÃƒÂªncias:

```bash
npm install
```

No PowerShell do Windows, se `npm` estiver bloqueado pela polÃƒÂ­tica de execuÃƒÂ§ÃƒÂ£o, use:

```powershell
npm.cmd install
```

2. Crie o arquivo `.env` com base no `.env.example`.

Exemplo para o banco informado:

```env
HOST=0.0.0.0
PORT=34000
CORS_ORIGIN=*

DB1_NAME=SM
DB1_HOST=127.0.0.1
DB1_PORT=3050
DB1_PATH=C:\Ultra\Banco\Gestao.fdb
DB1_USER=SYSDBA
DB1_PASSWORD=masterkey
DB1_POOL_SIZE=5

DB2_NAME=MS
DB2_HOST=127.0.0.1
DB2_PORT=3050
DB2_PATH=C:\Ultra\Banco\Ms.fdb
DB2_USER=SYSDBA
DB2_PASSWORD=masterkey
DB2_POOL_SIZE=5
```

Para o segundo banco, preencha tambÃƒÂ©m `DB2_PATH`, `DB2_NAME`, `DB2_USER` e `DB2_PASSWORD`.

## Executar

```bash
npm run dev
```

Ou no PowerShell:

```powershell
npm.cmd run dev
```

Com `HOST=0.0.0.0`, a API aceita conexoes de outras maquinas. Use o IP da maquina onde a API esta rodando, por exemplo:

```http
http://192.168.0.10:34000/health
http://192.168.0.10:34000/api/SM/veiculos
http://192.168.0.10:34000/api/MS/veiculos
```

## Rotas

Use o nome configurado no `.env` na URL. Com `DB1_NAME=SM` e `DB2_NAME=MS`, as rotas ficam:

```http
GET /health
GET /api/SM/parceiros
GET /api/SM/parceiros/:id
POST /api/SM/parceiros
PUT /api/SM/parceiros/:id

GET /api/SM/veiculos
GET /api/SM/veiculos/:id
POST /api/SM/veiculos
PUT /api/SM/veiculos/:id

GET /api/SM/operadores

GET /api/SM/servicos

GET /api/SM/tecnicos

GET /api/SM/os/proxima
POST /api/SM/os
```

Para consultar o outro banco, troque `SM` por `MS` na URL. Exemplo: `GET /api/MS/parceiros`.

## Exemplos

Listar parceiros:

```bash
curl http://localhost:34000/api/SM/parceiros
```

Campos retornados em parceiros:

```json
{
  "id_cliente": 1,
  "nome": "Cliente Exemplo",
  "endereco": "Rua A",
  "numero": "123",
  "municipio": "Cuiaba - MT",
  "cep": "78000000",
  "telefone": "65999999999",
  "cpf_cnpj": "00000000000",
  "dscforma": "Dinheiro",
  "dsccondrec": "A vista"
}
```

Os campos `dscforma` e `dsccondrec` sao retornados com `trim`, sem espacos extras no inicio ou fim do texto.

Criar parceiro:

```bash
curl -X POST http://localhost:34000/api/SM/parceiros \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Cliente Teste\",\"endereco\":\"Rua A\",\"numero\":\"123\",\"municipio\":\"Cuiaba\",\"uf\":\"MT\",\"cep\":\"78000000\",\"telefone\":\"65999999999\",\"cpf\":\"00000000000\",\"forma\":1,\"codcondrec\":1}"
```

Atualizar parceiro:

```bash
curl -X PUT http://localhost:34000/api/SM/parceiros/1 \
  -H "Content-Type: application/json" \
  -d "{\"telefone\":\"6533333333\",\"cep\":\"78000000\"}"
```

Criar veÃƒÂ­culo/obra:

```bash
curl -X POST http://localhost:34000/api/SM/veiculos \
  -H "Content-Type: application/json" \
  -d "{\"descricao\":\"Caminhao 01\",\"obs\":\"Ativo\",\"valor_aquisicao\":150000}"
```

Campos retornados em veiculos:

```json
{
  "id": 1,
  "descricao": "Caminhao 01",
  "observacoes": "Ativo",
  "valor_aquisicao": 150000
}
```

Listar operadores:

```bash
curl http://localhost:34000/api/SM/operadores
```

Listar servicos:

```bash
curl http://localhost:34000/api/SM/servicos
```

Listar tecnicos:

```bash
curl http://localhost:34000/api/SM/tecnicos
```

Buscar numero da proxima O.S.:

```bash
curl http://localhost:34000/api/SM/os/proxima
```

Resposta esperada:

```json
{
  "os": 123
}
```

Criar O.S. com varios servicos alocados:

```bash
curl -X POST http://localhost:34000/api/SM/os \
  -H "Content-Type: application/json" \
  -d "{\"id_cliente\":1,\"id_operador\":2,\"id_veiculo\":3,\"os_fabrica\":\"OS-CLIENTE-001\",\"solicitante\":\"Joao\",\"data_abertura\":\"2026-05-06\",\"hora_abertura\":\"14:30\",\"obs_os\":\"Teste de abertura pelo site\",\"servicos\":[{\"tecnico\":2,\"qtd_horas_proposta\":1,\"total_proposta\":150,\"id_servico\":10},{\"tecnico\":7,\"qtd_horas_proposta\":2,\"total_proposta\":300,\"id_servico\":10},{\"tecnico\":4,\"qtd_horas_proposta\":1,\"total_proposta\":220,\"id_servico\":12}]}"
```

Body esperado para `POST /api/SM/os` ou `POST /api/MS/os`:

```json
{
  "id_cliente": 1,
  "id_operador": 2,
  "id_veiculo": 3,
  "os_fabrica": "OS-CLIENTE-001",
  "solicitante": "Joao",
  "data_abertura": "2026-05-06",
  "hora_abertura": "14:30",
  "obs_os": "Teste de abertura pelo site",
  "servicos": [
    {
      "tecnico": 2,
      "qtd_horas_proposta": 1,
      "total_proposta": 150,
      "id_servico": 10
    },
    {
      "tecnico": 7,
      "qtd_horas_proposta": 2,
      "total_proposta": 300,
      "id_servico": 10
    },
    {
      "tecnico": 4,
      "qtd_horas_proposta": 1,
      "total_proposta": 220,
      "id_servico": 12
    }
  ]
}
```

Cada item de `servicos` e gravado separado na mesma O.S. O `id_servico` pode repetir quando tecnico, quantidade ou valor forem diferentes.

Para compatibilidade, o payload antigo com apenas `tecnico`, `qtd_horas_proposta`, `total_proposta` e `id_servico` na raiz continua aceito para uma O.S. com um unico servico.

`id_veiculo` e opcional. Envie o ID do veiculo/obra quando existir, ou `null`/omita o campo quando a O.S. nao tiver veiculo vinculado.

Resposta esperada:

```json
{
  "os": 123,
  "servicos": 3
}
```

## ObservaÃƒÂ§ÃƒÂµes importantes

- NÃƒÂ£o exponha essa API diretamente na internet sem autenticaÃƒÂ§ÃƒÂ£o, HTTPS e CORS restrito.
- O projeto nÃƒÂ£o cria endpoint de SQL livre por seguranÃƒÂ§a.
- Se suas tabelas exigirem geradores/triggers especÃƒÂ­ficos para `PARCEIRO` ou `OBRA`, ajuste os inserts nos repositÃƒÂ³rios.
- Ao criar O.S., a API grava a O.S., grava todos os servicos alocados enviados e atualiza `GEN_OS` com o numero retornado.
- Ao criar O.S., a API grava `idn_sistema='MAQUINAS'`, `idn_entregar='N'`, `cidade_prest_servico=2230`, e copia `data_abertura`/`hora_abertura` para `data_entrega`/`hora_entrega`.
- Para cada servico alocado da O.S., a API calcula `unitario` usando `total_proposta / qtd_horas_proposta`.
- Em produÃƒÂ§ÃƒÂ£o, use um proxy HTTPS, como Nginx, Caddy, Cloudflare Tunnel ou serviÃƒÂ§o equivalente.
