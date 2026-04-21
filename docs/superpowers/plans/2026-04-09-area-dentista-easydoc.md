# Área do Dentista — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a página `/area-dentista/` no site estático da Radix, com um formulário de login estilizado que submete diretamente para a plataforma EasyDoc, parecendo parte nativa do site.

**Architecture:** HTML estático puro (sem build step, sem JS para o login). A nova página é uma cópia da estrutura visual do `index.html` (mesmo head, header, footer, CSS), com o conteúdo do `<main>` substituído por um card de login. O `<form>` faz POST cross-origin top-level direto para `easydocweb.com/resultados/login_php/` — o navegador navega para o domínio da EasyDoc e o dentista cai logado.

**Tech Stack:** HTML5, CSS inline (variáveis customizadas existentes), JavaScript mínimo (apenas hamburger e header scroll, copiado do `index.html`). Sem framework, sem bundler, sem dependências externas além das fontes Google já em uso.

**Spec de referência:** `docs/superpowers/specs/2026-04-09-area-dentista-easydoc-design.md`

---

## Filosofia de "testes" neste projeto

Site estático sem framework de testes. "Testes" aqui são **verificações concretas** após cada mudança:
- Comandos `grep` para confirmar que o conteúdo esperado está no arquivo
- Comandos `curl`/headers checks
- Validação visual manual no navegador (Chrome desktop + responsivo mobile)
- Validador HTML do W3C
- Lighthouse no final

A disciplina é **uma mudança pequena, uma verificação, um commit** — sempre.

---

## File Structure

```
radix/
├── index.html                    [MODIFY] add 3 nav links em locais marcados
└── area-dentista/
    └── index.html                [CREATE] página nova autônoma
```

Nada mais é tocado. Sem alterações em `sitemap.xml`, `robots.txt`, `manifest.json`, `Logo.png`, `favicon.svg`.

---

## Task 1: Criar diretório e arquivo skeleton

**Files:**
- Create: `area-dentista/index.html`

- [ ] **Step 1: Criar o diretório**

Run:
```bash
mkdir -p area-dentista
```

Verificar:
```bash
ls -la area-dentista/
```
Expected: diretório vazio existe.

- [ ] **Step 2: Criar arquivo HTML skeleton (vazio mas válido)**

Conteúdo inicial de `area-dentista/index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Área do Dentista | Radix Radiologia Odontológica</title>
    <meta name="robots" content="noindex, nofollow">
</head>
<body>
    <p>placeholder</p>
</body>
</html>
```

- [ ] **Step 3: Verificar criação**

Run:
```bash
ls -la area-dentista/index.html && head -5 area-dentista/index.html
```
Expected: arquivo existe, primeiras linhas mostram o doctype.

- [ ] **Step 4: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): cria skeleton da pagina /area-dentista/"
```

---

## Task 2: Preencher o `<head>` completo

**Files:**
- Modify: `area-dentista/index.html` (substituir todo o `<head>`)

**Goal:** O `<head>` deve ter SEO/PWA/fontes idênticos ao `index.html` raiz, **exceto** título, description, robots e canonical, que são específicos desta página. Isso garante que tudo (fontes, favicon, theme-color, meta tags sociais) esteja consistente.

- [ ] **Step 1: Substituir o `<head>` pelo conteúdo completo**

Substitua todo o bloco `<head>...</head>` (linhas 3 a 6 do skeleton) por:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- SEO Específico da Área do Dentista -->
    <title>Área do Dentista | Radix Radiologia Odontológica</title>
    <meta name="description" content="Acesso restrito para dentistas parceiros consultarem os resultados dos exames de seus pacientes na Radix Radiologia Odontológica.">
    <meta name="author" content="Radix Radiologia Odontológica">
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="https://www.radixradiologia.com.br/area-dentista/">

    <!-- Open Graph (mantém marca consistente em compartilhamentos) -->
    <meta property="og:title" content="Área do Dentista | Radix Radiologia Odontológica">
    <meta property="og:description" content="Acesso restrito para dentistas parceiros.">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:url" content="https://www.radixradiologia.com.br/area-dentista/">
    <meta property="og:site_name" content="Radix Radiologia Odontológica">
    <meta property="og:image" content="https://www.radixradiologia.com.br/Logo.webp">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="icon" type="image/webp" href="../Logo.webp">
    <link rel="apple-touch-icon" href="../Logo.webp">

    <!-- PWA -->
    <link rel="manifest" href="../manifest.json">
    <meta name="theme-color" content="#7C3AED">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Radix">
    <meta name="application-name" content="Radix Radiologia">

    <!-- Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">

    <style>
        /* CSS será preenchido nas Tasks 3 e 7 */
    </style>
</head>
```

