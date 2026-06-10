/* Header — top navigation bar */
function Header({onNav, active, saved}) {
  const link = (id, label) => (
    <button onClick={()=>onNav(id)} style={{
      background:"none", border:"none", cursor:"pointer", padding:"8px 2px",
      font:"var(--text-body-sm)", fontWeight:active===id?700:500,
      fontFamily:"var(--font-body)", color: active===id ? "var(--navy-800)" : "var(--ink-600)",
      borderBottom: active===id ? "2px solid var(--green-500)" : "2px solid transparent"}}>
      {label}
    </button>
  );
  return (
    <header style={{position:"sticky", top:0, zIndex:40, background:"rgba(255,255,255,.88)",
      backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)"}}>
      <div style={{maxWidth:1200, margin:"0 auto", padding:"0 28px", height:68,
        display:"flex", alignItems:"center", gap:28}}>
        <img src="../../assets/logo-transparent.png" alt="Kiosqui" onClick={()=>onNav("home")}
          style={{height:30, cursor:"pointer"}}/>
        <nav style={{display:"flex", gap:22, marginLeft:14}}>
          {link("search","Comprar")}
          {link("rent","Rentar")}
          {link("search","Inmuebles")}
        </nav>
        <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:12}}>
          <button className="kq-btn kq-btn--ghost kq-btn--sm" onClick={()=>onNav("saved")}
            style={{display:"flex", gap:7}}>
            <IconHeart size={17}/> Guardados {saved>0 && <span style={{
              background:"var(--lav-200)", color:"var(--lav-700)", borderRadius:"999px",
              padding:"1px 7px", fontSize:11, fontWeight:700}}>{saved}</span>}
          </button>
          <button className="kq-btn kq-btn--action kq-btn--sm" onClick={()=>onNav("publish")}
            style={{display:"flex", gap:6}}><IconPlus size={16} sw={2.4}/> Publicar</button>
          <button aria-label="Cuenta" style={{width:38, height:38, borderRadius:"999px",
            border:"1.5px solid var(--border-strong)", background:"var(--surface)", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", color:"var(--navy-700)"}}>
            <IconUser size={19}/>
          </button>
        </div>
      </div>
    </header>
  );
}
Object.assign(window, {Header});
