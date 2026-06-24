/* Batch F — Verificaciones, Denuncias, Usuarios, Admin config. Reusa SupportShell.jsx. */

const fVerifs = [
  {type:"DPI", personal:true, name:"Carlos Ramírez", handle:"carlosramirez", doc:"3012 45678 0101", date:"23 jun"},
  {type:"DPI", personal:true, name:"Lucía Martínez", handle:"luciamz", doc:"2987 11223 0108", date:"23 jun"},
  {type:"RTU", personal:false, name:"Inmobiliaria Vista", handle:"vista", doc:"7654321-0", date:"22 jun"},
  {type:"DPI", personal:true, name:"Jorge Pérez", handle:"jperez", doc:"3045 99887 0101", date:"22 jun"},
];

function VerificationsScreen() {
  return (
    <StaffShell active="verif" title="Verificaciones" sub="Cola de solicitudes de verificación de identidad. Revisá los documentos antes de aprobar.">
      <div style={{marginBottom:18}}>
        <FilterTabs active="pending" tabs={[["pending","Pendientes"],["verified","Aprobadas"],["rejected","Rechazadas"]]}/>
      </div>
      <DataTable cols={[{label:"Tipo"},{label:"Solicitante"},{label:"Documento"},{label:"Archivos"},{label:"Fecha"},{label:"Acciones", right:true}]}>
        {fVerifs.map((v,i)=>(
          <Row key={i}>
            <Cell><span style={{display:"inline-flex", padding:"2px 10px", borderRadius:"999px",
              background: v.personal?"var(--lav-200)":"var(--navy-100)",
              color: v.personal?"var(--lav-700)":"var(--navy-700)", font:"var(--text-caption)", fontWeight:700}}>{v.type}</span></Cell>
            <Cell strong>{v.name} <span style={{color:"var(--accent-hover)", fontWeight:400}}>@{v.handle}</span></Cell>
            <Cell mono muted>{v.doc}</Cell>
            <Cell>
              <span style={{display:"inline-flex", gap:12}}>
                <a href="#" style={{color:"var(--lav-700)", fontWeight:600, textDecoration:"none", display:"inline-flex", gap:5, alignItems:"center"}}><i className="far fa-image" style={{fontSize:12}}></i> {v.personal?"Frente":"RTU"}</a>
                {v.personal && <a href="#" style={{color:"var(--lav-700)", fontWeight:600, textDecoration:"none", display:"inline-flex", gap:5, alignItems:"center"}}><i className="far fa-image" style={{fontSize:12}}></i> Reverso</a>}
              </span>
            </Cell>
            <Cell muted mono>{v.date}</Cell>
            <Cell right>
              <span style={{display:"inline-flex", gap:8, justifyContent:"flex-end"}}>
                <button title="Aprobar" style={{width:34, height:34, borderRadius:"var(--r-sm)", border:"none", cursor:"pointer", background:"var(--green-500)", color:"var(--navy-900)"}}><i className="fas fa-check"></i></button>
                <button title="Rechazar" style={{width:34, height:34, borderRadius:"var(--r-sm)", border:"none", cursor:"pointer", background:"var(--danger)", color:"#fff"}}><i className="fas fa-times"></i></button>
              </span>
            </Cell>
          </Row>
        ))}
      </DataTable>
      <p style={{font:"var(--text-caption)", color:"var(--fg-subtle)", marginTop:14, display:"flex", gap:7, alignItems:"center"}}>
        <i className="fas fa-lock"></i> Los documentos son privados y solo se usan para validar identidad.</p>
    </StaffShell>
  );
}