**Atenção:** os caminhos de favicon/logo/manifest usam `../` porque a página fica em uma subpasta.

- [ ] **Step 2: Verificar que o head está correto**

Run:
```bash
grep -n "noindex" area-dentista/index.html
```
Expected: linha mostrando `<meta name="robots" content="noindex, nofollow">`.

Run:
```bash
grep -n "../Logo.webp" area-dentista/index.html
```
Expected: pelo menos uma linha encontrada.

- [ ] **Step 3: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): preenche head com SEO especifico e noindex"
```

---

## Task 3: Copiar o bloco `<style>` do `index.html` raiz

**Files:**
- Modify: `area-dentista/index.html` (substituir `<style>...</style>` placeholder)

**Goal:** Trazer todas as variáveis CSS, reset, tipografia, botões, header, mobile menu, footer e classes auxiliares da home. Isso garante consistência visual perfeita. As regras específicas do card de login serão adicionadas na Task 7.

- [ ] **Step 1: Identificar o bloco `<style>` no index.html raiz**

Run:
```bash
grep -n "<style>" index.html
grep -n "</style>" index.html
```
Expected: linha 60 contém `<style>`, linha 433 contém `</style>`.

- [ ] **Step 2: Extrair o bloco completo**

Run:
```bash
sed -n '60,433p' index.html > /tmp/radix-style-block.txt
wc -l /tmp/radix-style-block.txt
```
Expected: ~374 linhas.

- [ ] **Step 3: Substituir o placeholder `<style>` em area-dentista/index.html**

Use o Edit tool. Substitua isto:

```html
    <style>
        /* CSS será preenchido nas Tasks 3 e 7 */
    </style>
