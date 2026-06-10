/* SearchResults — filters + grid + map placeholder */
function SearchResults({onOpen, onSave, savedSet}) {
  const [type, setType] = React.useState("Todos");
  const [sort, setSort] = React.useState("Relevancia");
  const chips = ["Todos","Casa","Apartamento","Terreno","Oficina"];
  const list = type==="Todos" ? LISTINGS : LISTINGS.filter(l=>l.type===type);
  return (
    <div style={{maxWidth:1280, margin:"0 auto", padding:"24px 28px 64px"}}>
      {/* Filter bar */}
      <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:8}}>
        <button className="kq-btn kq-btn--outline kq-btn--sm" style={{display:"flex", gap:7}}>
          <IconFilter size={16}/> Filtros</button>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {chips.map(c=>(
            <span key={c} className={"kq-chip"+(type===c?" kq-chip--active":"")}
              onClick={()=>setType(c)}>{c}</span>
          ))}
        </div>
        <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:8,
          font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>
          Ordenar:
          <button onClick={()=>setSort(sort==="Relevancia"?"Precio ↑":"Relevancia")}
            style={{display:"flex", alignItems:"center", gap:5, background:"var(--surface)",
            border:"1.5px solid var(--border-strong)", borderRadius:"var(--r-pill)",
            padding:"6px 13px", cursor:"pointer", font:"var(--text-body-sm)", fontWeight:600,
            color:"var(--fg-strong)", fontFamily:"var(--font-body)"}}>{sort} <IconChevD size={15}/></button>
        </div>
      </div>
      <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"4px 0 20px"}}>
        <strong style={{color:"var(--fg-strong)"}}>{list.length} inmuebles</strong> en Zona 14, Guatemala
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1.55fr 1fr", gap:24, alignItems:"start"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20}}>
          {list.map((it,idx)=>(
            <PropertyCard key={it.id} item={it} i={idx} saved={savedSet.has(it.id)}
              onSave={onSave} onOpen={onOpen}/>
          ))}
        </div>
        {/* Map placeholder */}
        <div style={{position:"sticky", top:88, height:"calc(100vh - 112px)", borderRadius:"var(--r-lg)",
          overflow:"hidden", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)"}}>
          <Photo i={3} style={{height:"100%"}}>
            <div style={{textAlign:"center", color:"rgba(255,255,255,.78)"}}>
              <IconPin size={34}/>
              <div style={{font:"var(--text-body-sm)", marginTop:8}}>Mapa interactivo</div>
            </div>
          </Photo>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, {SearchResults});
