# Leadsite — Mobile First (Board + Tabela + Dashboard + Relatórios)

Clone funcional (mobile-first) de um mini‑CRM de leads: Board (kanban), Tabela, Dashboard (KPIs + gráficos) e Relatórios (agrupamentos/pivôs).  
Frontend estático (GitHub Pages) + backend simples em **Google Apps Script** (Google Sheets).

## Publicar (site)
1. Repositório público → subir todos os arquivos.
2. GitHub → Settings → Pages → Deploy from a branch → `/ (root)`.

## Backend (Apps Script)
1. Crie uma Planilha com aba **Leads**.
2. Em https://script.google.com → crie projeto e cole `assets/appsscript.gs`.
3. Edite `SHEET_ID` com o ID da planilha.
4. Deploy → **Web app** → **Anyone with the link** → Deploy (copie a URL).
5. Crie `config.js` na raiz do site com:
```js
window.APP_CONFIG = { SCRIPT_URL: "https://script.google.com/macros/s/SEU_DEPLOY/exec" };
```

## Páginas
- **index.html (Board):** 4 colunas, drag‑and‑drop (desktop) + seletor de status (mobile), criar/editar/excluir, filtros e export CSV.
- **leads.html (Tabela):** busca por texto, filtro por status, atualização e export CSV.
- **dashboard.html (Dashboard):** KPIs (total, ganhos, conversão, ações vencidas) + gráficos (por status, origem, mês). Filtros por período e responsável.
- **reports.html (Relatórios):** agrupamentos por Status/Responsável/Origem/Mês, com soma do Valor estimado e export CSV.

## Observações
- Sem login: compartilhe o link internamente. Apps Script e Sheets têm cotas gratuitas para uso leve.
- Evite dados sensíveis.
