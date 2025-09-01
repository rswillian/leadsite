const cfg = window.APP_CONFIG || window.CONFIG || {};
const URL_BASE = cfg.SCRIPT_URL || window.SCRIPT_URL || "";
const JSON_HEADERS = {"Content-Type":"text/plain;charset=utf-8"};

async function list(){
  if(!URL_BASE) throw new Error("SCRIPT_URL ausente (crie config.js).");
  const res = await fetch(URL_BASE + "?action=list");
  if(!res.ok) throw new Error("Falha ao listar");
  return res.json();
}

async function request(body){
  const res = await fetch(URL_BASE, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  });
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    throw new Error("HTTP "+res.status+" "+res.statusText+" "+t.slice(0,160));
  }
  // Apps Script pode responder via redirect; garanta parse do texto
  const txt = await res.text();
  try { return JSON.parse(txt); } catch(e){ throw new Error("Resposta inválida: "+txt.slice(0,160)); }
}
const create = (payload)=> request({ action:"create", ...payload });
const update = (payload)=> request({ action:"update", ...payload });
const remove = (id)=> request({ action:"delete", id });

window.API = { list, create, update, remove };