```

Por todo o conteúdo de `/tmp/radix-style-block.txt`, envolto em `<style>...</style>`. O resultado deve começar com `<style>` seguido de `/* ===== RESET =====` e terminar com `}    </style>`.

**Importante:** este é um copy-paste literal. Não modifique nada do CSS neste passo.

- [ ] **Step 4: Verificar que o CSS foi copiado**

Run:
```bash
grep -c "var(--p7)" area-dentista/index.html
```
Expected: número >= 5 (variável é usada várias vezes no CSS).

Run:
```bash
grep -n "===== HEADER =====" area-dentista/index.html
```
Expected: encontra a linha do comentário de header.

- [ ] **Step 5: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): copia bloco <style> completo do index.html"
```

---

## Task 4: Adicionar header e mobile menu (idênticos ao site principal)

**Files:**
- Modify: `area-dentista/index.html` (substituir o `<body>` placeholder)

**Goal:** Reproduzir exatamente o header e o mobile menu da home, mas **com o item "Área do Dentista" já presente** (sem precisar de outra modificação depois). Os links de navegação ainda apontam para `../#secao` porque estamos em uma subpasta.

- [ ] **Step 1: Substituir `<body>...</body>` pelo skeleton com header**

Substitua o body placeholder por:

```html
<body>

<!-- Skip Link Acessibilidade -->
<a href="#login" class="skip-link">Ir para o conteúdo principal</a>

<!-- HEADER -->
<header class="header" id="header">
    <div class="container header-inner">
        <a href="../"><img src="../Logo.webp" alt="Radix Radiologia Odontológica" class="header-logo"></a>
        <nav class="nav">
            <a href="../#inicio">Início</a>
            <a href="../#sobre">Sobre</a>
            <a href="../#exames">Exames</a>
            <a href="../#diferenciais">Diferenciais</a>
            <a href="../#tecnologia">Tecnologia</a>
            <a href="../#contato">Contato</a>
            <a href="/area-dentista/" class="active">Área do Dentista</a>
        </nav>
        <a href="https://wa.me/551632523233?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20exame." class="btn btn-primary h-cta" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            Agendar
        </a>
        <button class="ham" id="ham" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
</header>

<!-- MOBILE MENU -->
<div class="mob-menu" id="mob-menu">
    <a href="../#inicio">Início</a>
    <a href="../#sobre">Sobre</a>
    <a href="../#exames">Exames</a>
    <a href="../#diferenciais">Diferenciais</a>
    <a href="../#tecnologia">Tecnologia</a>
    <a href="../#contato">Contato</a>
    <a href="/area-dentista/" class="active">Área do Dentista</a>
    <a href="https://wa.me/551632523233?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20exame." class="btn btn-wa" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Agendar pelo WhatsApp
    </a>
</div>

<main>
    <p style="padding-top:200px;text-align:center">main placeholder</p>
</main>

</body>
```

- [ ] **Step 2: Verificar que o link "Área do Dentista" está em ambos os menus**

Run:
```bash
grep -c '"/area-dentista/"' area-dentista/index.html
```
Expected: 2 (uma no nav desktop, uma no mob-menu).

- [ ] **Step 3: Verificar que os links voltam para a home com `../`**

Run:
```bash
grep -c 'href="../#' area-dentista/index.html
```
Expected: 12 (6 links no nav desktop + 6 no mob-menu).

- [ ] **Step 4: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): adiciona header e mobile menu identicos a home"
```

---

## Task 5: Adicionar `<main>` com hero curto

**Files:**
- Modify: `area-dentista/index.html` (substituir o `<main>` placeholder)

**Goal:** Adicionar uma seção curta no topo do main com título "Área do Dentista" e subtítulo, usando as classes existentes (`.section`, `.section-label`, `.grad-text`). O card de login virá na Task 6.

- [ ] **Step 1: Substituir o `<main>` placeholder**

Substitua:

```html
<main>
    <p style="padding-top:200px;text-align:center">main placeholder</p>
</main>
```

Por:

```html
<main>

<!-- ===== HERO CURTO ===== -->
<section class="ad-hero section">
    <div class="container">
        <div class="ad-hero-inner">
            <span class="section-label">Acesso Restrito</span>
            <h1>Área do <em class="grad-text">Dentista</em></h1>
            <p class="ad-hero-sub">Acesse os resultados dos exames dos seus pacientes diretamente pela nossa plataforma online.</p>
        </div>
    </div>
</section>

<!-- ===== CARD DE LOGIN ===== -->
<section class="ad-login-section" id="login">
    <div class="container">
        <p>card de login - placeholder (sera adicionado na Task 6)</p>
    </div>
</section>

</main>
```

- [ ] **Step 2: Verificar**

Run:
```bash
grep -n "Área do <em" area-dentista/index.html
grep -n "ad-login-section" area-dentista/index.html
```
Expected: ambos encontrados.

- [ ] **Step 3: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): adiciona hero curto com titulo e subtitulo"
```

---

## Task 6: Construir o card de login (HTML do form)

**Files:**
- Modify: `area-dentista/index.html` (substituir o placeholder dentro de `.ad-login-section`)

**Goal:** Criar o HTML completo do card: logo, título, form com campos `nome_usuario` + `senha` + botão `Submit`/`Entrar` (nomes preservados do snippet oficial), aviso de redirecionamento, e dois links auxiliares ("Esqueci minha senha" → EasyDoc, "Voltar para o site" → home).

- [ ] **Step 1: Substituir o placeholder do `.ad-login-section`**

Substitua:

```html
<section class="ad-login-section" id="login">
    <div class="container">
        <p>card de login - placeholder (sera adicionado na Task 6)</p>
    </div>
</section>
```

Por:

```html
<section class="ad-login-section" id="login">
    <div class="container">
        <div class="ad-card">
            <img src="../Logo.webp" alt="Radix Radiologia Odontológica" class="ad-card-logo">
            <h2 class="ad-card-title">Acesso do Profissional</h2>
            <p class="ad-card-sub">Entre com seus dados para visualizar os exames.</p>

            <form class="ad-form"
                  action="https://radix049574.easydocweb.com/resultados/login_php/"
                  method="post"
                  target="_self">
                <div class="ad-field">
                    <label for="nome_usuario">Login</label>
                    <input id="nome_usuario"
                           name="nome_usuario"
                           type="text"
                           required
                           autocomplete="username"
                           autocapitalize="none"
                           spellcheck="false">
                </div>

                <div class="ad-field">
                    <label for="senha">Senha</label>
                    <input id="senha"
                           name="senha"
                           type="password"
                           required
                           autocomplete="current-password">
                </div>

                <button type="submit" name="Submit" value="Entrar" class="btn btn-primary ad-submit">
                    Entrar
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>

                <p class="ad-notice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Após entrar, você será direcionado à plataforma de exames online da Radix.
                </p>

                <div class="ad-links">
                    <a href="https://radix049574.easydocweb.com/resultados/recuperar_senha/" rel="noopener">Esqueci minha senha</a>
                    <span class="ad-sep">•</span>
                    <a href="../">Voltar para o site</a>
                </div>
            </form>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Verificar nomes EXATOS dos campos**

Run:
```bash
grep -E 'name="nome_usuario"|name="senha"|name="Submit"' area-dentista/index.html
```
Expected: 3 linhas — cada uma encontrando um dos nomes. Estes nomes vieram do snippet oficial da EasyDoc e **não podem mudar**.

- [ ] **Step 3: Verificar action do form**

Run:
```bash
grep 'action=' area-dentista/index.html
```
Expected: encontra `action="https://radix049574.easydocweb.com/resultados/login_php/"` (sem barra dupla).

- [ ] **Step 4: Verificar links auxiliares**

Run:
```bash
grep -E 'recuperar_senha|Voltar para o site' area-dentista/index.html
```
Expected: 2 linhas, uma com o link de recuperação e outra com "Voltar para o site".

- [ ] **Step 5: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): adiciona card de login com form da EasyDoc"
```

---

## Task 7: Adicionar CSS específico do card de login e do hero

**Files:**
- Modify: `area-dentista/index.html` (adicionar regras CSS dentro do `<style>` existente, antes do `</style>` final)

**Goal:** Estilizar o hero curto e o card de login usando as variáveis e padrões do site (`--p7`, `--g6`, `--rl`, `--sh-md`, `--ease`). Card centralizado, responsivo, com hierarquia visual clara.

- [ ] **Step 1: Adicionar bloco CSS antes do `</style>`**

Localize a linha `</style>` em `area-dentista/index.html` (será uma única ocorrência) e insira **antes** dela o seguinte bloco:

```css

/* ===== ÁREA DO DENTISTA ===== */

