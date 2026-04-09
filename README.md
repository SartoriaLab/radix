# Radix Radiologia Odontológica

Site institucional da **Radix Radiologia Odontológica**, clínica de exames de imagem para odontologia em Taquaritinga/SP.

🌐 **Site:** https://radixradiologia.com.br
📍 Praça Dr. José Furiatti, 184 — Centro — Taquaritinga/SP
📞 (16) 3252-3233

---

## 🏗️ Tecnologias

Site **100% estático** (HTML + CSS + JavaScript puro), sem build step. Ideal para hospedagem em GitHub Pages, Netlify, Vercel ou qualquer servidor estático.

- HTML5 semântico
- CSS3 moderno (CSS Grid, Flexbox, Custom Properties)
- JavaScript vanilla (sem frameworks)
- PWA com manifest e service worker ready
- LGPD-compliant (cookie banner + Política de Privacidade)
- SEO otimizado (Schema.org JSON-LD, Open Graph, Twitter Cards)

---

## 📁 Estrutura do projeto

```
.
├── index.html                          # Página principal
├── 404.html                            # Página de erro 404 customizada
├── politica-privacidade.html           # LGPD compliance
├── manifest.json                       # PWA manifest
├── sitemap.xml                         # Para Google indexar
├── robots.txt                          # Regras de rastreamento
├── README.md                           # Este arquivo
├── GUIA-GITHUB-PAGES.md                # Passo-a-passo de deploy
│
├── assets/                             # Recursos compartilhados
│   ├── site.css                        # CSS unificado (todas as páginas)
│   ├── site.js                         # JS compartilhado (header, mob menu, cookies, GoatCounter)
│   └── img/                            # Imagens otimizadas
│       ├── favicon.svg
│       ├── logo.jpg
│       ├── local.jpg                   # Foto da fachada
│       ├── panoramica.jpg              # Exemplo de panorâmica
│       ├── radiografia-panoramica.jpg  # Imagem da seção de panorâmica
│       ├── periapical.jpg              # Levantamento periapical
│       ├── tomografia.jpg              # Equipamento Orthophos SL 3D
│       ├── tomografia-resultados.jpg   # Resultado 3D da tomografia
│       └── intraoral.jpg               # Escaneamento intraoral
│
├── area-dentista/
│   └── index.html                      # Login dos dentistas (integra com EasyDoc)
│
├── exames/                             # Páginas individuais por exame (SEO)
│   ├── tomografia-odontologica/index.html
│   ├── radiografia-panoramica/index.html
│   ├── radiografia-periapical/index.html
│   ├── escaneamento-intraoral-3d/index.html
│   └── documentacao-ortodontica/index.html
│
└── docs/superpowers/                   # Documentação técnica do projeto
    ├── specs/                          # Especificações
    └── plans/                          # Planos de implementação
```

---

## 🚀 Deploy

Veja o guia completo em [`GUIA-GITHUB-PAGES.md`](GUIA-GITHUB-PAGES.md).

**Resumo:**
1. Criar repositório no GitHub
2. `git push` do código
3. Ativar GitHub Pages em **Settings → Pages**
4. Configurar domínio personalizado
5. Configurar Google Search Console + GoatCounter (analytics)

---

## ✅ Características

- ✅ **Responsivo** — funciona em desktop, tablet e mobile
- ✅ **PWA** — pode ser instalado como app
- ✅ **SEO otimizado** — Schema.org rico (LocalBusiness + Dentist + MedicalBusiness)
- ✅ **5 páginas individuais por exame** — cada uma com FAQ, breadcrumb, MedicalProcedure schema
- ✅ **Rich Snippets** — FAQ, AggregateRating, Breadcrumb, Sitelinks
- ✅ **Cookie banner LGPD** — com aceitar/rejeitar opcionais
- ✅ **Política de Privacidade** — em conformidade com LGPD
- ✅ **Área do Dentista** — integração com plataforma EasyDoc para profissionais
- ✅ **Performance otimizada** — imagens em ~700KB total, CSS/JS minificáveis
- ✅ **Acessibilidade** — alt texts, skip-link, semantic HTML, ARIA labels
- ✅ **Custom 404** — página de erro com identidade visual

---

## 📊 Analytics

O site está preparado para:

1. **Google Search Console** — métricas de cliques/impressões/CTR do Google
2. **GoatCounter** — analytics LGPD-friendly (sem cookies)

Veja como configurar em [`GUIA-GITHUB-PAGES.md`](GUIA-GITHUB-PAGES.md) (passos 6 e 7).

---

## 🔧 Manutenção

### Atualizar conteúdo
Edite os arquivos `.html` diretamente. Sem build step necessário.

### Atualizar estilos
Edite `assets/site.css` — afeta todas as 7 páginas.

### Atualizar scripts
Edite `assets/site.js` — afeta todas as 7 páginas.

### Adicionar nova imagem
1. Otimize com [Squoosh](https://squoosh.app) (JPEG quality ~78)
2. Salve em `assets/img/` com nome em minúsculas
3. Referencie como `assets/img/nome-da-imagem.jpg` (ou `../assets/img/...` em subpastas)

---

## 📞 Contato técnico

Site desenvolvido por [Juliano Anselmo](https://julianoanselmo.github.io/portifolio/).
