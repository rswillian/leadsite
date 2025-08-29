(function(){
  const fromDate = document.getElementById('fromDate');
  const toDate = document.getElementById('toDate');
  const ownerFilter = document.getElementById('ownerFilter');
  const applyBtn = document.getElementById('applyBtn');

  const kpiTotal = document.getElementById('kpiTotal');
  const kpiWon = document.getElementById('kpiWon');
  const kpiRate = document.getElementById('kpiRate');
  const kpiOverdue = document.getElementById('kpiOverdue');

  let all = [];
  let charts = [];

  function parseDate(s){
    if(!s) return null;
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }
  function inRange(row){
    const f = parseDate(fromDate.value);
    const t = parseDate(toDate.value);
    const d = parseDate(row["Data do 1º contato"] || row.CreatedAt);
    if(f && d && d < f) return false;
    if(t && d && d > new Date(t.getTime()+86400000-1)) return false;
    const own = ownerFilter.value || "";
    if(own && String(row["Responsável"]||"") !== own) return false;
    return true;
  }

  function renderOwners(){
    const owners = Array.from(new Set(all.map(x=>x["Responsável"]).filter(Boolean))).sort();
    ownerFilter.innerHTML = '<option value="">Responsável (todos)</option>'+owners.map(o=>`<option>${o}</option>`).join('');
  }

  function updateKPIs(rows){
    const total = rows.length;
    const won = rows.filter(r=>r.Status==="conversão (ganho)").length;
    const rate = total ? ((won/total)*100).toFixed(1)+"%" : "—";
    const today = new Date().toISOString().slice(0,10);
    const overdue = rows.filter(r => {
      const p = r["Próxima ação (data)"];
      return p && p < today && r.Status!=="conversão (ganho)";
    }).length;
    kpiTotal.textContent = total;
    kpiWon.textContent = won;
    kpiRate.textContent = rate;
    kpiOverdue.textContent = overdue;
  }

  function buildStatus(rows){
    const statuses = ["1º contato/captação","evolução de contato","aguardando retorno","conversão (ganho)"];
    const counts = statuses.map(s=> rows.filter(r=>r.Status===s).length);
    return { labels: statuses, counts };
  }

  function buildOrigin(rows){
    const by = Utils.groupBy(rows, r=> r["Origem do lead"] || "—");
    const labels = Object.keys(by);
    const counts = labels.map(l=> by[l].length);
    return { labels, counts };
  }

  function buildByMonth(rows){
    const by = Utils.groupBy(rows, r=>{
      const dt = r["Data do 1º contato"] || r.CreatedAt || "";
      const m = (dt||"").slice(0,7); // YYYY-MM
      return m || "—";
    });
    const labels = Object.keys(by).sort();
    const counts = labels.map(l=> by[l].length);
    return { labels, counts };
  }

  function drawChart(ctx, type, labels, data){
    return new Chart(ctx, {
      type,
      data: { labels, datasets: [{ label: "", data }]},
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: type==="pie"||type==="doughnut" ? {} : { y: { beginAtZero: true } }
      }
    });
  }

  function renderCharts(rows){
    charts.forEach(c=>c.destroy());
    charts = [];
    const s = buildStatus(rows);
    const o = buildOrigin(rows);
    const m = buildByMonth(rows);
    charts.push(drawChart(document.getElementById('chartStatus'), 'bar', s.labels, s.counts));
    charts.push(drawChart(document.getElementById('chartOrigin'), 'doughnut', o.labels, o.counts));
    charts.push(drawChart(document.getElementById('chartByMonth'), 'line', m.labels, m.counts));
  }

  async function load(){
    const data = await API.list();
    all = data.rows || [];
    renderOwners();
    apply();
  }

  function apply(){
    const rows = all.filter(inRange);
    updateKPIs(rows);
    renderCharts(rows);
  }

  applyBtn.onclick = apply;
  load();
})();