# Área do Dentista — Integração com EasyDoc

**Data:** 2026-04-09
**Autor:** Brainstorming Claude + Juliano
**Status:** Aprovado para implementação

## Contexto

O site institucional `radixradiologia.com.br` é uma single-page estática (`index.html`) sem backend. A clínica usa a plataforma SaaS EasyDoc (`radix049574.easydocweb.com`) para que os dentistas consultem os exames dos seus pacientes. Hoje, esse acesso é feito por uma URL externa, sem nenhuma conexão visual com o site da Radix.

O objetivo é dar aos dentistas uma porta de entrada **dentro do site da Radix**, com a marca da clínica, que leve à plataforma de exames sem parecer que se trata de um sistema de terceiros.

## Restrições descobertas no brainstorming

| Item | Resultado |
|---|---|
| EasyDoc oferece custom domain ou white-label? | Não — só URL padrão |
| EasyDoc oferece API pública? | Não |
| EasyDoc bloqueia iframes? | Não bloqueia (sem `X-Frame-Options` nem `frame-ancestors`) |
| Cookies de sessão da EasyDoc | `SameSite=Lax` — incompatível com login dentro de iframe cross-origin |
| Forma de login | Usuário e senha em form HTML |
| Fato decisivo | A própria EasyDoc forneceu o snippet HTML do form de login para ser embutido em sites de clientes |

## Decisão de arquitetura

Embutir o **formulário de login da EasyDoc diretamente em uma página nova do site da Radix**, estilizado 100% com a identidade visual da clínica. O submit é um POST cross-origin top-level normal — sem iframes, sem proxy, sem JavaScript, sem riscos de cookies. Após o login, o dentista cai logado na plataforma da EasyDoc para consultar os exames.

Abordagens descartadas e por quê:

- **Reverse proxy (Cloudflare Workers ou Nginx no EC2):** mais "invisível", mas espelhar uma plataforma SaaS de exames odontológicos esbarra em risco contratual (termos de uso da EasyDoc) e regulatório (responsabilidade sobre dados de paciente). Custo de manutenção alto a cada mudança no HTML deles.
- **Iframe wrapper:** login provavelmente quebra por causa de `SameSite=Lax`. Mesmo se funcionasse, navegação interna no iframe fica presa, dificultando UX em mobile.
- **Landing page + nova aba:** zero risco, mas a transição para o domínio externo é imediata e não atende ao requisito de "parecer parte do site".

A abordagem escolhida é a única que combina (a) login que funciona, (b) marca Radix presente no momento mais visível (o login), (c) zero risco contratual, (d) implementação trivial em projeto estático, e (e) zero manutenção contínua.

## Componentes

### 1. Página nova: `area-dentista/index.html`

Página HTML estática autônoma, hospedada em `radixradiologia.com.br/area-dentista/`.

**Estrutura:**

- Mesmo `<head>` do `index.html` no que diz respeito a fontes, CSS, favicon, viewport e PWA, mas com:
  - `<title>` próprio: "Área do Dentista | Radix Radiologia Odontológica"
  - `<meta name="description" content="Acesso restrito para dentistas parceiros consultarem os resultados dos exames de seus pacientes na Radix Radiologia Odontológica.">`
  - `<meta name="robots" content="noindex, nofollow">` (área restrita não deve ser indexada)
  - `<link rel="canonical">` apontando para a própria URL
- Header **idêntico** ao do `index.html` (logo + navegação + CTA WhatsApp)
- Hero curto: título "Área do Dentista" e subtítulo "Acesse os resultados dos exames dos seus pacientes"
- **Card de login** centralizado (descrito abaixo)
- Footer **idêntico** ao do `index.html`

**Card de login — conteúdo:**

```
[Logo Radix — versão pequena, mesmo arquivo Logo.webp usado no header, altura ~48px]

Acesso do Profissional

[ Login    ____________________ ]
[ Senha    ____________________ ]

[        Entrar (botão)         ]

Após entrar, você será direcionado à
plataforma de exames online da Radix.

Esqueci minha senha    •    Voltar para o site
```

