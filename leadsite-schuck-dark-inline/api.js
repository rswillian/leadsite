window.API = (function(){
  const cfg = window.APP_CONFIG || window.CONFIG || {};
  const URL_BASE = cfg.SCRIPT_URL || window.SCRIPT_URL || "";
  const JSON_HEADERS = {"Content-Type":"application/json"};

  async function list(){
    if(!URL_BASE) throw new Error("SCRIPT_URL ausente (crie config.js).");
    const res = await fetch(URL_BASE + "?action=list");
    if(!res.ok) throw new Error("Falha ao listar");
    return res.json();
  }
  async function create(payload){
    const res = await fetch(URL_BASE, { method:"POST", headers: JSON_HEADERS, body: JSON.stringify({action:"create", ...payload}) });
    if(!res.ok) throw new Error("Falha ao criar");
    return res.json();
  }
  async function update(payload){
    const res = await fetch(URL_BASE, { method:"POST", headers: JSON_HEADERS, body: JSON.stringify({action:"update", ...payload}) });
    if(!res.ok) throw new Error("Falha ao atualizar");
    return res.json();
  }
  async function remove(id){
    const res = await fetch(URL_BASE, { method:"POST", headers: JSON_HEADERS, body: JSON.stringify({action:"delete", id}) });
    if(!res.ok) throw new Error("Falha ao excluir");
    return res.json();
  }
  return { list, create, update, remove };
})();