(function(){
  const boardEl = document.getElementById('board');
  const addBtn = document.getElementById('addLeadBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportBtn = document.getElementById('exportBtn');
  const searchInput = document.getElementById('searchInput');
  const ownerFilter = document.getElementById('ownerFilter');
  const modal = document.getElementById('leadModal');
  const form = document.getElementById('leadForm');
  const modalMsg = document.getElementById('modalMsg');
  const modalTitle = document.getElementById('modalTitle');

  let all = []; // todos os leads

  function renderOwners(){
    const owners = Array.from(new Set(all.map(x=>x["Responsável"]).filter(Boolean))).sort();
    ownerFilter.innerHTML = '<option value="">Responsável (todos)</option>'+owners.map(o=>`<option>${o}</option>`).join('');
  }

  function matchFilter(item){
    const q = (searchInput.value||"").toLowerCase();
    const own = ownerFilter.value || "";
    const hay = [item["Empresa/Cliente"], item["Contato (nome)"], item["Email"]].map(v=>String(v||"").toLowerCase()).join(" ");
    if(q && !hay.includes(q)) return false;
    if(own && String(item["Responsável"]||"") !== own) return false;
    return true;
  }

  function elCard(item){
    const div = document.createElement('div');
    div.className = 'card';
    div.draggable = true;
    div.dataset.id = item.ID;
    div.innerHTML = `
      <div class="title">${item["Empresa/Cliente"]||"(sem empresa)"} <span class="meta">• ${item["Contato (nome)"]||""}</span></div>
      <div class="meta">${item.Email||""} ${item.Telefone?(" • "+item.Telefone):""}</div>
      <div class="badges">
        ${item["Próxima ação (data)"]?`<span class="badge">Próx: ${item["Próxima ação (data)"]}</span>`:""}
        ${item["Data última interação"]?`<span class="badge">Ult: ${item["Data última interação"]}</span>`:""}
        ${item["Origem do lead"]?`<span class="badge">${item["Origem do lead"]}</span>`:""}
      </div>
      ${item["Observações"]?`<div class="meta">${item["Observações"]}</div>`:""}
      <div class="ops">
        <select class="select-status" data-op="move">
          ${["1º contato/captação","evolução de contato","aguardando retorno","conversão (ganho)"].map(s=>`<option ${s===item.Status?"selected":""}>${s}</option>`).join("")}
        </select>
        <button class="btn" data-op="edit">Editar</button>
        <button class="btn" data-op="del">Excluir</button>
      </div>
    `;
    // Drag desktop
    div.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', item.ID));
    // Quick move (mobile friendly)
    div.querySelector('[data-op="move"]').onchange = async (e)=>{
      const Status = e.target.value;
      await API.update({ id:item.ID, Status });
      await load();
    };
    div.querySelector('[data-op="edit"]').onclick = ()=> openModal(item);
    div.querySelector('[data-op="del"]').onclick = ()=> removeItem(item.ID);
    return div;
  }

  function render(){
    const cols = boardEl.querySelectorAll('[data-dropzone]');
    cols.forEach(c => c.innerHTML = "");
    const filtered = all.filter(matchFilter);
    const byStatus = Object.groupBy ? Object.groupBy(filtered, x=>x.Status || "1º contato/captação")
                                    : filtered.reduce((a,x)=>((a[x.Status]||(a[x.Status]=[])).push(x),a),{});
    boardEl.querySelectorAll('.column').forEach(col => {
      const s = col.dataset.status;
      const body = col.querySelector('.col-body');
      (byStatus[s]||[]).forEach(item => body.appendChild(elCard(item)));
      // Desktop drag-n-drop
      body.ondragover = (e)=>{ e.preventDefault(); };
      body.ondrop = async (e)=>{
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const item = all.find(x=>x.ID===id);
        if(!item) return;
        if(item.Status === s) return;
        await API.update({ id, Status: s });
        await load();
      };
    });
  }

  async function load(){
    const data = await API.list();
    all = data.rows || [];
    renderOwners();
    render();
  }

  function openModal(item){
    modalMsg.textContent = "";
    modalTitle.textContent = item ? "Editar Lead" : "Novo Lead";
    form.reset();
    if(item){
      for(const [k,v] of Object.entries({
        id:"ID", status:"Status", empresa:"Empresa/Cliente", contato:"Contato (nome)",
        telefone:"Telefone", email:"Email", origem:"Origem do lead",
        data_primeiro_contato:"Data do 1º contato", data_ultima_interacao:"Data última interação",
        proxima_acao:"Próxima ação (data)", responsavel:"Responsável", valor_estimado:"Valor estimado", observacoes:"Observações"
      })){
        const el = document.getElementById(k);
        if(el) el.value = item[v] ?? "";
      }
    } else {
      document.getElementById('status').value = '1º contato/captação';
    }
    modal.showModal();
  }

  async function removeItem(id){
    if(!confirm("Excluir este lead?")) return;
    await API.remove(id);
    await load();
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    const map = {
      Status: payload.status, "Empresa/Cliente": payload.empresa,
      "Contato (nome)": payload.contato, Telefone: payload.telefone, Email: payload.email,
      "Origem do lead": payload.origem, "Data do 1º contato": payload.data_primeiro_contato,
      "Data última interação": payload.data_ultima_interacao, "Próxima ação (data)": payload.proxima_acao,
      "Responsável": payload.responsavel, "Valor estimado": payload.valor_estimado, "Observações": payload.observacoes
    };
    if(payload.id){
      await API.update({ id: payload.id, ...map });
    } else {
      await API.create(map);
    }
    modal.close();
    await load();
  });

  addBtn.onclick = ()=> openModal(null);
  refreshBtn.onclick = ()=> load();
  exportBtn.onclick = async ()=>{
    const data = await API.list();
    const rows = data.rows || [];
    const csv = Utils.toCSV(rows);
    Utils.download("leads_export.csv", csv);
  };
  searchInput.oninput = ()=> render();
  ownerFilter.onchange = ()=> render();
  load();
})();