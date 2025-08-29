(function(){
  const table = document.getElementById('leadsTable');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportBtn = document.getElementById('exportBtn');
  let rows = [];

  function render(){
    const q = (searchInput.value||"").toLowerCase();
    const st = statusFilter.value || "";
    const data = rows.filter(r=>{
      const hay = [r["Empresa/Cliente"], r["Contato (nome)"], r["Email"]].map(v=>String(v||"").toLowerCase()).join(" ");
      if(q && !hay.includes(q)) return false;
      if(st && r.Status !== st) return false;
      return true;
    });
    if(!data.length){
      table.querySelector('thead').innerHTML = "";
      table.querySelector('tbody').innerHTML = "";
      return;
    }
    const headers = Object.keys(data[0]);
    table.querySelector('thead').innerHTML = "<tr>"+headers.map(h=>`<th>${h}</th>`).join("")+"</tr>";
    table.querySelector('tbody').innerHTML = data.map(r=>"<tr>"+headers.map(h=>`<td>${r[h]??""}</td>`).join("")+"</tr>").join("");
  }

  async function load(){
    const data = await API.list();
    rows = data.rows || [];
    render();
  }

  refreshBtn.onclick = load;
  exportBtn.onclick = async ()=>{
    const data = await API.list();
    Utils.download("leads_export.csv", Utils.toCSV(data.rows||[]));
  };
  searchInput.oninput = render;
  statusFilter.onchange = render;
  load();
})();