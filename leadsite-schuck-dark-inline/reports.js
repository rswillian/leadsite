(function(){
  const fromDate = document.getElementById('fromDate');
  const toDate = document.getElementById('toDate');
  const groupBy = document.getElementById('groupBy');
  const applyBtn = document.getElementById('applyBtn');
  const exportBtn = document.getElementById('exportBtn');
  const table = document.getElementById('reportTable');
  let all = [];
  let currentRows = [];

  function parseDate(s){ const d=new Date(s); return isNaN(d)?null:d; }

  function inRange(row){
    const f = parseDate(fromDate.value);
    const t = parseDate(toDate.value);
    const d = parseDate(row["Data do 1º contato"] || row.CreatedAt);
    if(f && d && d < f) return false;
    if(t && d && d > new Date(t.getTime()+86400000-1)) return false;
    return true;
  }

  function group(rows, key){
    if(key==="mes"){
      const g = Utils.groupBy(rows, r => (r["Data do 1º contato"] || r.CreatedAt || "").slice(0,7) || "—");
      return Object.entries(g).map(([k, arr])=>({ Grupo:k, Quantidade:arr.length, ValorTotal: arr.reduce((s,x)=> s + (Number(x["Valor estimado"])||0), 0) }));
    }
    const g = Utils.groupBy(rows, r => r[key] || "—");
    return Object.entries(g).map(([k, arr])=>({ Grupo:k, Quantidade:arr.length, ValorTotal: arr.reduce((s,x)=> s + (Number(x["Valor estimado"])||0), 0) }));
  }

  function renderTable(rows){
    if(!rows.length){
      table.querySelector('thead').innerHTML = "";
      table.querySelector('tbody').innerHTML = "";
      return;
    }
    table.querySelector('thead').innerHTML = "<tr><th>Grupo</th><th>Quantidade</th><th>Valor total</th></tr>";
    table.querySelector('tbody').innerHTML = rows.map(r=>`<tr><td>${r.Grupo}</td><td>${r.Quantidade}</td><td>${Utils.fmtBRL(r.ValorTotal)}</td></tr>`).join("");
  }

  function apply(){
    const rows = all.filter(inRange);
    const grouped = group(rows, groupBy.value);
    currentRows = grouped;
    renderTable(grouped);
  }

  async function load(){
    const data = await API.list();
    all = data.rows || [];
    apply();
  }

  exportBtn.onclick = ()=>{
    Utils.download("relatorio.csv", Utils.toCSV(currentRows));
  };
  applyBtn.onclick = apply;
  load();
})();