**Form HTML (campos obrigatórios — não alterar nomes):**

```html
<form action="https://radix049574.easydocweb.com/resultados/login_php/"
      method="post"
      target="_self">
  <label for="nome_usuario">Login</label>
  <input id="nome_usuario" name="nome_usuario" type="text" required autocomplete="username">

  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password" required autocomplete="current-password">

  <button type="submit" name="Submit" value="Entrar">Entrar</button>
</form>
```

> **Atenção (não alterar sem testar):** os atributos `name="nome_usuario"`, `name="senha"`, `name="Submit"` e `value="Entrar"` vieram do snippet oficial fornecido pela EasyDoc para `radix049574.easydocweb.com`. Mudar qualquer um deles quebra o login. O `action` foi normalizado de `/resultados//login_php/` (com barra dupla) para `/resultados/login_php/` para evitar redirecionamentos desnecessários.

**Links auxiliares abaixo do card:**

- "Esqueci minha senha" → `https://radix049574.easydocweb.com/resultados/recuperar_senha/` (abre na mesma aba — o usuário está iniciando o fluxo de recuperação)
- "Voltar para o site" → `/` (volta para a home do site da Radix)

**Aviso de redirecionamento:**
Texto padrão: *"Após entrar, você será direcionado à plataforma de exames online da Radix."*
Posicionado entre o botão "Entrar" e os links auxiliares. Tipografia menor que o corpo do form, cor secundária (cinza), sem ser escondido.

**Estilo visual:**
- Reaproveitar as variáveis CSS existentes do `index.html` (cor primária `#7C3AED`, fontes, gradientes)
- Card branco com `border-radius` consistente com outros cards do site, sombra sutil
- Form responsivo, mobile-first
- Hierarquia visual clara: título do card grande, labels acima dos inputs, botão primário em destaque, aviso e links auxiliares discretos

### 2. Alterações no `index.html`

**Adicionar item de menu "Área do Dentista" em três lugares:**

1. **`<nav class="nav">` (desktop, linha ~444)** — adicionar como **último item antes** do CTA do WhatsApp:
   ```html
   <a href="/area-dentista/">Área do Dentista</a>
   ```

2. **`<div class="mob-menu" id="mob-menu">` (mobile, linha ~461)** — adicionar como **último item antes** do botão WhatsApp:
   ```html
   <a href="/area-dentista/">Área do Dentista</a>
   ```

3. **Links do footer (linha ~828)** — adicionar ao final da lista de links:
   ```html
   <a href="/area-dentista/">Área do Dentista</a>
   ```

**Importante:** o link deve ser visualmente discreto. Não deve competir com o CTA público de agendamento (WhatsApp). Apenas mais um item de navegação, sem destaque especial.

### 3. Atualizações periféricas

- **`sitemap.xml`:** **NÃO** adicionar a página nova. Como ela tem `noindex`, não faz sentido aparecer no sitemap.
- **`robots.txt`:** sem alteração necessária. O `noindex` no `<head>` da página é suficiente.
- **`manifest.json`:** sem alteração.

## Fluxo de uso

1. Dentista acessa `radixradiologia.com.br` (ou um link direto que receberam da clínica).
2. No header (desktop ou mobile), clica em "Área do Dentista".
3. Navega para `radixradiologia.com.br/area-dentista/`. Vê o site da Radix, com header e footer normais, e o card de login no centro.
4. Digita login e senha → clica em "Entrar".
5. Navegador faz POST top-level cross-origin para `easydocweb.com/resultados/login_php/`.
6. EasyDoc valida as credenciais e responde com o redirecionamento para a página de exames. O dentista cai logado.
7. A partir desse ponto, a navegação acontece no domínio da EasyDoc — esperado e comunicado pelo aviso.

## Tratamento de erros

