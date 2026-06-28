/* Batch C — Admin dashboard, Pauta, Activity, Survey, Invite.
   Header reusado (KqHeader vive en batch_b/ProfileScreen.jsx — se carga antes).
   Admin usa layout propio con sidebar de administración. */

/* ---------- ADMIN ---------- */
function AdminStat({icon, label, value, delta, up}) {
  return (
    <div style={{background:"var(--surface)", border:"1px solid var(--border)",
      borderRadius:"var(--r-lg)", padding:"18px 20px", boxShadow:"var(--shadow-xs)"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span style={{width:38, height:38, borderRadius:"var(--r-md)", background:"var(--accent-soft)",
          color:"var(--accent-hover)", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15}}><i className={"fas "+icon}></i></span>
        <span style={{font:"var(--text-caption)", fontWeight:700,
          color: up ? "var(--green-700)" : "var(--danger)",
          display:"flex", alignItems:"center", gap:4}}>
          <i className={"fas "+(up?"fa-arrow-up":"fa-arrow-down")} style={{fontSize:9}}></i>{delta}</span>
      </div>
      <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:27,
        color:"var(--fg-strong)", marginTop:14, letterSpacing:"-.01em"}}>{value}</div>
      <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>{label}</div>
    </div>
  );
}

function AdminScreen() {
  const nav = [["fa-gauge-high","Resumen",true],["fa-building","Publicaciones"],["fa-users","Usuarios"],
    ["fa-bullhorn","Pauta"],["fa-flag","Reportes"],["fa-gear","Configuración"]];
  const rows = [
    ["Casa moderna con jardín","Carlos Ramírez","Q 1,850,000","Pendiente","var(--warning)","var(--warning-bg)"],
    ["Apartamento Zona 10","Lucía Martínez","Q 4,200/mes","Aprobada","var(--green-700)","var(--green-100)"],
    ["Terreno San Lucas","Jorge Pérez","Q 985,000","Pendiente","var(--warning)","var(--warning-bg)"],
    ["Oficina Zona 4","María Solís","Q 6,500/mes","Rechazada","var(--danger)","var(--danger-bg)"],
  ];
  return (
    <div style={{width:"100%", minHeight:"100%", display:"flex", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      {/* Sidebar admin */}
      <aside style={{width:240, background:"var(--navy-900)", color:"var(--cream)", flexShrink:0,
        display:"flex", flexDirection:"column", padding:"22px 16px"}}>
        <img src="assets/logo-cream-transparent.png" alt="Kiosqui" style={{height:30, margin:"0 8px 6px"}}/>
        <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
          textTransform:"uppercase", color:"rgba(248,244,238,.4)", margin:"18px 10px 10px"}}>Administración</div>
        <nav style={{display:"flex", flexDirection:"column", gap:3}}>
          {nav.map(([ic,t,active])=>(
            <div key={t} style={{display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
              borderRadius:"var(--r-sm)", cursor:"pointer",
              background: active ? "rgba(181,172,239,.18)" : "transparent",
              color: active ? "#fff" : "rgba(248,244,238,.7)"}}>
              <i className={"fas "+ic} style={{width:18, fontSize:14,
                color: active ? "var(--lav-300)" : "rgba(248,244,238,.5)"}}></i>
              <span style={{font:"var(--text-body-sm)", fontWeight: active?700:500}}>{t}</span>
            </div>
          ))}
        </nav>
        <div style={{marginTop:"auto", display:"flex", alignItems:"center", gap:10, padding:"10px 12px"}}>
          <div style={{width:34, height:34, borderRadius:"999px", background:"var(--lav-500)",
            color:"var(--navy-900)", display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--font-display)", fontWeight:700, fontSize:13}}>AR</div>
          <div style={{minWidth:0}}>
            <div style={{font:"var(--text-caption)", fontWeight:700, color:"#fff"}}>Admin</div>
            <div style={{font:"var(--text-caption)", color:"rgba(248,244,238,.5)"}}>Ana Rodríguez</div>
          </div>
        </div>
      </aside>
      {/* Contenido */}
      <div style={{flex:1, minWidth:0, padding:"30px 34px"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:28,
              letterSpacing:"-.02em", color:"var(--fg-strong)", margin:0}}>Resumen</h1>
            <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"4px 0 0"}}>Actividad de la plataforma · últimos 30 días</p>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:9, height:40, padding:"0 16px",
            background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"var(--r-pill)"}}>
            <i className="fas fa-search" style={{fontSize:13, color:"var(--fg-subtle)"}}></i>
            <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Buscar…</span>
          </div>
        </div>
        {/* Stats */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24}}>
          <AdminStat icon="fa-building" label="Publicaciones activas" value="1,284" delta="12%" up/>
          <AdminStat icon="fa-users" label="Usuarios verificados" value="3,206" delta="8%" up/>
          <AdminStat icon="fa-clock" label="Pendientes de revisión" value="47" delta="5%" up/>
          <AdminStat icon="fa-bullhorn" label="Campañas de pauta" value="18" delta="3%"/>
        </div>
        {/* Moderation table */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-lg)", overflow:"hidden", boxShadow:"var(--shadow-xs)"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"16px 20px", borderBottom:"1px solid var(--border)"}}>
            <h3 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:17,
              color:"var(--fg-strong)", margin:0}}>Cola de moderación</h3>
            <span style={{font:"var(--text-body-sm)", color:"var(--accent-hover)", fontWeight:700}}>Ver todas</span>
          </div>
          <table style={{width:"100%", borderCollapse:"collapse"}}>
            <thead><tr style={{textAlign:"left"}}>
              {["Propiedad","Vendedor","Precio","Estado","Acciones"].map(h=>(
                <th key={h} style={{font:"var(--text-overline)", letterSpacing:".08em",
                  textTransform:"uppercase", color:"var(--fg-subtle)", fontWeight:700,
                  padding:"12px 20px"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i} style={{borderTop:"1px solid var(--border)"}}>
                  <td style={{padding:"14px 20px", font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg-strong)"}}>{r[0]}</td>
                  <td style={{padding:"14px 20px", font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>{r[1]}</td>
                  <td style={{padding:"14px 20px", font:"var(--text-body-sm)", color:"var(--fg)", whiteSpace:"nowrap"}}>{r[2]}</td>
                  <td style={{padding:"14px 20px"}}>
                    <span style={{display:"inline-flex", padding:"3px 11px", borderRadius:"999px",
                      background:r[5], color:r[4], font:"var(--text-caption)", fontWeight:700}}>{r[3]}</span></td>
                  <td style={{padding:"14px 20px"}}>
                    <div style={{display:"flex", gap:8}}>
                      <button style={{width:32, height:32, borderRadius:"var(--r-sm)", cursor:"pointer",
                        border:"none", background:"var(--green-100)", color:"var(--green-700)"}}><i className="fas fa-check"></i></button>
                      <button style={{width:32, height:32, borderRadius:"var(--r-sm)", cursor:"pointer",
                        border:"none", background:"var(--danger-bg)", color:"var(--danger)"}}><i className="fas fa-xmark"></i></button>
                      <button style={{width:32, height:32, borderRadius:"var(--r-sm)", cursor:"pointer",
                        border:"1px solid var(--border-strong)", background:"var(--surface)", color:"var(--fg-muted)"}}><i className="fas fa-eye"></i></button>
                    </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {AdminScreen, AdminStat});
