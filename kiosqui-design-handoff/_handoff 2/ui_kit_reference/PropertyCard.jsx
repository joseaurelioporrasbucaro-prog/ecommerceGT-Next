/* PropertyCard — listing card used in grids */
function PropertyCard({item, saved, onSave, onOpen, i=0}) {
  return (
    <div className="kq-card kq-card--hover" style={{cursor:"pointer", display:"flex", flexDirection:"column"}}
      onClick={()=>onOpen(item)}>
      <div style={{position:"relative"}}>
        <Photo i={i} style={{height:170}}/>
        <span className={"kq-badge "+(item.op==="renta"?"kq-badge--lav":"kq-badge--solid")}
          style={{position:"absolute", top:12, left:12}}>{item.tag}</span>
        <button aria-label="Guardar" onClick={(e)=>{e.stopPropagation(); onSave(item.id);}}
          style={{position:"absolute", top:10, right:10, width:36, height:36, borderRadius:"999px",
          border:"none", cursor:"pointer", background:"rgba(255,255,255,.92)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color: saved ? "var(--danger)" : "var(--navy-700)"}}>
          <IconHeart size={18} fill={saved?"var(--danger)":"none"}/>
        </button>
      </div>
      <div style={{padding:"15px 16px 16px"}}>
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8}}>
          <div style={{font:"var(--text-h4)", fontFamily:"var(--font-display)", fontWeight:700,
            color:"var(--fg-strong)", whiteSpace:"nowrap"}}>{item.price}</div>
          <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)", whiteSpace:"nowrap"}}>{item.type}</span>
        </div>
        <div style={{font:"var(--text-body-sm)", color:"var(--fg)", fontWeight:600, margin:"6px 0 4px"}}>{item.title}</div>
        <div style={{display:"flex", alignItems:"center", gap:5, color:"var(--fg-muted)",
          font:"var(--text-body-sm)"}}>
          <IconPin size={15}/> {item.zone}, {item.city}
        </div>
        <div style={{display:"flex", gap:16, marginTop:13, paddingTop:13, borderTop:"1px solid var(--border)",
          color:"var(--fg-muted)", font:"var(--text-body-sm)", whiteSpace:"nowrap"}}>
          {item.beds>0 && <span style={{display:"flex", gap:6, alignItems:"center"}}><IconBed size={17}/>{item.beds}</span>}
          {item.baths>0 && <span style={{display:"flex", gap:6, alignItems:"center"}}><IconBath size={17}/>{item.baths}</span>}
          <span style={{display:"flex", gap:6, alignItems:"center"}}><IconRuler size={17}/>{item.area} m²</span>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, {PropertyCard});
