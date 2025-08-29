window.Utils = (function(){
  function toCSV(rows){
    if(!rows||!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const esc = v => `"${String(v??"").replace(/"/g,'""')}"`;
    return [headers.join(",")].concat(rows.map(r=>headers.map(h=>esc(r[h])).join(","))).join("\n");
  }
  function download(filename, text){
    const blob = new Blob([text], {type:"text/plain;charset=utf-8"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function groupBy(arr, keyFn){
    return arr.reduce((acc, x)=>{
      const k = keyFn(x); (acc[k]||(acc[k]=[])).push(x); return acc;
    }, {});
  }
  const fmtBRL = n => (n==null||n==="")? "—" : Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  return { toCSV, download, groupBy, fmtBRL };
})();