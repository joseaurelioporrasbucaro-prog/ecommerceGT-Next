/* Batch F — Portal de soporte (staff) + Admin
   Sistema compartido: StaffShell (sidebar nav) + DataTable densa + StatusChip + filtros.
   Tono interno/utilitario pero on-brand. Light + dark por tokens.
   Reusa KqHeader del sistema. */

/* ---------- Mapeo de estados a tokens (DECISIÓN DE DISEÑO) ----------
   Ticket:        open=warn · in_progress=lav · resolved=green · closed=neutral
   Verificación:  pending=warn · verified=green · rejected=danger
   Cuenta:        active=green · suspended=warn · banned=danger
   Rol:           admin=navy · support/agente=lav · usuario=neutral           */
const STATUS = {
  open:        {bg:"var(--warning-bg)", fg:"#9a5a12", label:"Abierto"},
  in_progress: {bg:"var(--lav-200)", fg:"var(--lav-700)", label:"En progreso"},
  resolved:    {bg:"var(--green-100)", fg:"var(--green-800)", label:"Resuelto"},
  closed:      {bg:"var(--surface-sunk)", fg:"var(--fg-muted)", label:"Cerrado"},
  pending:     {bg:"var(--warning-bg)", fg:"#9a5a12", label:"Pendiente"},
  verified:    {bg:"var(--green-100)", fg:"var(--green-800)", label:"Aprobado"},
  rejected:    {bg:"var(--danger-bg)", fg:"var(--danger)", label:"Rechazado"},
  active:      {bg:"var(--green-100)", fg:"var(--green-800)", label:"Activo"},
  suspended:   {bg:"var(--warning-bg)", fg:"#9a5a12", label:"Suspendido"},
  banned:      {bg:"var(--danger-bg)", fg:"var(--danger)", label:"Baneado"},
};
function StatusChip({s, children}) {
  const v = STATUS[s] || STATUS.closed;
  return (
    <span style={{display:"inline-flex", alignItems:"center", gap:6, padding:"3px 11px",
      borderRadius:"999px", background:v.bg, color:v.fg, font:"var(--text-caption)", fontWeight:700,
      whiteSpace:"nowrap"}}>{children||v.label}</span>
  );
}

const ROLE = {
  admin:   {bg:"var(--navy-800)", fg:"var(--cream)", label:"Admin"},
  support: {bg:"var(--lav-500)", fg:"#fff", label:"Agente"},
  user:    {bg:"var(--surface-sunk)", fg:"var(--fg-muted)", label:"Usuario"},
};
function RoleBadge({r}) {
  const v = ROLE[r] || ROLE.user;
  return <span style={{display:"inline-flex", padding:"2px 10px", borderRadius:"999px",
    background:v.bg, color:v.fg, font:"var(--text-caption)", fontWeight:700}}>{v.label}</span>;
}

/* Avatar de gradiente navy con iniciales */
function Av({init, sm}) {
  const d = sm?30:38;
  return <div style={{width:d, height:d, borderRadius:"999px", flexShrink:0,
    background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"var(--font-display)", fontWeight:700, fontSize:sm?11:13}}>{init}</div>;
}

/* ---------- DataTable densa ---------- */
function DataTable({cols, children}) {
  return (
    <div style={{border:"1px solid var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden",
      background:"var(--surface)", boxShadow:"var(--shadow-sm)"}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", minWidth:760}}>
          <thead>
            <tr>
              {cols.map((c,i)=>(
                <th key={i} style={{textAlign: c.right?"right":"left", font:"var(--text-overline)",
                  letterSpacing:"var(--tracking-overline)", textTransform:"uppercase",
                  color:"var(--fg-subtle)", padding:"13px 16px", whiteSpace:"nowrap",
                  borderBottom:"1px solid var(--border)", background:"var(--surface-sunk)"}}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
function Row({children, onClick}) {
  return <tr className="f-row" onClick={onClick} style={{cursor:onClick?"pointer":"default"}}>{children}</tr>;
}
function Cell({children, right, mono, strong, muted, w}) {
  return <td style={{padding:"13px 16px", borderBottom:"1px solid var(--border)",
    font:"var(--text-body-sm)", textAlign:right?"right":"left", width:w,
    fontVariantNumeric:mono?"tabular-nums":"normal",
    fontWeight:strong?600:400, color: strong?"var(--fg-strong)":muted?"var(--fg-subtle)":"var(--fg)",
    whiteSpace: mono?"nowrap":"normal"}}>{children}</td>;
}

/* ---------- Filtros segmentados ---------- */
function FilterTabs({tabs, active}) {
  return (
    <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
      {tabs.map(([k,label])=>(
        <span key={k} style={{padding:"7px 15px", borderRadius:"999px", cursor:"pointer",
          font:"var(--text-body-sm)", fontWeight:600, whiteSpace:"nowrap",
          border: active===k?"1.5px solid transparent":"1.5px solid var(--border-strong)",
          background: active===k?"var(--navy-800)":"var(--surface)",
          color: active===k?"var(--cream)":"var(--fg-muted)"}}>{label}</span>
      ))}
    </div>
  );
}

/* ---------- Shell del portal staff (sidebar) ---------- */
function StaffShell({active, title, sub, actions, children}) {
  const nav = [
    ["tickets","fa-headset","Tickets",4],
    ["verif","fa-id-card","Verificaciones",7],
    ["reports","fa-flag","Denuncias",2],
    ["users","fa-users","Usuarios",null],
    ["admin","fa-sliders-h","Configuración",null],
    ["images","fa-images","Imágenes",null],
  ];
  return (
    <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)", overflow:"hidden"}}>
      <KqHeader compact/>
      <div style={{flex:1, display:"flex", overflow:"hidden"}}>
        {/* Sidebar */}
        <aside style={{width:240, flexShrink:0, borderRight:"1px solid var(--border)",
          background:"var(--bg-elevated)", padding:"18px 12px", display:"flex", flexDirection:"column"}}>
          <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
            textTransform:"uppercase", color:"var(--fg-subtle)", padding:"0 12px 12px"}}>Portal staff</div>
          <div style={{display:"flex", flexDirection:"column", gap:2}}>
            {nav.map(([k,ic,label,count])=>(
              <div key={k} style={{display:"flex", alignItems:"center", gap:12, padding:"11px 12px",
                borderRadius:"var(--r-sm)", cursor:"pointer",
                background: active===k?"var(--navy-800)":"transparent",
                color: active===k?"var(--cream)":"var(--fg-muted)", font:"var(--text-body-sm)", fontWeight:600}}>
                <i className={"fas "+ic} style={{width:18, textAlign:"center", fontSize:14,
                  color: active===k?"var(--green-400)":"var(--fg-subtle)"}}></i>
                <span style={{flex:1}}>{label}</span>
                {count!=null && <span style={{font:"var(--text-caption)", fontWeight:700, padding:"1px 8px",
                  borderRadius:"999px", background: active===k?"rgba(255,255,255,.16)":"var(--lav-200)",
                  color: active===k?"var(--cream)":"var(--lav-700)"}}>{count}</span>}
              </div>
            ))}
          </div>
        </aside>
        {/* Contenido */}
        <div style={{flex:1, overflowY:"auto", padding:"24px 28px 40px"}}>
          <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between",
            gap:16, marginBottom:22, flexWrap:"wrap"}}>
            <div>
              <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:26,
                letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 4px"}}>{title}</h1>
              {sub && <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:0}}>{sub}</p>}
            </div>
            {actions}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {STATUS, StatusChip, ROLE, RoleBadge, Av, DataTable, Row, Cell, FilterTabs, StaffShell});