const fReports = [
  {id:88, pub:"Casa moderna con jardín", reason:"Precio engañoso", reporter:"Lucía M.", count:3, date:"23 jun"},
  {id:87, pub:"Terreno residencial plano", reason:"Publicación duplicada", reporter:"Jorge P.", count:1, date:"22 jun"},
  {id:85, pub:"Apartamento amueblado", reason:"Contenido inapropiado", reporter:"María S.", count:2, date:"21 jun"},
];
function ReportsScreen() {
  return (
    <StaffShell active="reports" title="Denuncias" sub="Publicaciones reportadas por la comunidad. Revisá y resolvé.">
      <div style={{marginBottom:18}}>
        <FilterTabs active="open" tabs={[["open","Pendientes"],["resolved","Resueltas"],["dismissed","Descartadas"]]}/>
      </div>
      <DataTable cols={[{label:"#"},{label:"Publicación"},{label:"Motivo"},{label:"Reportes"},{label:"Último reporte por"},{label:"Fecha"},{label:"Acciones", right:true}]}>
        {fReports.map(r=>(
          <Row key={r.id}>
            <Cell mono muted>#{r.id}</Cell>
            <Cell strong>{r.pub}</Cell>
            <Cell><StatusChip s="open"><i className="fas fa-flag" style={{fontSize:9}}></i> {r.reason}</StatusChip></Cell>
            <Cell><span style={{display:"inline-flex", minWidth:24, justifyContent:"center", padding:"2px 8px", borderRadius:"999px", background:"var(--danger-bg)", color:"var(--danger)", font:"var(--text-caption)", fontWeight:700}}>{r.count}</span></Cell>
            <Cell muted>{r.reporter}</Cell>
            <Cell muted mono>{r.date}</Cell>
            <Cell right>
              <span style={{display:"inline-flex", gap:8, justifyContent:"flex-end"}}>
                <button className="kq-btn kq-btn--outline kq-btn--sm">Ver</button>
                <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{color:"var(--danger)"}}>Ocultar pub.</button>
              </span>
            </Cell>
          </Row>
        ))}
      </DataTable>
    </StaffShell>
  );
}

const fUsers = [
  {init:"AR", name:"Ana Rodríguez", handle:"anarodriguez", email:"ana@kiosqui.com", role:"admin", status:"active", pubs:12},
  {init:"AM", name:"Andrea Móvil", handle:"andreamovil", email:"andrea@kiosqui.com", role:"support", status:"active", pubs:24},
  {init:"CR", name:"Carlos Ramírez", handle:"carlosramirez", email:"carlos@gmail.com", role:"user", status:"active", pubs:5},
  {init:"JP", name:"Jorge Pérez", handle:"jperez", email:"jorge@gmail.com", role:"user", status:"suspended", pubs:2},
  {init:"XX", name:"Cuenta Spam", handle:"spam123", email:"spam@temp.com", role:"user", status:"banned", pubs:0},
];
function UsersScreen() {
  return (
    <StaffShell active="users" title="Usuarios" sub="Gestión de cuentas, roles y estados."
      actions={<div style={{display:"flex", alignItems:"center", gap:10, height:44, padding:"0 16px", background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"999px", minWidth:260}}>
        <i className="fas fa-search" style={{fontSize:13, color:"var(--fg-subtle)"}}></i>
        <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Buscar por nombre, @usuario o correo…</span></div>}>
      <div style={{marginBottom:18}}>
        <FilterTabs active="" tabs={[["","Todos"],["active","Activos"],["suspended","Suspendidos"],["banned","Baneados"],["staff","Staff"]]}/>
      </div>
      <DataTable cols={[{label:"Usuario"},{label:"Correo"},{label:"Rol"},{label:"Estado"},{label:"Pub.", right:true},{label:"Acciones", right:true}]}>
        {fUsers.map(u=>(
          <Row key={u.handle}>
            <Cell><span style={{display:"inline-flex", alignItems:"center", gap:11}}>
              <Av init={u.init} sm/>
              <span><span style={{display:"block", fontWeight:600, color:"var(--fg-strong)"}}>{u.name}</span>
              <span style={{color:"var(--accent-hover)", fontSize:12}}>@{u.handle}</span></span></span></Cell>
            <Cell muted>{u.email}</Cell>
            <Cell><RoleBadge r={u.role}/></Cell>
            <Cell><StatusChip s={u.status}/></Cell>
            <Cell right mono muted>{u.pubs}</Cell>
            <Cell right><button style={{width:34, height:34, borderRadius:"var(--r-sm)", border:"1.5px solid var(--border-strong)", background:"var(--surface)", color:"var(--fg-muted)", cursor:"pointer"}}><i className="fas fa-ellipsis-h"></i></button></Cell>
          </Row>
        ))}
      </DataTable>
    </StaffShell>
  );
}