/* Hero curto */
.ad-hero{padding:140px 0 40px;background:linear-gradient(160deg,#FAF5FF 0%,#fff 60%,rgba(6,182,212,.03) 100%);position:relative;overflow:hidden}
@media(min-width:768px){.ad-hero{padding:170px 0 50px}}
.ad-hero-inner{text-align:center;max-width:680px;margin:0 auto}
.ad-hero h1{margin:18px 0 18px;font-size:clamp(2rem,5vw,3.2rem)}
.ad-hero h1 em{font-style:normal;position:relative;display:inline-block}
.ad-hero h1 em::after{content:'';position:absolute;bottom:4px;left:0;width:100%;height:8px;background:linear-gradient(90deg,var(--t4),var(--p4));opacity:.25;border-radius:4px;z-index:-1}
.ad-hero-sub{font-size:1.05rem;color:var(--g5);max-width:540px;margin:0 auto;line-height:1.75}

/* Login section + card */
.ad-login-section{padding:30px 0 110px}
@media(min-width:768px){.ad-login-section{padding:40px 0 140px}}
.ad-card{background:#fff;border-radius:var(--rl);box-shadow:var(--sh-lg);padding:40px 28px;max-width:440px;margin:0 auto;border:1px solid rgba(124,58,237,.06);position:relative}
@media(min-width:480px){.ad-card{padding:48px 40px}}
.ad-card::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:80px;height:4px;background:var(--grad);border-radius:0 0 6px 6px}
.ad-card-logo{height:56px;width:auto;margin:0 auto 24px;display:block}
.ad-card-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.4rem;font-weight:700;color:#1F2937;text-align:center;margin-bottom:6px}
.ad-card-sub{text-align:center;font-size:.92rem;color:var(--g5);margin-bottom:28px}

/* Form */
.ad-form{display:flex;flex-direction:column;gap:18px}
.ad-field{display:flex;flex-direction:column;gap:6px}
.ad-field label{font-family:'Plus Jakarta Sans',sans-serif;font-size:.78rem;font-weight:700;color:var(--g7);text-transform:uppercase;letter-spacing:.5px}
.ad-field input{width:100%;padding:14px 16px;font-size:1rem;font-family:'Inter',system-ui,sans-serif;color:var(--g7);background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:var(--r);transition:all .25s var(--ease);-webkit-appearance:none;appearance:none}
.ad-field input:hover{border-color:#D1D5DB;background:#fff}
.ad-field input:focus{outline:none;border-color:var(--p7);background:#fff;box-shadow:0 0 0 4px rgba(124,58,237,.12)}
.ad-field input::placeholder{color:var(--g4)}

/* Submit (estende .btn .btn-primary) */
.ad-submit{width:100%;justify-content:center;margin-top:8px;padding:16px 28px}
.ad-submit svg{width:18px;height:18px}

/* Aviso */
.ad-notice{display:flex;gap:10px;align-items:flex-start;margin-top:18px;padding:14px 16px;background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.12);border-radius:var(--r);font-size:.85rem;color:var(--g6);line-height:1.55}
.ad-notice svg{width:18px;height:18px;flex-shrink:0;color:var(--p7);margin-top:1px}

/* Links auxiliares */
.ad-links{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px;margin-top:22px;font-size:.88rem}
.ad-links a{color:var(--p7);font-weight:600;transition:color .25s}
.ad-links a:hover{color:var(--p9);text-decoration:underline}
.ad-sep{color:var(--g4)}

/* Mobile fine-tune */
@media(max-width:479px){
    .ad-card{padding:36px 24px}
    .ad-card-logo{height:48px}
    .ad-card-title{font-size:1.25rem}
    .ad-links{flex-direction:column;gap:10px}
    .ad-sep{display:none}
}
```

- [ ] **Step 2: Verificar que as regras foram adicionadas**

Run:
```bash
grep -c "ad-card" area-dentista/index.html
```
Expected: número alto (>= 10) — classe usada em CSS e HTML.

Run:
```bash
grep "===== ÁREA DO DENTISTA =====" area-dentista/index.html
```
Expected: 1 linha encontrada.

- [ ] **Step 3: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): adiciona CSS do hero e do card de login"
```

---

## Task 8: Adicionar footer (idêntico ao site principal)

**Files:**
- Modify: `area-dentista/index.html` (adicionar footer + WhatsApp float + script entre `</main>` e `</body>`)

**Goal:** Footer copiado literalmente do `index.html` raiz, com o link "Área do Dentista" adicionado na lista de links. Manter o WhatsApp float fixo (parte da identidade do site). Script JS mínimo: apenas hamburger toggle e header scroll — sem counters, sem parallax, sem intersection observer de seções (não há seções nesta página).

- [ ] **Step 1: Adicionar tudo entre `</main>` e `</body>`**

Localize `</main>` em `area-dentista/index.html` e substitua a linha `</main>` (e o que vem depois até `</body>`) por:

```html
</main>

<!-- FOOTER -->
<footer class="footer">
    <div class="container">
        <div class="ft-inner">
            <div class="ft-brand">
                <img src="../Logo.webp" alt="Radix Radiologia Odontológica" class="ft-logo">
                <p>Radiologia odontológica com tecnologia digital de alta precisão em Taquaritinga e região. Exames que fazem diferença no diagnóstico.</p>
            </div>
            <div>
                <h4 class="ft-title">Links</h4>
                <div class="ft-links">
                    <a href="../#inicio">Início</a><a href="../#sobre">Sobre</a><a href="../#exames">Exames</a><a href="../#diferenciais">Diferenciais</a><a href="../#tecnologia">Tecnologia</a><a href="../#contato">Contato</a><a href="/area-dentista/">Área do Dentista</a>
                </div>
            </div>
            <div>
                <h4 class="ft-title">Contato</h4>
                <div class="ft-links">
                    <a href="tel:+551632523233">(16) 3252-3233</a>
                    <span style="color:rgba(255,255,255,.45);font-size:.9rem">Praça Dr. José Furiatti, 184<br>Centro &mdash; Taquaritinga/SP</span>
                    <span style="color:rgba(255,255,255,.45);font-size:.9rem">Seg a Sex: 08h&ndash;11h30 | 13h30&ndash;17h30</span>
                </div>
            </div>
        </div>
        <div class="ft-bottom">
            <p>&copy; 2026 Radix Radiologia Odontológica. Todos os direitos reservados.</p>
            <p class="footer-dev"><a href="https://julianoanselmo.github.io/portifolio/" target="_blank" rel="noopener">Desenvolvido por Juliano Anselmo</a></p>
            <div class="ft-social">
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
            </div>
        </div>
    </div>
</footer>

<!-- WHATSAPP FLOAT -->
<a href="https://wa.me/551632523233?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20exame." class="wa-float" target="_blank" rel="noopener" aria-label="WhatsApp">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>

<script>
// Header scroll
const hdr=document.getElementById('header');
window.addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>60),{passive:true});

// Mobile menu
const ham=document.getElementById('ham'),mob=document.getElementById('mob-menu');
ham.addEventListener('click',()=>{ham.classList.toggle('on');mob.classList.toggle('on');document.body.style.overflow=mob.classList.contains('on')?'hidden':''});
mob.querySelectorAll('a').forEach(l=>l.addEventListener('click',()=>{ham.classList.remove('on');mob.classList.remove('on');document.body.style.overflow=''}));
</script>

</body>
</html>
```

- [ ] **Step 2: Verificar que o footer foi adicionado**

Run:
```bash
grep -c "ft-inner" area-dentista/index.html
```
Expected: 1.

Run:
```bash
grep "Área do Dentista" area-dentista/index.html | head -10
```
Expected: pelo menos 5 ocorrências — `<title>`, `og:title`, nav desktop, mob-menu e footer. (O h1 do hero não conta porque tem `<em>` no meio: "Área do <em>Dentista</em>".)

- [ ] **Step 3: Verificar que o JS está presente e correto (sem código de seções/counter/parallax)**

Run:
```bash
grep -c "animateCounters" area-dentista/index.html
```
Expected: 0 (não copiamos o counter porque não há `[data-count]` nesta página).

Run:
```bash
grep -c "getElementById('header')" area-dentista/index.html
```
Expected: 1.

- [ ] **Step 4: Verificar HTML válido em validator.w3.org (manual)**

Abrir <https://validator.w3.org/nu/#textarea> e colar todo o conteúdo de `area-dentista/index.html`. Esperado: zero erros, possíveis warnings sobre headers de cache que não se aplicam a HTML inline.

- [ ] **Step 5: Commit**

```bash
git add area-dentista/index.html
git commit -m "feat(area-dentista): adiciona footer e wa-float, finaliza pagina"
```

---

## Task 9: Adicionar links "Área do Dentista" no `index.html` raiz

**Files:**
- Modify: `index.html` (3 locais: nav desktop linha ~451, mobile menu linha ~467, footer linha ~828)

**Goal:** Tornar a nova página acessível a partir da home. Link visualmente discreto — não compete com o CTA WhatsApp.

- [ ] **Step 1: Adicionar link no nav desktop**

Localize esta linha em `index.html` (perto da linha 450):

```html
            <a href="#contato">Contato</a>
        </nav>
```

E substitua por:

```html
            <a href="#contato">Contato</a>
            <a href="/area-dentista/">Área do Dentista</a>
        </nav>
```

- [ ] **Step 2: Adicionar link no mobile menu**

Localize esta linha (perto da linha 467):

```html
    <a href="#contato">Contato</a>
    <a href="https://wa.me/551632523233?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20exame." class="btn btn-wa"
```

E substitua por:

```html
    <a href="#contato">Contato</a>
    <a href="/area-dentista/">Área do Dentista</a>
    <a href="https://wa.me/551632523233?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20exame." class="btn btn-wa"
```

- [ ] **Step 3: Adicionar link no footer**

Localize esta linha (perto da linha 828):

```html
                    <a href="#inicio">In&iacute;cio</a><a href="#sobre">Sobre</a><a href="#exames">Exames</a><a href="#diferenciais">Diferenciais</a><a href="#tecnologia">Tecnologia</a><a href="#contato">Contato</a>
```

E substitua por:

```html
                    <a href="#inicio">In&iacute;cio</a><a href="#sobre">Sobre</a><a href="#exames">Exames</a><a href="#diferenciais">Diferenciais</a><a href="#tecnologia">Tecnologia</a><a href="#contato">Contato</a><a href="/area-dentista/">&Aacute;rea do Dentista</a>
```

- [ ] **Step 4: Verificar que o link foi adicionado em 3 lugares no index.html**

Run:
```bash
grep -c '"/area-dentista/"' index.html
```
Expected: 3.

- [ ] **Step 5: Verificar que index.html não foi quebrado em outros pontos**

Run:
```bash
grep -c "</nav>" index.html
grep -c "</footer>" index.html
```
Expected: 1 e 1 (não criamos tags duplicadas).

Run:
```bash
wc -l index.html
```
Expected: ~1015 linhas (era 1013, +2 linhas — uma nova no `<nav class="nav">`, outra no `<div class="mob-menu">`. O footer recebe o link na MESMA linha que já tinha os outros links concatenados, então não adiciona linha).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(index): adiciona link Area do Dentista em nav, mob-menu e footer"
```

---

## Task 10: Verificação visual desktop (Chrome via MCP)

**Goal:** Confirmar visualmente que a página aparece corretamente em desktop, com header e footer idênticos ao site principal, hero centrado, e card de login bem estilizado.

**Requer:** servidor local rodando OU acesso ao Chrome via MCP. Se Chrome MCP não disponível, pule para Task 12 (testes manuais com instruções).

- [ ] **Step 1: Subir servidor local**

Run em background:
```bash
python -m http.server 8765 --directory C:/dev/clientes/radix
```
Ou use qualquer servidor estático equivalente. Esperado: servidor escutando em <http://localhost:8765>.

- [ ] **Step 2: Abrir a página no Chrome MCP**

Use a ferramenta Chrome MCP para navegar até <http://localhost:8765/area-dentista/>.

- [ ] **Step 3: Tirar screenshot e revisar visualmente**

Use computer screenshot. Verificar:
- Header com logo + nav (Início, Sobre, Exames, Diferenciais, Tecnologia, Contato, Área do Dentista) + botão Agendar
- Hero centrado: "Acesso Restrito" / "Área do Dentista" / subtítulo
- Card de login centralizado: logo, "Acesso do Profissional", inputs Login + Senha, botão Entrar roxo, aviso, links "Esqueci minha senha • Voltar para o site"
- Footer roxo escuro idêntico ao site principal, com "Área do Dentista" presente na lista de links
- Botão WhatsApp flutuante no canto inferior direito

Se algo estiver visualmente errado, **NÃO COMITAR FIX** — voltar ao task relevante e corrigir.

- [ ] **Step 4: Resize window para 375x667 (mobile) e re-screenshot**

Verificar:
- Hamburger aparece, nav desktop esconde
- Card de login ocupa quase a largura toda mas com padding
- Logo do card menor (48px)
- Links "Esqueci minha senha" e "Voltar" empilhados verticalmente, sem o separador

- [ ] **Step 5: Testar hamburger**

Click no hamburger → o mob-menu deve abrir mostrando todos os links incluindo "Área do Dentista".

- [ ] **Step 6: Não há commit nesta task** (apenas verificação)

Se passou, prosseguir. Se não, ajustar nas tasks anteriores e re-verificar.

---

## Task 11: Teste funcional do form (POST cross-origin)

**Goal:** Confirmar que o submit do form realmente funciona — mesmo com credenciais erradas, o navegador deve POSTar para a EasyDoc e mostrar a resposta deles (provavelmente uma mensagem de "credenciais inválidas").

**ATENÇÃO:** este teste requer interação real com a EasyDoc. NÃO usar credenciais reais a menos que você seja a Radix. Use credenciais inventadas — espera-se erro, isso é o teste.

- [ ] **Step 1: Com a página aberta no navegador (Task 10), preencher**

- Login: `teste`
- Senha: `teste123`

- [ ] **Step 2: Clicar em "Entrar" e observar a navegação**

Esperado:
- Navegador navega para `radix049574.easydocweb.com/resultados/login_php/` (pode redirecionar para `/login/` ou similar)
- Página da EasyDoc aparece, provavelmente com mensagem de erro de credenciais
- A URL na barra do navegador é da EasyDoc — confirmando que o POST chegou

Se isso acontecer: ✅ form funciona corretamente.

Se a página simplesmente recarregar ou der erro de CORS: revisar:
- O `action=` está correto?
- O `method="post"` está presente?
- Os `name=` dos inputs estão exatos (`nome_usuario`, `senha`)?
- Não há JavaScript interceptando o submit?

- [ ] **Step 3: Voltar para a página /area-dentista/ pelo botão Voltar do navegador**

Esperado: a página da Radix carrega normalmente.

- [ ] **Step 4: Testar o link "Esqueci minha senha"**

Click no link. Esperado: navega para `https://radix049574.easydocweb.com/resultados/recuperar_senha/`.

Voltar usando o botão do navegador.

- [ ] **Step 5: Testar o link "Voltar para o site"**

Click. Esperado: navega para `/` (home da Radix).

- [ ] **Step 6: Sem commit** (verificação apenas)

---

## Task 12: Verificação de SEO e acessibilidade

**Goal:** Confirmar que `noindex` está aplicado, que a página não aparece no sitemap, e que a página passa em verificações básicas de acessibilidade.

- [ ] **Step 1: Confirmar `noindex` no `<head>`**

Run:
```bash
grep -A0 "noindex" area-dentista/index.html
```
Expected: linha contendo `<meta name="robots" content="noindex, nofollow">`.

- [ ] **Step 2: Confirmar que a página NÃO está no sitemap.xml**

Run:
```bash
grep -c "area-dentista" sitemap.xml
```
Expected: 0 (área restrita, não indexar).

- [ ] **Step 3: Verificar que todos os inputs têm `<label for>` correspondente**

Run:
```bash
grep -E 'for="nome_usuario"|id="nome_usuario"' area-dentista/index.html
```
Expected: 2 linhas — uma label, um input.

Run:
```bash
grep -E 'for="senha"|id="senha"' area-dentista/index.html
```
Expected: 2 linhas.

- [ ] **Step 4: Verificar atributo `lang` no `<html>`**

Run:
```bash
grep '<html lang' area-dentista/index.html
```
Expected: `<html lang="pt-BR">`.

- [ ] **Step 5: Verificar que existe um botão acessível para o menu hamburger**

Run:
```bash
grep 'aria-label="Menu"' area-dentista/index.html
```
Expected: 1 linha encontrada.

- [ ] **Step 6: Lighthouse (manual)**

No Chrome DevTools, abrir Lighthouse, rodar audit completo na URL `http://localhost:8765/area-dentista/`.

Metas:
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 80 (será penalizado pelo `noindex`, é proposital — não tente "consertar")

Se algum score abaixo da meta (exceto SEO): investigar e corrigir antes de prosseguir.

- [ ] **Step 7: Sem commit** (verificação apenas)

---

## Task 13: Revisão final e commit de fechamento

**Goal:** Garantir que todo o trabalho está commitado, sem arquivos órfãos, e o git log conta uma história clara.

- [ ] **Step 1: Verificar git status limpo**

Run:
```bash
git status --short
```
Expected: vazio (ignorando `.claude/` que é local).

- [ ] **Step 2: Revisar git log da feature**

Run:
```bash
git log --oneline -15
```
Expected: ver os commits da feature na ordem em que foram feitos. Algo como:

```
xxxxxxx feat(index): adiciona link Area do Dentista em nav, mob-menu e footer
xxxxxxx feat(area-dentista): adiciona footer e wa-float, finaliza pagina
xxxxxxx feat(area-dentista): adiciona CSS do hero e do card de login
xxxxxxx feat(area-dentista): adiciona card de login com form da EasyDoc
xxxxxxx feat(area-dentista): adiciona hero curto com titulo e subtitulo
xxxxxxx feat(area-dentista): adiciona header e mobile menu identicos a home
xxxxxxx feat(area-dentista): copia bloco <style> completo do index.html
xxxxxxx feat(area-dentista): preenche head com SEO especifico e noindex
xxxxxxx feat(area-dentista): cria skeleton da pagina /area-dentista/
xxxxxxx Adiciona spec de design para Área do Dentista integrada com EasyDoc
```

- [ ] **Step 3: Parar o servidor local**

Stop o `python -m http.server` que estava rodando em background.

- [ ] **Step 4: Revisar arquivos finais**

Run:
```bash
ls -la area-dentista/
wc -l area-dentista/index.html index.html
```
Expected: `area-dentista/index.html` existe; `index.html` cresceu em 3 linhas.

- [ ] **Step 5: Sem novo commit** — feature completa.

---

## Pós-implementação: Próximos passos manuais

Coisas que **não** estão neste plano (e são responsabilidade do dono do site):

1. **Deploy:** subir os arquivos para o servidor AWS EC2 via FTP/SCP/rsync. O diretório `area-dentista/` deve ir para o webroot do site, ao lado do `index.html`.
2. **Teste com credencial real:** uma vez deployado, testar o login com uma credencial real de dentista parceiro para confirmar fluxo completo.
3. **Comunicar dentistas:** avisar os dentistas que agora podem acessar pelo site da Radix, pelo menu "Área do Dentista".
4. **Monitoramento futuro:** se a EasyDoc anunciar mudanças no sistema deles, revalidar o form (especialmente os `name=` dos campos e o endpoint).
