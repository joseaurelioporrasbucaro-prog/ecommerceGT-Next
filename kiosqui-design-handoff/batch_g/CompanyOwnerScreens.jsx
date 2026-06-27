/* Batch G — Empresa (lado dueño)
   1) /company — "Mi empresa" (CompanyMain): portada navy→lavanda + foto enmarcada +
      form de datos (logo, nombre legal/comercial, dirección, teléfono, mostrar empleados).
      Estados: sin empresa / no logueado / no-admin (solo lectura).
   2) /company/equipo — Gestión de equipo (CompanyTeamMain): slots del plan, tabla de
      miembros (rol, límite de publicaciones editable, quitar), invitaciones pendientes,
      invitar (buscar usuario existente + invitar por email).
   Reusa KqHeader (de batch_b/ProfileScreen.jsx). Re-skin: dorado→navy/lavanda, ámbar→warning. */

function GLabel({children}) {
  return <label style={{display:"block", font:"var(--text-label)", color:"var(--fg-strong)", margin:"16px 0 7px"}}>{children}</label>;
}

/* ---------- 1) /company ---------- */
function CompanyOwnerScreen({state="ok"}) {
  return (
    <div style={{width:"100%", height:"100%", overflowY:"auto", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      {state==="empty" ? (
        <div style={{maxWidth:560, margin:"0 auto", padding:"80px 28px", textAlign:"center"}}>
          <div style={{width:88, height:88, borderRadius:"999px", margin:"0 auto 20px",
            background:"var(--accent-soft)", color:"var(--lav-700)", display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:36}}>
            <i className="fas fa-building"></i></div>
          <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:28,
            color:"var(--fg-strong)", margin:"0 0 10px"}}>Todavía no tenés empresa</h1>
          <p style={{font:"var(--text-body)", color:"var(--fg-muted)", margin:"0 auto 26px", maxWidth:420}}>
            Creá un perfil de empresa para publicar como inmobiliaria, sumar a tu equipo y gestionar
            sus publicaciones desde un solo lugar.</p>
          <button className="kq-btn kq-btn--action kq-btn--lg" style={{display:"inline-flex", gap:8}}>
            <i className="fas fa-gem"></i> Ver planes</button>
        </div>
      ) : (
        <React.Fragment>
          {/* Portada (misma identidad del perfil público) */}
          <div style={{height:200, background:"linear-gradient(120deg,#283a5c,#1e2d4a 55%,#45407e)",
            position:"relative"}}>
            <div style={{position:"absolute", inset:0,
              backgroundImage:"radial-gradient(circle at 80% 20%, rgba(181,172,239,.3), transparent 55%)"}}></div>
          </div>
          <div style={{maxWidth:860, margin:"0 auto", padding:"0 28px 64px"}}>
            {/* Encabezado con foto enmarcada */}
            <div style={{display:"flex", alignItems:"flex-end", gap:22, marginTop:-58, marginBottom:8}}>
              <div style={{width:140, height:140, borderRadius:"var(--r-lg)", padding:6, flexShrink:0,
                background:"var(--surface)", boxShadow:"var(--shadow-sm)", position:"relative"}}>
                <div style={{width:"100%", height:"100%", borderRadius:"var(--r-md)", overflow:"hidden",
                  background:"linear-gradient(135deg,var(--lav-500),var(--navy-800))", color:"rgba(255,255,255,.9)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:44}}>
                  <i className="fas fa-building"></i></div>
                <label style={{position:"absolute", right:-6, bottom:-6, width:38, height:38, borderRadius:"999px",
                  background:"var(--green-500)", color:"var(--navy-900)", display:"flex", alignItems:"center",
                  justifyContent:"center", cursor:"pointer", border:"3px solid var(--surface)", fontSize:14}}>
                  <i className="fas fa-camera"></i></label>
              </div>
              <div style={{paddingBottom:8}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:26,
                    color:"var(--fg-strong)", margin:0}}>Inmobiliaria Vista</h1>
                  <i className="fas fa-check-circle" style={{color:"var(--green-600)", fontSize:15}}></i>
                </div>
                <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Grupo Vista, S.A.</div>
              </div>
            </div>

            {/* Tarjeta de edición */}
            <div style={{background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-sm)", padding:28, marginTop:18}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
                flexWrap:"wrap", marginBottom:6}}>
                <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:20,
                  color:"var(--fg-strong)", margin:0}}>Datos de la empresa</h3>
                <a href="#" style={{display:"inline-flex", alignItems:"center", gap:8, font:"var(--text-label)",
                  color:"var(--lav-700)", textDecoration:"none"}}><i className="fas fa-users"></i> Gestionar equipo</a>
              </div>

              {state==="readonly" && (
                <div style={{display:"flex", gap:10, alignItems:"center", padding:"11px 15px", marginTop:14,
                  borderRadius:"var(--r-md)", background:"var(--warning-bg)", color:"#9a5a12",
                  font:"var(--text-body-sm)"}}>
                  <i className="fas fa-lock"></i> Solo un administrador de la empresa puede editar estos datos.</div>
              )}

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 18px"}}>
                <div style={{gridColumn:"1 / -1"}}>
                  <GLabel>Logo</GLabel>
                  <div style={{display:"flex", alignItems:"center", gap:16}}>
                    <div style={{width:64, height:64, borderRadius:"var(--r-md)", flexShrink:0,
                      background:"linear-gradient(135deg,var(--lav-500),var(--navy-800))", color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:24}}>
                      <i className="fas fa-building"></i></div>
                    <button className="kq-btn kq-btn--outline kq-btn--sm" disabled={state==="readonly"}
                      style={{display:"flex", gap:8}}><i className="fas fa-upload" style={{fontSize:12}}></i> Cambiar logo</button>
                  </div>
                </div>
                <div><GLabel>Nombre legal</GLabel><input className="kq-input" defaultValue="Grupo Vista, S.A." disabled={state==="readonly"} style={{height:50}}/></div>
                <div><GLabel>Nombre comercial</GLabel><input className="kq-input" defaultValue="Inmobiliaria Vista" disabled={state==="readonly"} style={{height:50}}/></div>
                <div><GLabel>Dirección</GLabel><input className="kq-input" defaultValue="Zona 10, Ciudad de Guatemala" disabled={state==="readonly"} style={{height:50}}/></div>
                <div><GLabel>Teléfono</GLabel><input className="kq-input" defaultValue="2234 5678" disabled={state==="readonly"} style={{height:50}}/></div>
              </div>

              <label style={{display:"flex", alignItems:"center", gap:11, marginTop:20, cursor:"pointer"}}>
                <input type="checkbox" defaultChecked disabled={state==="readonly"}
                  style={{width:18, height:18, accentColor:"var(--lav-600)"}}/>
                <span style={{font:"var(--text-body-sm)", color:"var(--fg)"}}>Mostrar a los empleados en el perfil público de la empresa</span>
              </label>

              {state!=="readonly" && (
                <div style={{marginTop:24}}>
                  <button className="kq-btn kq-btn--action">Guardar cambios</button>
                </div>
              )}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

/* ---------- 2) /company/equipo ---------- */
const gMembers = [
  {init:"AM", name:"Andrea Móvil", email:"andrea@vista.com", admin:true, status:"Activo", used:8, limit:null, self:true},
  {init:"CR", name:"Carlos Ramírez", email:"carlos@vista.com", status:"Activo", used:5, limit:10},
  {init:"LM", name:"Lucía Martínez", email:"lucia@vista.com", status:"Activo", used:3, limit:6},
  {init:"JP", name:"Jorge Pérez", email:"jorge@vista.com", status:"Activo", used:0, limit:4},
];
const gPending = [
  {init:"MS", name:"María Solís", email:"maria@vista.com"},
];

function GTag({children, tone}) {
  const map = {
    admin:{bg:"var(--lav-500)", c:"#fff"},
    status:{bg:"var(--surface-sunk)", c:"var(--fg-muted)"},
    pending:{bg:"var(--warning-bg)", c:"#9a5a12"},
  };
  const s = map[tone]||map.status;
  return <span style={{font:"var(--text-caption)", fontWeight:700, padding:"2px 9px", borderRadius:"999px",
    background:s.bg, color:s.c}}>{children}</span>;
}

function CompanyTeamScreen() {
  return (
    <div style={{width:"100%", height:"100%", overflowY:"auto", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <div style={{maxWidth:960, margin:"0 auto", padding:"28px 28px 64px"}}>
        {/* Top */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          flexWrap:"wrap", marginBottom:22}}>
          <a href="#" style={{display:"inline-flex", alignItems:"center", gap:8, font:"var(--text-label)",
            color:"var(--lav-700)", textDecoration:"none"}}><i className="fas fa-arrow-left"></i> Mi empresa</a>
          <span style={{display:"inline-flex", alignItems:"center", gap:7, padding:"6px 15px", borderRadius:"999px",
            background:"var(--navy-800)", color:"var(--cream)", font:"var(--text-label)"}}>
            <i className="fas fa-users" style={{fontSize:12, color:"var(--green-400)"}}></i> 4 de 6 miembros</span>
        </div>

        {/* Miembros (tabla densa) */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
          boxShadow:"var(--shadow-sm)", overflow:"hidden", marginBottom:24}}>
          <div style={{padding:"18px 22px", borderBottom:"1px solid var(--border)"}}>
            <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:18, color:"var(--fg-strong)", margin:0}}>Miembros del equipo</h3>
          </div>
          {/* head */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 200px 110px", gap:16, padding:"10px 22px",
            background:"var(--surface-sunk)", font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
            textTransform:"uppercase", color:"var(--fg-subtle)"}}>
            <span>Miembro</span><span>Límite de publicaciones</span><span style={{textAlign:"right"}}>Acción</span>
          </div>
          {gMembers.map((m,i)=>(
            <div key={m.email} style={{display:"grid", gridTemplateColumns:"1fr 200px 110px", gap:16,
              padding:"15px 22px", alignItems:"center",
              borderTop: i>0?"1px solid var(--border)":"none"}}>
              <div style={{display:"flex", alignItems:"center", gap:13, minWidth:0}}>
                <div style={{width:44, height:44, borderRadius:"999px", flexShrink:0,
                  background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-display)", fontWeight:700, fontSize:15}}>{m.init}</div>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex", alignItems:"center", gap:7, flexWrap:"wrap"}}>
                    <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{m.name}</span>
                    {m.admin && <GTag tone="admin">Admin</GTag>}
                  </div>
                  <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>{m.email}</div>
                </div>
              </div>
              <div>
                <div style={{display:"flex", gap:7}}>
                  <input className="kq-input" type="number" defaultValue={m.limit??""} placeholder="Plan"
                    style={{height:40, width:84, padding:"0 10px"}}/>
                  <button className="kq-btn kq-btn--outline kq-btn--sm">Guardar</button>
                </div>
                <div style={{font:"var(--text-caption)", color:"var(--fg-subtle)", marginTop:5}}>
                  Usadas: {m.used}{m.limit!=null?` / ${m.limit}`:""}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {!m.admin && !m.self
                  ? <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{color:"var(--danger)", display:"inline-flex", gap:6}}>
                      <i className="fas fa-user-times" style={{fontSize:12}}></i> Quitar</button>
                  : <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>—</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Pendientes */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
          boxShadow:"var(--shadow-sm)", padding:"22px", marginBottom:24}}>
          <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:18, color:"var(--fg-strong)", margin:"0 0 14px"}}>Invitaciones pendientes</h3>
          {gPending.map(p=>(
            <div key={p.email} style={{display:"flex", alignItems:"center", gap:13, padding:"12px 0"}}>
              <div style={{width:40, height:40, borderRadius:"999px", flexShrink:0,
                background:"var(--surface-sunk)", color:"var(--fg-muted)", display:"flex",
                alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontWeight:700, fontSize:14}}>{p.init}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{p.name}</span>
                  <GTag tone="pending">Pendiente</GTag>
                </div>
                <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>{p.email}</div>
              </div>
              <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{color:"var(--danger)", display:"flex", gap:6}}>
                <i className="fas fa-times"></i> Cancelar</button>
            </div>
          ))}
        </div>

        {/* Invitar — dos columnas */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
          boxShadow:"var(--shadow-sm)", padding:"26px"}}>
          <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:18, color:"var(--fg-strong)", margin:"0 0 4px"}}>Sumar miembros</h3>
          <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"0 0 20px"}}>Te quedan 2 espacios en tu plan.</p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>
            {/* Buscar existente */}
            <div>
              <h4 style={{font:"var(--text-label)", color:"var(--fg-strong)", margin:"0 0 10px"}}>Buscar un usuario de Kiosqui</h4>
              <div style={{display:"flex", alignItems:"center", gap:9, height:48, padding:"0 14px",
                background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"var(--r-sm)"}}>
                <i className="fas fa-search" style={{fontSize:13, color:"var(--fg-subtle)"}}></i>
                <span style={{font:"var(--text-body-sm)", color:"var(--fg-strong)"}}>cami</span>
              </div>
              <div style={{border:"1px solid var(--border)", borderRadius:"var(--r-sm)", marginTop:8, overflow:"hidden"}}>
                {[["Camila Soto","camila@mail.com"],["Camilo Díaz","camilo@mail.com"]].map(([n,e])=>(
                  <div key={e} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
                    padding:"10px 12px", borderBottom:"1px solid var(--border)"}}>
                    <div style={{minWidth:0}}>
                      <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg-strong)"}}>{n}</div>
                      <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>{e}</div>
                    </div>
                    <button className="kq-btn kq-btn--outline kq-btn--sm">Invitar</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Invitar por email */}
            <div>
              <h4 style={{font:"var(--text-label)", color:"var(--fg-strong)", margin:"0 0 10px"}}>Invitar por correo</h4>
              <div style={{display:"flex", gap:10, marginBottom:10}}>
                <input className="kq-input" placeholder="Nombre" style={{height:48}}/>
                <input className="kq-input" placeholder="Apellido" style={{height:48}}/>
              </div>
              <input className="kq-input" type="email" placeholder="correo@empresa.com" style={{height:48, marginBottom:14}}/>
              <button className="kq-btn kq-btn--action" style={{display:"flex", gap:8}}>
                <i className="fas fa-paper-plane" style={{fontSize:13}}></i> Enviar invitación</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {CompanyOwnerScreen, CompanyTeamScreen, gMembers, gPending, GTag, GLabel});

