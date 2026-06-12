/* Batch B — Perfil público de vendedor (/creator-profile)
   HeaderTwo estándar + hero de perfil + tabs + grid de publicaciones. */

function KqHeader({compact}) {
  return (
    <div style={{height:72, borderBottom:"1px solid var(--border)", background:"var(--bg-elevated)",
      display:"flex", alignItems:"center", gap:16, padding:"0 24px", flexShrink:0}}>
      <button style={{width:40, height:40, borderRadius:"999px", border:"none", cursor:"pointer",
        background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
        fontFamily:"var(--font-display)", fontWeight:700, fontSize:14, flexShrink:0}}>AR</button>
      <img src="assets/logo-transparent.png" alt="Kiosqui" style={{height:34}} className="kq-logo-light"/>
      {!compact && (
        <div style={{flex:1, maxWidth:420, display:"flex", alignItems:"center", gap:10, height:42,
          padding:"0 16px", background:"var(--surface)", border:"1.5px solid var(--border-strong)",
          borderRadius:"999px", marginLeft:6}}>
          <i className="fas fa-search" style={{fontSize:13, color:"var(--fg-subtle)"}}></i>
          <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Buscar por zona, ciudad, colonia…</span>
        </div>
      )}
      <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:11}}>
        <button className="kq-btn kq-btn--action kq-btn--sm" style={{display:"flex", gap:7}}>
          <i className="fas fa-plus" style={{fontSize:12}}></i> Publicar</button>
        <button style={{width:38, height:38, borderRadius:"999px", border:"1.5px solid var(--border-strong)",
          background:"var(--surface)", color:"var(--fg-strong)", cursor:"pointer", position:"relative"}}>
          <i className="fas fa-bell" style={{fontSize:15}}></i>
          <span style={{position:"absolute", top:7, right:8, width:8, height:8, borderRadius:"50%",
            background:"var(--green-500)", border:"2px solid var(--surface)"}}></span></button>
        <button style={{width:38, height:38, borderRadius:"999px", border:"1.5px solid var(--border-strong)",
          background:"var(--surface)", color:"var(--fg-strong)", cursor:"pointer"}}>
          <i className="fas fa-bars" style={{fontSize:15}}></i></button>
      </div>
    </div>
  );
}

const bProps = [
  {price:"Q 1,850,000", type:"Casa", title:"Casa moderna con jardín", loc:"Zona 14, Guatemala", beds:3, baths:2.5, m2:180, ph:"linear-gradient(135deg,#283a5c,#1e2d4a)", feat:true},
  {price:"Q 4,200/mes", type:"Apartamento", title:"Apartamento amueblado", loc:"Zona 10, Guatemala", beds:2, baths:2, m2:95, ph:"linear-gradient(135deg,#6d62cf,#45407e)"},
  {price:"Q 985,000", type:"Terreno", title:"Terreno residencial plano", loc:"San Lucas, Sacatepéquez", beds:0, baths:0, m2:420, ph:"linear-gradient(135deg,#84ad3f,#5c7c28)"},
];

