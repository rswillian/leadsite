/**
 * Apps Script backend — CRUD para Leads (GitHub Pages).
 * HEADERS e ações compatíveis com as páginas Board/Tabela/Dashboard/Relatórios.
 */
const SHEET_ID = "1zEa27AdmbAmmqf9BGwwILUC91MWG-asJLzJyDqTlVMg";
const SHEET_NAME = "Leads";
const HEADERS = [
  "ID","Status","Empresa/Cliente","Contato (nome)","Telefone","Email","Origem do lead",
  "Data do 1º contato","Data última interação","Próxima ação (data)","Responsável","Valor estimado",
  "Observações","CreatedAt","UpdatedAt"
];

function _sheet(){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh){ sh = ss.insertSheet(SHEET_NAME); }
  const first = sh.getRange(1,1,1,HEADERS.length).getValues()[0];
  const need = first.some((v,i)=> String(v||"") !== HEADERS[i]);
  if(need){
    sh.clear();
    sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  }
  return sh;
}

function _nowISO(){
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ssXXX");
}
function _uuid(){ return Utilities.getUuid(); }

function _rows(){
  const sh = _sheet();
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.map(r => {
    const o = {};
    headers.forEach((h,i)=> o[h] = r[i]);
    return o;
  });
}
function _saveRow(obj){
  const sh = _sheet();
  const row = HEADERS.map(h=> obj[h] ?? "");
  sh.appendRow(row);
  return obj;
}
function _updateRow(id, patch){
  const sh = _sheet();
  const data = sh.getDataRange().getValues();
  const headers = data.shift();
  const idCol = headers.indexOf("ID")+1;
  for(let i=0;i<data.length;i++){
    if(String(data[i][idCol-1]) === String(id)){
      const rowIndex = i+2;
      const current = {};
      headers.forEach((h,idx)=> current[h] = data[i][idx]);
      const next = Object.assign({}, current, patch, { UpdatedAt: _nowISO() });
      const values = HEADERS.map(h=> next[h] ?? "");
      sh.getRange(rowIndex,1,1,HEADERS.length).setValues([values]);
      return next;
    }
  }
  throw new Error("ID não encontrado: "+id);
}
function _deleteRow(id){
  const sh = _sheet();
  const data = sh.getDataRange().getValues();
  const headers = data.shift();
  const idCol = headers.indexOf("ID")+1;
  for(let i=0;i<data.length;i++){
    if(String(data[i][idCol-1]) === String(id)){
      const rowIndex = i+2;
      sh.deleteRow(rowIndex);
      return true;
    }
  }
  return false;
}

function doGet(e){
  const action = (e.parameter.action || "list").toLowerCase();
  if(action === "list"){
    return _json({ rows: _rows() });
  } else if(action === "ping"){
    return _json({ ok:true });
  }
  return _json({ ok:false, error:"Ação inválida"}, 400);
}

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents || "{}");
    const action = (body.action || "create").toLowerCase();
    if(action === "create"){
      const id = _uuid();
      const now = _nowISO();
      const normalized = {
        ID: id,
        Status: body.Status||"1º contato/captação",
        "Empresa/Cliente": body["Empresa/Cliente"]||body.empresa||"",
        "Contato (nome)": body["Contato (nome)"]||body.contato||"",
        Telefone: body.Telefone||body.telefone||"",
        Email: body.Email||body.email||"",
        "Origem do lead": body["Origem do lead"]||body.origem||"",
        "Data do 1º contato": body["Data do 1º contato"]||body.data_primeiro_contato||"",
        "Data última interação": body["Data última interação"]||body.data_ultima_interacao||"",
        "Próxima ação (data)": body["Próxima ação (data)"]||body.proxima_acao||"",
        "Responsável": body["Responsável"]||body.responsavel||"",
        "Valor estimado": body["Valor estimado"]||body.valor_estimado||"",
        "Observações": body["Observações"]||body.observacoes||"",
        CreatedAt: now, UpdatedAt: now
      };
      _saveRow(normalized);
      return _json({ ok:true, item: normalized });
    }
    if(action === "update"){
      const id = body.id || body.ID;
      if(!id) return _json({ ok:false, error:"ID ausente"}, 400);
      const map = {
        empresa:"Empresa/Cliente", contato:"Contato (nome)", telefone:"Telefone", email:"Email",
        origem:"Origem do lead", data_primeiro_contato:"Data do 1º contato",
        data_ultima_interacao:"Data última interação", proxima_acao:"Próxima ação (data)",
        responsavel:"Responsável", valor_estimado:"Valor estimado", observacoes:"Observações"
      };
      const patch = {};
      Object.keys(body).forEach(k=>{
        if(k==="action"||k==="id"||k==="ID") return;
        const key = map[k] || k;
        patch[key] = body[k];
      });
      const saved = _updateRow(id, patch);
      return _json({ ok:true, item:saved });
    }
    if(action === "delete"){
      const id = body.id || body.ID;
      if(!id) return _json({ ok:false, error:"ID ausente"}, 400);
      const ok = _deleteRow(id);
      return _json({ ok });
    }
    return _json({ ok:false, error:"Ação inválida"}, 400);
  }catch(err){
    return _json({ ok:false, error:String(err) }, 500);
  }
}

function _json(obj, status){
  const out = ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  return status ? out.setStatusCode(status) : out;
}
