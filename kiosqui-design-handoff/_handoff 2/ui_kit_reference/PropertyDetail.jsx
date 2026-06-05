/* PropertyDetail — gallery, specs, agent contact */
function Spec({icon, label, value}) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:11, padding:"14px 16px",
      background:"var(--surface-sunk)", borderRadius:"var(--r-md)"}}>
      <span style={{color:"var(--lav-700)"}}>{icon}</span>
      <div>
        <div style={{font:"var(--text-h4)", fontFamily:"var(--font-display)", fontWeight:700,
          color:"var(--fg-strong)", lineHeight:1.1}}>{value}</div>
        <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>{label}</div>
      </div>
    </div>
  );
}

function PropertyDetail({item, onBack, saved, onSave}) {
  const it = item || LISTINGS[0];
  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"20px 28px 72px"}}>
      <button onClick={onBack} style={{display:"flex", alignItems:"center", gap:6, background:"none",
        border:"none", cursor:"pointer", color:"var(--fg-muted)", font:"var(--text-body-sm)",
        fontWeight:600, fontFamily:"var(--font-body)", padding:"4px 0", marginBottom:14}}>
        <IconChevL size={18}/> Volver a resultados</button>

      {/* Gallery */}
      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, height:380, marginBottom:28}}>
        <Photo i={0} style={{height:"100%", borderRadius:"var(--r-lg)"}}/>
        <div style={{display:"grid", gridTemplateRows:"1fr 1fr", gap:10}}>
          <Photo i={1} style={{height:"100%", borderRadius:"var(--r-lg)"}}/>
          <Photo i={2} style={{height:"100%", borderRadius:"var(--r-lg)"}}>
            <button style={{position:"absolute", right:12, bottom:12, display:"flex", gap:7,
              alignItems:"center", background:"rgba(255,255,255,.92)", border:"none",
              borderRadius:"var(--r-pill)", padding:"8px 14px", cursor:"pointer",
              font:"var(--text-label)", color:"var(--navy-800)", fontFamily:"var(--font-body)"}}>
              <IconCamera size={16}/> 24 fotos</button>
          </Photo>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:40, alignItems:"start"}}>
        <div>
          <div style={{display:"flex", gap:10, marginBottom:12}}>
            <span className="kq-badge kq-badge--solid">{it.tag}</span>
            <span className="kq-badge kq-badge--navy">{it.type}</span>
          </div>
          <h1 style={{font:"var(--text-h1)", fontFamily:"var(--font-display)", fontWeight:700,
            letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 8px"}}>{it.title}</h1>
          <div style={{display:"flex", alignItems:"center", gap:6, color:"var(--fg-muted)",
            font:"var(--text-body)", marginBottom:24}}>
            <IconPin size={18}/> {it.zone}, {it.city}</div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:30}}>
            <Spec icon={<IconBed size={22}/>} value={it.beds||"—"} label="Habitaciones"/>
            <Spec icon={<IconBath size={22}/>} value={it.baths||"—"} label="Baños"/>
            <Spec icon={<IconRuler size={22}/>} value={it.area} label="m² const."/>
            <Spec icon={<IconCar size={22}/>} value={it.parking} label="Parqueos"/>
          </div>

          <h3 style={{font:"var(--text-h3)", fontFamily:"var(--font-display)", fontWeight:600,
            color:"var(--fg-strong)", margin:"0 0 10px"}}>Descripción</h3>
          <p style={{font:"var(--text-body)", color:"var(--fg)", margin:"0 0 14px", maxWidth:560}}>
            Hermosa propiedad en una de las mejores zonas de la ciudad. Amplios espacios llenos de luz
            natural, acabados modernos y áreas verdes. A pocos minutos de centros comerciales, colegios
            y vías principales.</p>
          <div style={{display:"flex", flexWrap:"wrap", gap:10}}>
            {["Cocina equipada","Seguridad 24/7","Áreas verdes","Gimnasio","Pet friendly"].map(f=>(
              <span key={f} className="kq-badge kq-badge--lav" style={{padding:"7px 13px"}}>
                <IconCheck size={15}/> {f}</span>
            ))}
          </div>
        </div>

        {/* Sticky contact card */}
        <div style={{position:"sticky", top:88}}>
          <div className="kq-card" style={{padding:24}}>
            <div style={{font:"var(--text-display)", fontFamily:"var(--font-display)", fontWeight:700,
              fontSize:"2rem", color:"var(--fg-strong)", letterSpacing:"-.02em"}}>{it.price}</div>
            <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", marginBottom:20}}>
              {it.op==="renta" ? "Renta mensual" : "Precio de venta"}</div>

            <div style={{display:"flex", alignItems:"center", gap:12, padding:"14px 0",
              borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", marginBottom:18}}>
              <div style={{width:46, height:46, borderRadius:"999px", background:"var(--navy-100)",
                color:"var(--navy-700)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                <IconUser size={24}/></div>
              <div style={{flex:1}}>
                <div style={{font:"var(--text-label)", color:"var(--fg-strong)", display:"flex",
                  alignItems:"center", gap:6}}>Andrea Móvil <IconShield size={15} style={{color:"var(--green-600)"}}/></div>
                <div style={{display:"flex", alignItems:"center", gap:4, font:"var(--text-caption)", color:"var(--fg-muted)"}}>
                  <IconStar size={13} style={{color:"var(--green-500)"}}/> 4.9 · Agente verificado</div>
              </div>
            </div>

            <button className="kq-btn kq-btn--action" style={{width:"100%", marginBottom:10, display:"flex", gap:8}}>
              <IconPhone size={18}/> Contactar</button>
            <button className="kq-btn kq-btn--outline" style={{width:"100%", display:"flex", gap:8}}>
              <IconMsg size={18}/> Enviar mensaje</button>
            <div style={{display:"flex", gap:10, marginTop:14}}>
              <button onClick={()=>onSave(it.id)} className="kq-btn kq-btn--ghost kq-btn--sm"
                style={{flex:1, display:"flex", gap:7, color: saved?"var(--danger)":"var(--primary)"}}>
                <IconHeart size={17} fill={saved?"var(--danger)":"none"}/> Guardar</button>
              <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{flex:1, display:"flex", gap:7}}>
                <IconShare size={17}/> Compartir</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, {PropertyDetail, Spec});