function AdminConfigScreen() {
  const Group = ({title, children}) => (
    <div style={{border:"1px solid var(--border)", borderRadius:"var(--r-lg)", background:"var(--surface)",
      boxShadow:"var(--shadow-sm)", padding:24, marginBottom:20}}>
      <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:18, color:"var(--fg-strong)", margin:"0 0 18px"}}>{title}</h3>
      <div style={{display:"flex", flexDirection:"column", gap:16}}>{children}</div>
    </div>
  );
  const Toggle = ({label, sub, on}) => (
    <div style={{display:"flex", alignItems:"center", gap:16}}>
      <div style={{flex:1}}>
        <div style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{label}</div>
        {sub && <div style={{font:"var(--text-caption)", color:"var(--fg-muted)", marginTop:2}}>{sub}</div>}
      </div>
      <div style={{width:46, height:26, borderRadius:"999px", padding:3, cursor:"pointer", flexShrink:0,
        background: on?"var(--green-500)":"var(--border-strong)",
        display:"flex", justifyContent: on?"flex-end":"flex-start"}}>
        <div style={{width:20, height:20, borderRadius:"999px", background:"#fff", boxShadow:"var(--shadow-xs)"}}></div>
      </div>
    </div>
  );
  const NumF = ({label, value, unit}) => (
    <div style={{display:"flex", alignItems:"center", gap:16}}>
      <div style={{flex:1, font:"var(--text-label)", color:"var(--fg-strong)"}}>{label}</div>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <input className="kq-input" defaultValue={value} style={{width:110, height:44, textAlign:"right"}}/>
        {unit && <span style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", minWidth:40}}>{unit}</span>}
      </div>
    </div>
  );
  return (
    <StaffShell active="admin" title="Configuración del sistema" sub="Parámetros globales de Kiosqui."
      actions={<button className="kq-btn kq-btn--action">Guardar cambios</button>}>
      <div style={{maxWidth:680}}>
        <Group title="Publicaciones">
          <NumF label="Máximo de fotos por publicación" value="24" unit="fotos"/>
          <NumF label="Tamaño máximo por imagen" value="10" unit="MB"/>
          <Toggle label="Requerir verificación para publicar" sub="El usuario debe tener DPI aprobado." on/>
          <Toggle label="Revisar publicaciones antes de publicar" sub="Cola de moderación previa." />
        </Group>
        <Group title="Pauta">
          <NumF label="Costo por mil impresiones (CPM)" value="35" unit="Q"/>
          <NumF label="Recarga mínima de saldo" value="50" unit="Q"/>
          <Toggle label="Crédito de referidos activo" sub="Q50 al invitador e invitado en la primera compra." on/>
        </Group>
        <Group title="Modelo 3D (Premium)">
          <Toggle label="Habilitar modelo 3D" sub="Función premium para destacar inmuebles." on/>
          <NumF label="Precio del complemento 3D" value="99" unit="Q"/>
        </Group>
      </div>
    </StaffShell>
  );
}

Object.assign(window, {VerificationsScreen, ReportsScreen, UsersScreen, AdminConfigScreen, fVerifs, fReports, fUsers});