- **Credenciais erradas:** tratado pela própria EasyDoc na resposta ao POST. O aviso "Após entrar, você será direcionado..." prepara o dentista para a mudança de domínio, então o erro não cria a sensação de "saí do site errado".
- **EasyDoc fora do ar / lentidão:** o navegador exibe erro de servidor padrão. Sem JavaScript, não há como interceptar e exibir mensagem amigável — e mesmo com JS, um POST cross-origin não permite ler a resposta. **Aceitável** dado o escopo e a raridade do cenário.
- **JavaScript desativado:** funciona normalmente. A página é HTML puro, sem dependência de JS para o login.
- **Form com `name` desatualizado pela EasyDoc:** se a EasyDoc trocar o endpoint ou os nomes dos campos, o login quebra silenciosamente. Mitigação: documentação explícita neste spec, e checagem manual periódica (ex: trimestral) ou após qualquer aviso de mudança da EasyDoc.

## Plano de testes

- [ ] Abrir `/area-dentista/` em desktop (Chrome, Firefox, Edge) — layout responsivo correto, header/footer iguais à home
- [ ] Abrir `/area-dentista/` em mobile (Chrome Android, Safari iOS) — card legível, inputs acessíveis com teclado virtual
- [ ] Submeter form com credenciais de teste reais → confirmar que cai logado na EasyDoc
- [ ] Submeter form com credenciais erradas → confirmar que a mensagem da EasyDoc aparece
- [ ] Confirmar que o link "Esqueci minha senha" leva à página de recuperação da EasyDoc
- [ ] Confirmar que o link "Voltar para o site" leva para `/`
- [ ] Confirmar `<meta name="robots" content="noindex, nofollow">` no `<head>` da página
- [ ] Verificar que "Área do Dentista" aparece no menu desktop, no menu mobile e no footer
- [ ] Lighthouse — meta de acessibilidade ≥ 95 e SEO ≥ 90 (ignorando o `noindex` que é proposital)
- [ ] Validar HTML em validator.w3.org
- [ ] Verificar que o site continua passando nos testes existentes (se houver) e que `index.html` não foi quebrado pelas adições no menu

## Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| EasyDoc muda nomes dos campos / endpoint | Baixa | Alto (login quebra) | Spec documenta os valores oficiais; testar trimestralmente |
| EasyDoc lança versão nova de login (vista no HTML deles, com `class="form-control"`) e desativa o `/login_php/` legacy | Média a longo prazo | Alto | Acompanhar comunicações da EasyDoc; ter o endpoint novo já mapeado em caso de migração |
| Dentista estranha a mudança de domínio após o login | Baixa | Baixo | Aviso de redirecionamento explícito antes do submit |
| Phishing: alguém clona a página de login para roubar credenciais | Existe sempre | Alto | Servir só via HTTPS; não introduzir riscos novos vs o cenário atual (a EasyDoc já tem essa exposição hoje) |

## Fora de escopo

- Reverse proxy de qualquer natureza
- Estilizar a EasyDoc por dentro (não temos acesso)
- Recuperação de senha customizada (continua sendo o fluxo da EasyDoc)
- Cadastro de novos dentistas (continua sendo na EasyDoc)
- API ou consulta de exames sem login
- Single sign-on com qualquer provedor
- Dashboard, listagem ou pré-visualização de exames antes do login
- Logout customizado (continua sendo na EasyDoc)
- Tradução / internacionalização (site é PT-BR only)

## Dependências externas

- **EasyDoc** (`radix049574.easydocweb.com`) — disponibilidade do endpoint `/resultados/login_php/` e da página `/resultados/recuperar_senha/`. O sistema escolhido **depende inteiramente** desses dois recursos continuarem funcionando com os nomes de campo atuais.

## Notas de implementação

- A página nova é HTML estático puro. Pode ser deployada por simples upload via FTP/SCP/rsync para o EC2, no diretório `area-dentista/index.html` da raiz do site.
- O `<head>` da nova página deve reaproveitar (idealmente por copy/paste, dado que não há build step) as mesmas tags de fontes, CSS inline e variáveis do `index.html`. Manter sincronização manual quando o `index.html` mudar.
- Pequena melhoria opcional para o futuro: extrair o CSS comum para um arquivo `styles.css` carregado por ambas as páginas. Não é parte deste spec, mas vale registrar como um próximo passo natural se a quantidade de páginas crescer.