/* ====================================================================
   VERSIONES MOBILE (≤480px) — form a una columna; equipo en cards.
   ==================================================================== */

function MTop({title, back}) {
  return (
    <div style={{height:56, flexShrink:0, display:"flex", alignItems:"center", gap:12, padding:"0 14px",
      borderBottom:"1px solid var(--border)", background:"var(--bg-elevated)", position:"sticky", top:0, zIndex:5}}>
      {back && <button style={{width:36, height:36, borderRadius:"999px", border:"none", flexShrink:0,
        background:"var(--surface-sunk)", color:"var(--fg-strong)", cursor:"pointer"}}>
        <i className="fas fa-arrow-left" style={{fontSize:14}}></i></button>}
      <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:18, color:"var(--fg-strong)"}}>{title}</span>
    </div>
  );
}

/* ---- /company mobile ---- */
function CompanyOwnerMobile() {
  return (
    <div style={{width:"100%", height:"100%", overflowY:"auto", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <MTop title="Mi empresa"/>
      {/* Portada + foto */}
      <div style={{height:120, background:"linear-gradient(120deg,#283a5c,#1e2d4a 55%,#45407e)", position:"relative"}}></div>
      <div style={{padding:"0 18px 40px"}}>
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", marginTop:-52, marginBottom:18}}>
          <div style={{width:104, height:104, borderRadius:"var(--r-lg)", padding:5, position:"relative",
            background:"var(--surface)", boxShadow:"var(--shadow-sm)"}}>
            <div style={{width:"100%", height:"100%", borderRadius:"var(--r-md)",
              background:"linear-gradient(135deg,var(--lav-500),var(--navy-800))", color:"rgba(255,255,255,.9)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:36}}>
              <i className="fas fa-building"></i></div>
            <label style={{position:"absolute", right:-4, bottom:-4, width:34, height:34, borderRadius:"999px",
              background:"var(--green-500)", color:"var(--navy-900)", display:"flex", alignItems:"center",
              justifyContent:"center", border:"3px solid var(--surface)", fontSize:13}}>
              <i className="fas fa-camera"></i></label>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:7, marginTop:12}}>
            <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--fg-strong)"}}>Inmobiliaria Vista</span>
            <i className="fas fa-check-circle" style={{color:"var(--green-600)", fontSize:14}}></i>
          </div>
          <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Grupo Vista, S.A.</div>
        </div>

        <a href="#" style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%",
          padding:"12px", marginBottom:18, borderRadius:"var(--r-md)", background:"var(--accent-soft)",
          color:"var(--lav-700)", font:"var(--text-label)", textDecoration:"none"}}>
          <i className="fas fa-users"></i> Gestionar equipo</a>

        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
          boxShadow:"var(--shadow-sm)", padding:20}}>
          <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:18, color:"var(--fg-strong)", margin:"0 0 4px"}}>Datos de la empresa</h3>
          <GLabel>Nombre legal</GLabel><input className="kq-input" defaultValue="Grupo Vista, S.A." style={{height:48}}/>
          <GLabel>Nombre comercial</GLabel><input className="kq-input" defaultValue="Inmobiliaria Vista" style={{height:48}}/>
          <GLabel>Dirección</GLabel><input className="kq-input" defaultValue="Zona 10, Ciudad de Guatemala" style={{height:48}}/>
          <GLabel>Teléfono</GLabel><input className="kq-input" defaultValue="2234 5678" style={{height:48}}/>
          <label style={{display:"flex", alignItems:"flex-start", gap:10, margin:"18px 0 0", cursor:"pointer"}}>
            <input type="checkbox" defaultChecked style={{width:18, height:18, accentColor:"var(--lav-600)", marginTop:2}}/>
            <span style={{font:"var(--text-body-sm)", color:"var(--fg)"}}>Mostrar a los empleados en el perfil público</span>
          </label>
          <button className="kq-btn kq-btn--action" style={{width:"100%", marginTop:20, justifyContent:"center"}}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