function BPubCard({p}) {
  return (
    <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
      overflow:"hidden", boxShadow: p.feat ? "0 0 0 1.5px var(--lav-400), var(--shadow-sm)" : "var(--shadow-sm)",
      cursor:"pointer"}}>
      <div style={{position:"relative", height:158, background:p.ph, display:"flex",
        alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.5)"}}>
        {p.feat && <span style={{position:"absolute", top:12, left:12, display:"inline-flex",
          alignItems:"center", gap:6, padding:"5px 12px", borderRadius:"999px",
          background:"linear-gradient(135deg,var(--lav-500),var(--lav-600))", color:"#fff",
          font:"var(--text-label)", fontSize:12, fontWeight:700,
          boxShadow:"0 4px 16px rgba(109,98,207,.5), 0 0 0 3px rgba(181,172,239,.25)"}}>
          <i className="fas fa-star" style={{fontSize:10}}></i> Destacado</span>}
        <i className="fas fa-camera" style={{fontSize:26}}></i>
      </div>
      <div style={{padding:"14px 16px 15px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8}}>
          <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:19,
            color:"var(--fg-strong)", whiteSpace:"nowrap"}}>{p.price}</span>
          <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>{p.type}</span>
        </div>
        <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)", margin:"5px 0 4px"}}>{p.title}</div>
        <div style={{display:"flex", alignItems:"center", gap:6, font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>
          <i className="fas fa-map-marker-alt" style={{fontSize:12, color:"var(--accent-hover)"}}></i>{p.loc}</div>
        <div style={{display:"flex", gap:16, marginTop:12, paddingTop:12, borderTop:"1px solid var(--border)",
          font:"var(--text-body-sm)", color:"var(--fg-muted)", whiteSpace:"nowrap"}}>
          {p.beds>0 && <span><i className="fas fa-bed" style={{marginRight:6, color:"var(--navy-500)"}}></i>{p.beds}</span>}
          {p.baths>0 && <span><i className="fas fa-bath" style={{marginRight:6, color:"var(--navy-500)"}}></i>{p.baths}</span>}
          <span><i className="fas fa-vector-square" style={{marginRight:6, color:"var(--navy-500)"}}></i>{p.m2} m²</span>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)",
      color:"var(--fg)", display:"flex", flexDirection:"column"}}>
      <KqHeader/>
      {/* Banda de perfil */}
      <div style={{background:"var(--navy-800)", position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", inset:0,
          background:"radial-gradient(560px 320px at 88% -20%, rgba(181,172,239,.28), transparent 60%)"}}/>
        <div style={{maxWidth:1080, margin:"0 auto", padding:"40px 28px 88px", position:"relative"}}/>
      </div>
      <div style={{maxWidth:1080, margin:"-64px auto 0", padding:"0 28px 56px", width:"100%", position:"relative"}}>
        {/* Card de identidad */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-md)", padding:"26px 30px",
          display:"flex", alignItems:"center", gap:24, flexWrap:"wrap"}}>
          <div style={{position:"relative", flexShrink:0}}>
            <div style={{width:92, height:92, borderRadius:"999px",
              background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--font-display)", fontWeight:700, fontSize:30}}>CR</div>
            <span style={{position:"absolute", bottom:2, right:2, width:28, height:28,
              borderRadius:"999px", background:"var(--green-500)", color:"var(--navy-900)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:12,
              border:"3px solid var(--surface)"}}><i className="fas fa-check"></i></span>
          </div>
          <div style={{flex:1, minWidth:220}}>
            <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
              <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:26,
                letterSpacing:"-.01em", color:"var(--fg-strong)", margin:0}}>Carlos Ramírez</h1>
              <span style={{display:"inline-flex", alignItems:"center", gap:6, padding:"4px 11px",
                borderRadius:"999px", background:"var(--green-100)", color:"var(--green-800)",
                font:"var(--text-caption)", fontWeight:700}}>
                <i className="fas fa-id-card" style={{fontSize:10}}></i> Verificado con DPI</span>
            </div>
            <div style={{font:"var(--text-body-sm)", color:"var(--accent-hover)", fontWeight:600, margin:"3px 0 8px"}}>@carlosramirez</div>
            <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:0, maxWidth:480}}>
              Propietario y desarrollador en Ciudad de Guatemala. Publico casas y apartamentos con modelo 3D para que recorrás antes de visitar.</p>
          </div>
          <div style={{display:"flex", gap:28, flexShrink:0}}>
            {[["18","Publicaciones"],["12","Vendidas"],["4.8","Rating ★"]].map(([n,l])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:24,
                  color: l.includes("★") ? "var(--green-600)" : "var(--fg-strong)"}}>{n}</div>
                <div style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>{l.replace(" ★","")}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:9, flexShrink:0}}>
            <button className="kq-btn kq-btn--action" style={{display:"flex", gap:8}}>
              <i className="fas fa-comments" style={{fontSize:14}}></i> Enviar mensaje</button>
            <button className="kq-btn kq-btn--outline kq-btn--sm" style={{display:"flex", gap:7}}>
              <i className="fas fa-share-nodes" style={{fontSize:13}}></i> Compartir perfil</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex", gap:4, margin:"28px 0 22px", borderBottom:"1.5px solid var(--border)"}}>
          {["Publicaciones (18)","Reseñas (24)"].map((t,i)=>(
            <button key={t} style={{background:"none", border:"none", cursor:"pointer",
              padding:"10px 18px", font:"var(--text-label)", fontSize:14,
              fontFamily:"var(--font-display)",
              color: i===0 ? "var(--fg-strong)" : "var(--fg-subtle)",
              borderBottom: i===0 ? "2.5px solid var(--green-500)" : "2.5px solid transparent",
              marginBottom:-1.5}}>{t}</button>
          ))}
        </div>

        {/* Grid de publicaciones */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20}}>
          {bProps.map(p=><BPubCard key={p.title} p={p}/>)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {KqHeader, BPubCard, ProfileScreen, bProps});