/* ---------- Admin · Imágenes del sitio (CMS-lite) ---------- */
const fAssets = [
  {key:"home_hero", label:"Banner principal (home)", w:1920, h:640, by:"Ana R.", date:"20 jun", ph:"linear-gradient(135deg,#283a5c,#45407e)"},
  {key:"home_cta", label:"Banner CTA publicar", w:1200, h:400, by:"Ana R.", date:"18 jun", ph:"linear-gradient(135deg,#84ad3f,#5c7c28)"},
  {key:"auth_side", label:"Lateral de login/registro", w:960, h:1080, by:"Andrea M.", date:"15 jun", ph:"linear-gradient(135deg,#6d62cf,#45407e)"},
  {key:"about_cover", label:"Portada — Sobre nosotros", w:1600, h:600, by:null, date:"10 jun", ph:"linear-gradient(135deg,#344a72,#161f33)"},
  {key:"pauta_promo", label:"Promo de pauta", w:1200, h:628, empty:true},
  {key:"app_banner", label:"Banner app móvil", w:1080, h:1080, by:"Diego V.", date:"08 jun", ph:"linear-gradient(135deg,#8a7fe3,#5b54a8)"},
];

function ImagesScreen() {
  return (
    <StaffShell active="images" title="Imágenes del sitio" sub="Reemplazá banners e imágenes destacadas. Se preservan las proporciones; subí el mismo tamaño recomendado.">
      <div style={{display:"flex", alignItems:"flex-start", gap:11, padding:"14px 18px", marginBottom:22,
        borderRadius:"var(--r-md)", background:"var(--accent-soft)", color:"var(--fg)"}}>
        <i className="fas fa-circle-info" style={{color:"var(--lav-700)", marginTop:2}}></i>
        <span style={{font:"var(--text-body-sm)"}}>Estas imágenes se muestran en el sitio público. Subí archivos optimizados (JPG/PNG/WebP) en la resolución recomendada de cada espacio.</span>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:18}}>
        {fAssets.map(a=>(
          <div key={a.key} style={{border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
            background:"var(--surface)", boxShadow:"var(--shadow-sm)", overflow:"hidden",
            display:"flex", flexDirection:"column"}}>
            <div style={{aspectRatio:"16 / 9", background: a.empty?"var(--surface-sunk)":a.ph,
              display:"flex", alignItems:"center", justifyContent:"center",
              color: a.empty?"var(--fg-subtle)":"rgba(255,255,255,.55)", position:"relative"}}>
              {a.empty
                ? <div style={{textAlign:"center"}}><i className="fas fa-image" style={{fontSize:34}}></i>
                    <div style={{font:"var(--text-caption)", marginTop:6}}>Sin imagen</div></div>
                : <i className="fas fa-image" style={{fontSize:30}}></i>}
            </div>
            <div style={{padding:"14px 16px", display:"flex", flexDirection:"column", gap:5, flex:1}}>
              <code style={{alignSelf:"flex-start", font:"var(--text-caption)", fontFamily:"var(--font-mono)",
                color:"var(--lav-700)", background:"var(--lav-100)", padding:"2px 8px", borderRadius:"var(--r-xs)"}}>{a.key}</code>
              <strong style={{font:"var(--text-body-sm)", color:"var(--fg-strong)", marginTop:2}}>{a.label}</strong>
              <span style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>{a.w}×{a.h} px recomendado</span>
              <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)", marginTop:"auto", paddingTop:6}}>
                {a.by ? <>Actualizada por {a.by} · {a.date}</> : "Nunca actualizada"}</span>
            </div>
            <div style={{padding:"0 16px 16px"}}>
              <button className="kq-btn kq-btn--outline kq-btn--sm" style={{width:"100%", display:"flex", gap:8}}>
                <i className="fas fa-upload" style={{fontSize:12}}></i> Cambiar imagen</button>
            </div>
          </div>
        ))}
      </div>
    </StaffShell>
  );
}

Object.assign(window, {ImagesScreen, fAssets});
