/* ============================================================================
   Radix — Pedido Digital de Exames
   Geração de PDF client-side (jsPDF) + envio via WhatsApp
   ============================================================================ */
(function () {
    'use strict';

    const WA_NUM = '5516996458804';
    const CLINICA = {
        nome: 'Rádix — Clínica de Radiologia Odontológica',
        endereco: 'Praça Dr. José Furiati, 184 — Centro — Taquaritinga/SP',
        fone: '(16) 3252-3233',
        horario: 'Seg a Sex: 08h–11h30 | 13h30–17h30'
    };

    // Upload para o Drive via Google Apps Script (ver scripts/apps-script-upload-pedido.gs)
    // Substituir DRIVE_UPLOAD_URL pelo URL real gerado no deploy do Web App.
    // Enquanto DRIVE_UPLOAD_URL estiver vazio, o fluxo antigo (baixa local + anexo manual) é mantido.
    const DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbyf5rPY2eviT3JQTabHxauYzzpE0xm0ZaWqkA687zpWMKAe9yYFvCmVG125OD-JuCsN/exec';
    const DRIVE_UPLOAD_TOKEN = '';
    const DRIVE_UPLOAD_TIMEOUT_MS = 45000;
    const DRIVE_SUBFOLDER_PREFIX = 'radix';

    /* ---------- Odontograma: definição dos dentes ---------- */
    // Cada linha: array com slots. null = gap central (espaço entre quadrantes).
    const TEETH_ROWS = [
        { y: 30,  teeth: [18,17,16,15,14,13,12,11, null, 21,22,23,24,25,26,27,28] },
        { y: 90,  teeth: [null,null,null, 55,54,53,52,51, null, 61,62,63,64,65, null,null,null] },
        { y: 150, teeth: [null,null,null, 85,84,83,82,81, null, 71,72,73,74,75, null,null,null] },
        { y: 210, teeth: [48,47,46,45,44,43,42,41, null, 31,32,33,34,35,36,37,38] }
    ];

    const PERM = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
    const DEC  = [55,54,53,52,51,61,62,63,64,65,85,84,83,82,81,71,72,73,74,75];
    const SUP  = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,55,54,53,52,51,61,62,63,64,65];
    const INF  = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,85,84,83,82,81,71,72,73,74,75];
    const ALL  = PERM.concat(DEC);
    const PRESETS = { sup: SUP, inf: INF, perm: PERM, dec: DEC, all: ALL };

    const TIPOS_PERM = {1:'Incisivo central',2:'Incisivo lateral',3:'Canino',4:'1º pré-molar',5:'2º pré-molar',6:'1º molar',7:'2º molar',8:'3º molar'};
    const TIPOS_DEC  = {1:'Incisivo central',2:'Incisivo lateral',3:'Canino',4:'1º molar',5:'2º molar'};
    function toothName(num) {
        const q = Math.floor(num / 10), u = num % 10;
        const arcada = (q === 1 || q === 2 || q === 5 || q === 6) ? 'superior' : 'inferior';
        const lado = (q === 1 || q === 4 || q === 5 || q === 8) ? 'direito' : 'esquerdo';
        const dec = q >= 5;
        const tipo = dec ? TIPOS_DEC[u] : TIPOS_PERM[u];
        return `Dente ${num} — ${tipo} ${arcada} ${lado}${dec ? ' (decíduo)' : ''}`;
    }

    function renderOdontograma(svgEl, state, options) {
        const slotW = 36;
        const startX = 20;
        const radius = 14;
        const cxMid = startX + 8 * slotW;  // linha divisória L/R (após 8 slots)
        const parts = [];
        // Linha central tracejada (divisão direito/esquerdo)
        parts.push(`<line class="pd-mid-line" x1="${cxMid}" y1="10" x2="${cxMid}" y2="240"/>`);
        let idx = 0;
        TEETH_ROWS.forEach(row => {
            row.teeth.forEach((num, i) => {
                if (num == null) return;
                const cx = startX + i * slotW + radius;
                const cy = row.y;
                const selected = state.has(num);
                const anim = options && options.animateEntry ? ` style="--i:${idx}"` : ' style="animation:none"';
                const tname = toothName(num);
                parts.push(`<g class="tooth${selected ? ' tooth--selected' : ''}" data-tooth="${num}" role="button" tabindex="0" aria-label="${tname}" aria-pressed="${selected}"${anim}>
                    <title>${tname}</title>
                    <circle class="halo" cx="${cx}" cy="${cy}" r="${radius}"/>
                    <circle cx="${cx}" cy="${cy}" r="${radius}"/>
                    <text class="tnum" x="${cx}" y="${cy + radius + 11}">${num}</text>
                </g>`);
                idx++;
            });
        });
        svgEl.innerHTML = parts.join('');
    }

    function setupOdontograma(svgId, countId, clearSelector, chipsId, odontoKey) {
        const svg = document.getElementById(svgId);
        const countEl = document.getElementById(countId);
        if (!svg) return null;
        const clearBtn = document.querySelector(clearSelector);
        const chipsEl = chipsId ? document.getElementById(chipsId) : null;
        const presetBtns = odontoKey
            ? Array.from(document.querySelectorAll(`.pd-odonto-preset[data-odonto="${odontoKey}"]`))
            : [];
        const state = new Set();

        renderOdontograma(svg, state, { animateEntry: true });
        updateAll();

        function updateCount() {
            if (countEl) countEl.textContent = state.size;
            if (clearBtn) clearBtn.disabled = state.size === 0;
        }

        function updatePresets() {
            presetBtns.forEach(btn => {
                const preset = PRESETS[btn.dataset.preset];
                if (!preset) return;
                const active = preset.length > 0 && preset.every(n => state.has(n));
                btn.classList.toggle('is-active', active);
            });
        }

        function renderChips() {
            if (!chipsEl) return;
            const nums = Array.from(state).sort((a,b) => a-b);
            if (!nums.length) { chipsEl.innerHTML = ''; return; }
            chipsEl.innerHTML = nums.map(n =>
                `<button type="button" class="pd-odonto-chip" data-tooth="${n}" title="${toothName(n)} — clique para remover" aria-label="Remover ${toothName(n)}">${n}</button>`
            ).join('');
        }

        function updateAll() { updateCount(); updatePresets(); renderChips(); }

        function updateTooth(num) {
            const g = svg.querySelector(`g.tooth[data-tooth="${num}"]`);
            if (!g) return;
            const selected = state.has(num);
            g.classList.remove('tooth--selected');
            void g.getBoundingClientRect();
            if (selected) {
                g.classList.add('tooth--selected');
                g.setAttribute('aria-pressed', 'true');
            } else {
                g.setAttribute('aria-pressed', 'false');
            }
        }

        function toggle(num) {
            if (state.has(num)) state.delete(num); else state.add(num);
            updateTooth(num);
            updateAll();
        }

        function applyPreset(nums) {
            const allOn = nums.length > 0 && nums.every(n => state.has(n));
            if (allOn) {
                nums.forEach(n => { state.delete(n); updateTooth(n); });
            } else {
                nums.forEach(n => {
                    if (!state.has(n)) { state.add(n); updateTooth(n); }
                });
            }
            updateAll();
        }

        function clearAll() {
            const nums = Array.from(state);
            state.clear();
            nums.forEach(n => {
                const g = svg.querySelector(`g.tooth[data-tooth="${n}"]`);
                if (g) { g.classList.remove('tooth--selected'); g.setAttribute('aria-pressed', 'false'); }
            });
            updateAll();
        }

        svg.addEventListener('click', e => {
            const g = e.target.closest('g.tooth');
            if (!g) return;
            toggle(Number(g.dataset.tooth));
        });
        svg.addEventListener('keydown', e => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const g = e.target.closest('g.tooth');
            if (!g) return;
            e.preventDefault();
            toggle(Number(g.dataset.tooth));
        });
        if (clearBtn) clearBtn.addEventListener('click', clearAll);
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = PRESETS[btn.dataset.preset];
                if (preset) applyPreset(preset);
            });
        });
        if (chipsEl) {
            chipsEl.addEventListener('click', e => {
                const chip = e.target.closest('.pd-odonto-chip');
                if (!chip) return;
                toggle(Number(chip.dataset.tooth));
            });
        }
        return state;
    }

    /* ---------- Coleta de dados do formulário ---------- */
    function collect(stateIntra, stateTomo) {
        const $ = id => document.getElementById(id);
        const val = id => ($(id)?.value || '').trim();
        const checkedValues = group => Array.from(
            document.querySelectorAll(`input[type="checkbox"][data-group="${group}"]:checked`)
        ).map(i => i.value);
        const radio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

        return {
            paciente: {
                nome: val('f-nome'),
                telefone: val('f-tel'),
                nascimento: val('f-nasc'),
                agendamento: val('f-agend')
            },
            solicitante: {
                dentista: val('f-dr'),
                cro: val('f-cro')
            },
            entrega: radio('entrega'),
            extra: checkedValues('extra'),
            areas: val('f-areas'),
            intra: checkedValues('intra'),
            clarck: val('f-clarck'),
            dentesIntra: Array.from(stateIntra).sort((a,b) => a-b),
            outros: checkedValues('outros'),
            docs: checkedValues('docs'),
            cefalo: checkedValues('cefalo'),
            escan: checkedValues('escan'),
            alinhador: val('f-alinhador'),
            tomo: {
                entrega: radio('tomo_entrega'),
                regiao: checkedValues('tomo_regiao'),
                dentes: Array.from(stateTomo).sort((a,b) => a-b),
                finalidades: checkedValues('tomo_fim'),
                historia: val('f-historia'),
                docs: checkedValues('tomo_doc')
            }
        };
    }

    function formatDate(iso) {
        if (!iso) return '';
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
        return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
    }

    /* ---------- Logo em base64 (carrega 1 vez) ---------- */
    // Converte o WebP em PNG via canvas (fundo branco) porque passar WebP/JPEG
    // com transparência para jsPDF resultava em fundo preto no PDF.
    let logoDataUrl = null;
    function loadLogo() {
        if (logoDataUrl) return Promise.resolve(logoDataUrl);
        return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || 256;
                    canvas.height = img.naturalHeight || 256;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    logoDataUrl = canvas.toDataURL('image/png');
                    resolve(logoDataUrl);
                } catch (e) {
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = '../assets/img/logo.webp';
        });
    }

    /* ---------- Geração do PDF ---------- */
    const ROXO = [124, 58, 237];
    const CINZA = [75, 85, 99];
    const PRETO = [31, 41, 55];

    function gerarPDF(d) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 15;
        let y = margin;

        function ensure(space) {
            if (y + space > pageH - 18) { doc.addPage(); y = margin; }
        }
        function setC(c) { doc.setTextColor(c[0], c[1], c[2]); }

        // Cabeçalho
        if (logoDataUrl) {
            try { doc.addImage(logoDataUrl, 'PNG', margin, y, 22, 22); } catch (e) {}
        }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16); setC(ROXO);
        doc.text('RÁDIX', margin + 26, y + 9);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setC(CINZA);
        doc.text('Clínica de Radiologia Odontológica', margin + 26, y + 14);
        doc.setFontSize(13); setC(PRETO); doc.setFont('helvetica', 'bold');
        doc.text('SOLICITAÇÃO DE EXAMES', pageW - margin, y + 9, { align: 'right' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setC(CINZA);
        doc.text('Pedido digital', pageW - margin, y + 14, { align: 'right' });
        y += 26;

        // Linha divisória
        doc.setDrawColor(ROXO[0], ROXO[1], ROXO[2]);
        doc.setLineWidth(0.6);
        doc.line(margin, y, pageW - margin, y);
        y += 6;

        // Dados do paciente
        tituloSecao(doc, 'Dados do paciente', y); y += 6;
        const p = d.paciente, s = d.solicitante;
        campo(doc, 'Nome', p.nome || '—', margin, y); y += 6;
        linhaDupla(doc, 'Nascimento', formatDate(p.nascimento) || '—', 'Telefone', p.telefone || '—', margin, y, pageW); y += 6;
        linhaDupla(doc, 'Dr.(a)', s.dentista || '—', 'CRO', s.cro || '—', margin, y, pageW); y += 6;
        campo(doc, 'Exame agendado para', p.agendamento || '—', margin, y); y += 8;

        // Helper universal de lista marcada
        function listaSecao(titulo, items, extra) {
            if (!items || !items.length) return;
            ensure(12 + items.length * 5);
            tituloSecao(doc, titulo, y); y += 5.5;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); setC(PRETO);
            items.forEach(it => {
                ensure(5);
                doc.setDrawColor(ROXO[0], ROXO[1], ROXO[2]); doc.setFillColor(ROXO[0], ROXO[1], ROXO[2]);
                doc.rect(margin, y - 3, 3.2, 3.2, 'FD');
                const lines = doc.splitTextToSize(it, pageW - margin * 2 - 6);
                doc.text(lines, margin + 5, y);
                y += Math.max(4.5, lines.length * 4.2);
            });
            if (extra) {
                ensure(5);
                doc.setFont('helvetica', 'italic'); setC(CINZA); doc.setFontSize(9);
                const lines = doc.splitTextToSize(extra, pageW - margin * 2 - 6);
                doc.text(lines, margin + 5, y);
                y += lines.length * 4.2 + 1;
                doc.setFont('helvetica', 'normal'); setC(PRETO); doc.setFontSize(9.5);
            }
            y += 2;
        }

        // Formato de entrega
        if (d.entrega) {
            ensure(8);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); setC(CINZA);
            doc.text(`Formato (radiografias): ${d.entrega}`, margin, y); y += 6;
            doc.setFont('helvetica', 'normal'); setC(PRETO);
        }

        listaSecao('Exames radiográficos extra bucais', d.extra, d.areas ? `Áreas: ${d.areas}` : null);
        listaSecao('Exames radiográficos intra bucais', d.intra, d.clarck ? `Área Clarck: ${d.clarck}` : null);

        if (d.dentesIntra && d.dentesIntra.length) {
            ensure(10);
            tituloSecao(doc, 'Dentes assinalados (intra bucal)', y); y += 5.5;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(10); setC(PRETO);
            const txt = d.dentesIntra.join(' · ');
            const lines = doc.splitTextToSize(txt, pageW - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * 5 + 3;
        }

        listaSecao('Outros serviços', d.outros);
        listaSecao('Documentações ortodônticas', d.docs);
        listaSecao('Traçados cefalométricos', d.cefalo);
        listaSecao('Escaneamento', d.escan, d.alinhador ? `Alinhador: ${d.alinhador}` : null);

        // Tomografia
        const t = d.tomo;
        const temTomo = t.regiao.length || t.dentes.length || t.finalidades.length || t.historia || t.docs.length;
        if (temTomo) {
            ensure(12);
            tituloSecao(doc, 'Tomografia Computadorizada Cone Beam', y, true); y += 6;
            if (t.entrega) {
                doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); setC(CINZA);
                doc.text(`Formato: ${t.entrega}`, margin, y); y += 5;
                doc.setFont('helvetica', 'normal'); setC(PRETO);
            }
            listaSecao('Região', t.regiao);
            if (t.dentes.length) {
                ensure(10);
                tituloSecao(doc, 'Dentes assinalados (tomografia)', y); y += 5.5;
                doc.setFont('helvetica', 'normal'); doc.setFontSize(10); setC(PRETO);
                const lines = doc.splitTextToSize(t.dentes.join(' · '), pageW - margin * 2);
                doc.text(lines, margin, y);
                y += lines.length * 5 + 3;
            }
            listaSecao('Finalidade do exame', t.finalidades);
            if (t.historia) {
                ensure(14);
                tituloSecao(doc, 'História clínica', y); y += 5.5;
                doc.setFont('helvetica', 'normal'); doc.setFontSize(10); setC(PRETO);
                const lines = doc.splitTextToSize(t.historia, pageW - margin * 2);
                lines.forEach(l => { ensure(5); doc.text(l, margin, y); y += 4.8; });
                y += 2;
            }
            listaSecao('Documentações combinadas', t.docs);
        }

        // Rodapé em todas as páginas
        const total = doc.internal.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            doc.setPage(i);
            rodape(i, total);
        }

        function rodape(pag, totPag) {
            const yR = pageH - 12;
            doc.setDrawColor(210, 210, 220); doc.setLineWidth(0.2);
            doc.line(margin, yR - 2, pageW - margin, yR - 2);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setC(CINZA);
            doc.text(`${CLINICA.nome}`, margin, yR + 1);
            doc.text(`${CLINICA.endereco} · ${CLINICA.fone}`, margin, yR + 4.5);
            if (pag && totPag) {
                doc.text(`Página ${pag}/${totPag}`, pageW - margin, yR + 1, { align: 'right' });
                doc.text(new Date().toLocaleString('pt-BR'), pageW - margin, yR + 4.5, { align: 'right' });
            }
        }

        return doc;
    }

    function tituloSecao(doc, texto, y, destaque) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(destaque ? 11 : 10);
        doc.setTextColor(ROXO[0], ROXO[1], ROXO[2]);
        doc.text(texto.toUpperCase(), 15, y);
        doc.setFont('helvetica', 'normal');
    }
    function campo(doc, label, value, x, y) {
        doc.setFontSize(8); doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'bold'); doc.text(label.toUpperCase() + ':', x, y);
        const labelW = doc.getTextWidth(label.toUpperCase() + ': ');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(31, 41, 55);
        doc.text(value, x + labelW + 1, y);
    }
    function linhaDupla(doc, l1, v1, l2, v2, x, y, pageW) {
        const meio = (x + pageW - 15) / 2;
        campo(doc, l1, v1, x, y);
        campo(doc, l2, v2, meio, y);
    }

    /* ---------- Resumo WhatsApp ---------- */
    function resumoWA(d, pdfUrl) {
        const dr = d.solicitante.dentista || 'Dr.(a)';
        const pac = d.paciente.nome || '';
        const data = new Date().toLocaleDateString('pt-BR');
        const linhas = [
            '*Rádix — Solicitação de exame*',
            ''
        ];
        if (pac) linhas.push(`Paciente: *${pac}*`);
        linhas.push(`Solicitante: Dr.(a) ${dr}`);
        linhas.push(`Data: ${data}`);
        linhas.push('');
        if (pdfUrl) {
            linhas.push(`PDF: ${pdfUrl}`);
        } else {
            linhas.push('PDF em anexo nesta conversa.');
        }
        return linhas.join('\n');
    }

    /* ---------- Upload para o Drive (via Apps Script) ---------- */
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                const s = String(fr.result);
                const idx = s.indexOf(',');
                resolve(idx >= 0 ? s.slice(idx + 1) : s);
            };
            fr.onerror = reject;
            fr.readAsDataURL(blob);
        });
    }

    function currentYearMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    async function uploadPdfToDrive(pdfBlob, filename) {
        if (!DRIVE_UPLOAD_URL) throw new Error('DRIVE_UPLOAD_URL não configurado');
        const base64 = await blobToBase64(pdfBlob);
        const subfolder = `${DRIVE_SUBFOLDER_PREFIX}/${currentYearMonth()}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DRIVE_UPLOAD_TIMEOUT_MS);
        try {
            const res = await fetch(DRIVE_UPLOAD_URL, {
                method: 'POST',
                // text/plain evita preflight CORS; Apps Script aceita o body bruto.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ filename, base64, subfolder, token: DRIVE_UPLOAD_TOKEN }),
                signal: controller.signal
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!data || !data.ok || !data.url) throw new Error(data && data.error ? data.error : 'Resposta inválida');
            return data.url;
        } finally {
            clearTimeout(timer);
        }
    }

    function slugify(s) {
        return (s || 'paciente').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    }
    function nomeArquivo(d) {
        const data = new Date().toISOString().slice(0, 10);
        return `pedido-radix-${slugify(d.paciente.nome)}-${data}.pdf`;
    }

    /* ---------- Bootstrap ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        const stateIntra = setupOdontograma('odonto-intra', 'intra-count', '.pd-odonto-clear[data-odonto="intra"]', 'intra-chips', 'intra');
        const stateTomo = setupOdontograma('odonto-tomo', 'tomo-count', '.pd-odonto-clear[data-odonto="tomo"]', 'tomo-chips', 'tomo');

        // Toggle dos inputs extras (áreas, clarck, alinhador)
        const extras = [
            { chkVal: 'Panorâmica com traçado anatômico e mensuração', wrap: 'areas-wrap' },
            { chkVal: 'Técnica de Clarck', wrap: 'clarck-wrap' },
            { chkVal: 'Outro alinhador', wrap: 'alinhador-wrap' }
        ];
        extras.forEach(e => {
            const chk = document.querySelector(`input[type="checkbox"][value="${e.chkVal}"]`);
            const wrap = document.getElementById(e.wrap);
            if (!chk || !wrap) return;
            chk.addEventListener('change', () => {
                wrap.style.display = chk.checked ? 'block' : 'none';
            });
        });

        // Habilita/desabilita botão enviar
        const btnEnv = document.getElementById('btn-enviar');
        const btnPrev = document.getElementById('btn-preview');
        const fNome = document.getElementById('f-nome');
        const fDr = document.getElementById('f-dr');
        const fTel = document.getElementById('f-tel');
        const fNasc = document.getElementById('f-nasc');
        const fb = document.getElementById('pd-feedback');
        function validar() {
            btnEnv.disabled = !(fNome.value.trim() && fDr.value.trim() && fTel.value.trim() && fNasc.value.trim());
        }
        [fNome, fDr, fTel, fNasc].forEach(el => el.addEventListener('input', validar));
        validar();

        function showFeedback(msg, ok) {
            fb.className = 'pd-feedback ' + (ok ? 'pd-feedback--ok' : 'pd-feedback--err');
            fb.textContent = msg;
        }

        function mostrarCarregando(msg) {
            fb.className = 'pd-feedback pd-feedback--loading';
            fb.innerHTML = '';
            const wrap = document.createElement('div');
            wrap.style.display = 'flex';
            wrap.style.alignItems = 'center';
            wrap.style.gap = '14px';
            const sp = document.createElement('span');
            sp.className = 'pd-spinner';
            const txt = document.createElement('div');
            txt.innerHTML = `<strong style="display:block;margin-bottom:2px">Enviando seu pedido…</strong><span style="opacity:.85">${msg}</span>`;
            wrap.appendChild(sp);
            wrap.appendChild(txt);
            fb.appendChild(wrap);
        }

        function mostrarFallback(doc, filename, waUrl, err) {
            fb.className = 'pd-feedback pd-feedback--err';
            fb.innerHTML = '';
            const msg = document.createElement('div');
            msg.style.marginBottom = '10px';
            msg.textContent = 'Não foi possível subir o PDF no servidor. Baixe o arquivo e envie manualmente pelo WhatsApp.';
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.flexWrap = 'wrap';
            row.style.gap = '10px';
            const bDl = document.createElement('button');
            bDl.type = 'button';
            bDl.className = 'btn btn-ghost';
            bDl.textContent = 'Baixar PDF';
            bDl.addEventListener('click', () => doc.save(filename));
            const bWa = document.createElement('a');
            bWa.className = 'btn btn-primary';
            bWa.href = waUrl;
            bWa.textContent = 'Abrir WhatsApp';
            row.appendChild(bDl);
            row.appendChild(bWa);
            fb.appendChild(msg);
            fb.appendChild(row);
            if (err) console.warn('Detalhes do erro:', err);
        }

        // Pré-visualização
        btnPrev.addEventListener('click', async () => {
            await loadLogo();
            const d = collect(stateIntra, stateTomo);
            try {
                const doc = gerarPDF(d);
                const blob = doc.output('blob');
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 30000);
            } catch (err) {
                console.error(err);
                showFeedback('Não foi possível gerar o PDF. Recarregue a página e tente novamente.', false);
            }
        });

        // Envio em 1 clique: gera PDF, sobe no Drive, navega a aba atual para
        // o wa.me. Navegação de location não é bloqueada por popup blocker.
        // No mobile o wa.me abre direto o app do WhatsApp.
        btnEnv.addEventListener('click', async () => {
            if (btnEnv.disabled) return;
            await loadLogo();
            const d = collect(stateIntra, stateTomo);
            let doc;
            try {
                doc = gerarPDF(d);
            } catch (err) {
                console.error(err);
                showFeedback('Erro ao gerar o PDF. Tente novamente ou entre em contato pelo telefone.', false);
                return;
            }

            const filename = nomeArquivo(d);
            const pdfBlob = doc.output('blob');

            const btnLabelOriginal = btnEnv.textContent;
            btnEnv.disabled = true;
            btnEnv.textContent = 'Enviando...';
            mostrarCarregando('Enviando pedido para o servidor… isso pode levar alguns segundos.');

            let pdfUrl = null;
            let uploadError = null;
            if (DRIVE_UPLOAD_URL) {
                try {
                    pdfUrl = await uploadPdfToDrive(pdfBlob, filename);
                } catch (err) {
                    uploadError = err;
                    console.warn('Upload para o Drive falhou:', err);
                }
            }

            const texto = resumoWA(d, pdfUrl);
            const waUrl = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(texto)}`;

            if (pdfUrl) {
                showFeedback('PDF enviado. Abrindo WhatsApp...', true);
                // Pequeno delay para o feedback aparecer antes da navegação.
                setTimeout(() => { window.location.href = waUrl; }, 150);
                return;
            }

            // Falha no upload: não disparamos doc.save automático (no mobile
            // abre o PDF e rouba o foco). Mostramos botões manuais.
            btnEnv.disabled = false;
            btnEnv.textContent = btnLabelOriginal;
            mostrarFallback(doc, filename, waUrl, uploadError);
        });
    });
})();