/* ---- /company/equipo mobile (cards en vez de tabla) ---- */
function CompanyTeamMobile() {
  return (
    <div style={{width:"100%", height:"100%", overflowY:"auto", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <MTop title="Equipo" back/>
      <div style={{padding:"16px 18px 40px"}}>
        <div style={{display:"flex", justifyContent:"center", marginBottom:18}}>
          <span style={{display:"inline-flex", alignItems:"center", gap:7, padding:"7px 16px", borderRadius:"999px",
            background:"var(--navy-800)", color:"var(--cream)", font:"var(--text-label)"}}>
            <i className="fas fa-users" style={{fontSize:12, color:"var(--green-400)"}}></i> 4 de 6 miembros</span>
        </div>

        <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:17, color:"var(--fg-strong)", margin:"0 0 12px"}}>Miembros</h3>
        <div style={{display:"flex", flexDirection:"column", gap:12, marginBottom:26}}>
          {gMembers.map(m=>(
            <div key={m.email} style={{background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:"var(--r-md)", boxShadow:"var(--shadow-xs)", padding:"14px 16px"}}>
              <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:12}}>
                <div style={{width:42, height:42, borderRadius:"999px", flexShrink:0,
                  background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-display)", fontWeight:700, fontSize:14}}>{m.init}</div>
                <div style={{minWidth:0, flex:1}}>
                  <div style={{display:"flex", alignItems:"center", gap:7}}>
                    <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{m.name}</span>
                    {m.admin && <GTag tone="admin">Admin</GTag>}
                  </div>
                  <div style={{font:"var(--text-caption)", color:"var(--fg-muted)", whiteSpace:"nowrap",
                    overflow:"hidden", textOverflow:"ellipsis"}}>{m.email}</div>
                </div>
              </div>
              <div style={{display:"flex", alignItems:"flex-end", gap:8, paddingTop:12, borderTop:"1px solid var(--border)"}}>
                <div style={{flex:1}}>
                  <label style={{font:"var(--text-caption)", color:"var(--fg-muted)", display:"block", marginBottom:4}}>Límite de publicaciones</label>
                  <input className="kq-input" type="number" defaultValue={m.limit??""} placeholder="Plan" style={{height:42, width:"100%"}}/>
                </div>
                <button className="kq-btn kq-btn--outline kq-btn--sm" style={{height:42}}>Guardar</button>
                {!m.admin && !m.self && (
                  <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{height:42, color:"var(--danger)", flexShrink:0}}>
                    <i className="fas fa-user-times"></i></button>
                )}
              </div>
              <div style={{font:"var(--text-caption)", color:"var(--fg-subtle)", marginTop:8}}>
                Usadas: {m.used}{m.limit!=null?` / ${m.limit}`:""}</div>
            </div>
          ))}
        </div>

        {/* Pendientes */}
        <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:17, color:"var(--fg-strong)", margin:"0 0 12px"}}>Invitaciones pendientes</h3>
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)",
          padding:"14px 16px", marginBottom:26, display:"flex", alignItems:"center", gap:12}}>
          <div style={{width:40, height:40, borderRadius:"999px", flexShrink:0, background:"var(--surface-sunk)",
            color:"var(--fg-muted)", display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--font-display)", fontWeight:700, fontSize:14}}>MS</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:"flex", alignItems:"center", gap:7}}>
              <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>María Solís</span>
              <GTag tone="pending">Pendiente</GTag>
            </div>
            <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>maria@vista.com</div>
          </div>
          <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{color:"var(--danger)", flexShrink:0}}>
            <i className="fas fa-times"></i></button>
        </div>

        {/* Sumar miembros — apilado */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
          boxShadow:"var(--shadow-sm)", padding:20}}>
          <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:17, color:"var(--fg-strong)", margin:"0 0 14px"}}>Sumar miembros</h3>
          <h4 style={{font:"var(--text-label)", color:"var(--fg-strong)", margin:"0 0 9px"}}>Buscar un usuario de Kiosqui</h4>
          <div style={{display:"flex", alignItems:"center", gap:9, height:46, padding:"0 14px",
            background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"var(--r-sm)", marginBottom:18}}>
            <i className="fas fa-search" style={{fontSize:13, color:"var(--fg-subtle)"}}></i>
            <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Nombre o @usuario…</span>
          </div>
          <h4 style={{font:"var(--text-label)", color:"var(--fg-strong)", margin:"0 0 9px"}}>Invitar por correo</h4>
          <div style={{display:"flex", gap:10, marginBottom:10}}>
            <input className="kq-input" placeholder="Nombre" style={{height:46}}/>
            <input className="kq-input" placeholder="Apellido" style={{height:46}}/>
          </div>
          <input className="kq-input" type="email" placeholder="correo@empresa.com" style={{height:46, marginBottom:14}}/>
          <button className="kq-btn kq-btn--action" style={{width:"100%", justifyContent:"center", display:"flex", gap:8}}>
            <i className="fas fa-paper-plane" style={{fontSize:13}}></i> Enviar invitación</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {CompanyOwnerMobile, CompanyTeamMobile, MTop});
