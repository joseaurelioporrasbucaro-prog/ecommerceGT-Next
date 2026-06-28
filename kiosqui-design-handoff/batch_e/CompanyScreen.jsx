/* Batch E — Perfil de empresa (/company/[id])
   Portada + tarjeta de empresa (logo cuadrado navy, verificado verde, dirección, desde, stats)
   + tabs Publicaciones / Empleados. Reusa KqHeader y DGridCard (de batch_d/ListingScreen.jsx).
   NOTA: el código real usa anillo/​check DORADO (#d4af37) para empresa — aquí re-skineado a
   navy + check verde para alinear con el sistema. Decisión a confirmar en el handoff. */

const eEmployees = [
  {init:"AM", name:"Andrea Móvil", handle:"andreamovil", admin:true},
  {init:"CR", name:"Carlos Ramírez", handle:"carlosramirez"},
  {init:"LM", name:"Lucía Martínez", handle:"luciamz"},
  {init:"JP", name:"Jorge Pérez", handle:"jperez"},
  {init:"MS", name:"María Solís", handle:"mariasolis"},
  {init:"RG", name:"Ricardo González", handle:"ricardog"},
];

function EStat({label, value}) {
  return (
    <div style={{textAlign:"left"}}>
      <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:26,
        color:"var(--fg-strong)", lineHeight:1}}>{value}</div>
      <div style={{font:"var(--text-caption)", color:"var(--fg-muted)", marginTop:4}}>{label}</div>
    </div>
  );
}

function CompanyScreen({tab="publicaciones"}) {
  return (
    <div style={{width:"100%", height:"100%", overflowY:"auto", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      {/* Portada */}
      <div style={{height:240, background:"linear-gradient(120deg,#283a5c,#1e2d4a 55%,#45407e)",
        position:"relative"}}>
        <div style={{position:"absolute", inset:0,
          backgroundImage:"radial-gradient(circle at 80% 20%, rgba(181,172,239,.3), transparent 55%)"}}></div>
      </div>

      <div style={{maxWidth:1180, margin:"0 auto", padding:"0 28px 64px"}}>
        <div style={{display:"grid", gridTemplateColumns:"300px 1fr", gap:32, alignItems:"start"}}>
          {/* Tarjeta de empresa */}
          <div style={{marginTop:-72}}>
            <div style={{background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-md)", padding:"0 22px 24px",
              textAlign:"center", position:"relative"}}>
              {/* Foto de perfil de la empresa — marco surface para destacar sobre la franja */}
              <div style={{width:150, height:150, margin:"-58px auto 16px", borderRadius:"var(--r-lg)",
                padding:6, background:"var(--surface)", boxShadow:"var(--shadow-sm)", position:"relative"}}>
                <div style={{width:"100%", height:"100%", borderRadius:"var(--r-md)", overflow:"hidden",
                  background:"linear-gradient(135deg,var(--lav-500),var(--navy-800))", color:"rgba(255,255,255,.9)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:46}}>
                  <i className="fas fa-building"></i></div>
              </div>
              <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:22,
                  color:"var(--fg-strong)"}}>Inmobiliaria Vista</span>
                <i className="fas fa-check-circle" style={{color:"var(--green-600)", fontSize:16}}></i>
              </div>
              <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", marginTop:2}}>Grupo Vista, S.A.</div>
              <div style={{display:"inline-flex", alignItems:"center", gap:6, marginTop:12, padding:"5px 14px",
                borderRadius:"999px", background:"var(--green-100)", color:"var(--green-800)",
                font:"var(--text-label)"}}>
                <i className="fas fa-shield-alt" style={{fontSize:12}}></i> Empresa verificada</div>
              <div style={{borderTop:"1px solid var(--border)", marginTop:18, paddingTop:16,
                display:"flex", flexDirection:"column", gap:11, textAlign:"left"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>
                  <i className="fas fa-map-marker-alt" style={{color:"var(--lav-700)", width:16}}></i> Zona 10, Ciudad de Guatemala</div>
                <div style={{display:"flex", alignItems:"center", gap:10, font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>
                  <i className="far fa-calendar" style={{color:"var(--lav-700)", width:16}}></i> En Kiosqui desde marzo 2024</div>
              </div>
              <button className="kq-btn kq-btn--action" style={{width:"100%", marginTop:20, display:"flex", gap:8}}>
                <i className="fas fa-comment-dots"></i> Contactar</button>
            </div>
          </div>

          {/* Stats + tabs */}
          <div style={{paddingTop:24}}>
            <div style={{display:"flex", gap:48, padding:"20px 26px", background:"var(--surface)",
              border:"1px solid var(--border)", borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-sm)",
              marginBottom:24}}>
              <EStat label="Empleados" value="6"/>
              <EStat label="Publicaciones" value="48"/>
              <EStat label="Calificación" value={<span>4.8 <i className="fas fa-star" style={{fontSize:16, color:"var(--green-600)"}}></i></span>}/>
            </div>

            {/* Tabs */}
            <div style={{display:"flex", gap:32, borderBottom:"1px solid var(--border)", marginBottom:24}}>
              {[["publicaciones","Publicaciones","48"],["empleados","Empleados","6"]].map(([k,label,n])=>(
                <div key={k} style={{display:"flex", alignItems:"center", gap:8, padding:"0 2px 14px",
                  cursor:"pointer", borderBottom: tab===k?"2px solid var(--green-500)":"2px solid transparent",
                  marginBottom:-1}}>
                  <span style={{font:"var(--text-h4)", fontFamily:"var(--font-display)", fontWeight:tab===k?700:500,
                    color: tab===k?"var(--fg-strong)":"var(--fg-muted)"}}>{label}</span>
                  <span style={{font:"var(--text-caption)", fontWeight:700, padding:"2px 9px", borderRadius:"999px",
                    background: tab===k?"var(--lav-200)":"var(--surface-sunk)",
                    color: tab===k?"var(--lav-700)":"var(--fg-subtle)"}}>{n}</span>
                </div>
              ))}
            </div>

            {tab==="publicaciones" && (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20}}>
                {dProps.slice(0,4).map(p=><DGridCard key={p.title} p={p}/>)}
              </div>
            )}

            {tab==="empleados" && (
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16}}>
                {eEmployees.map(e=>(
                  <div key={e.handle} style={{display:"flex", alignItems:"center", gap:13, padding:"14px 16px",
                    background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)",
                    cursor:"pointer"}}>
                    <div style={{width:50, height:50, borderRadius:"999px", flexShrink:0,
                      background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"var(--font-display)", fontWeight:700, fontSize:16}}>{e.init}</div>
                    <div style={{minWidth:0, flex:1}}>
                      <div style={{display:"flex", alignItems:"center", gap:7}}>
                        <span style={{font:"var(--text-label)", color:"var(--fg-strong)", whiteSpace:"nowrap",
                          overflow:"hidden", textOverflow:"ellipsis"}}>{e.name}</span>
                        {e.admin && <span style={{font:"var(--text-caption)", fontWeight:700, padding:"1px 8px",
                          borderRadius:"999px", background:"var(--lav-500)", color:"#fff", flexShrink:0}}>Admin</span>}
                      </div>
                      <div style={{font:"var(--text-caption)", color:"var(--accent-hover)"}}>@{e.handle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {CompanyScreen, EStat, eEmployees});
