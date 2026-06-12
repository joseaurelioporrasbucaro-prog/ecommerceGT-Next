/* Card v2 — propuestas con la FOTO como protagonista.
   Ratio propuesto: 3:2 (ver handoff: fallback = variant detail 1600×900 recortado por CSS). */

const cvPhotos = [
  "linear-gradient(160deg,#3a4f78 0%,#23344f 55%,#1a2538 100%)",
  "linear-gradient(160deg,#7e74d8 0%,#564e9e 60%,#3f3a78 100%)",
  "linear-gradient(160deg,#93b855 0%,#6f9433 60%,#55742a 100%)",
];

/* Foto placeholder con ratio fijo */
function CvPhoto({i=0, ratio="66.67%", children}) {
  return (
    <div style={{position:"relative", width:"100%", paddingTop:ratio, background:cvPhotos[i%3],
      overflow:"hidden"}}>
      <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center",
        justifyContent:"center", color:"rgba(255,255,255,.4)"}}>
        <i className="fas fa-camera" style={{fontSize:26}}></i></div>
      {children}
    </div>
  );
}

/* Badge compacto v2: solo para Destacado/Nuevo. 22px alto, dot + texto. */
function CvBadge({children, feat}) {
  return (
    <span style={{position:"absolute", top:10, left:10, display:"inline-flex", alignItems:"center",
      gap:6, height:24, padding:"0 10px", borderRadius:"999px",
      background: feat ? "rgba(109,98,207,.92)" : "rgba(17,24,42,.55)",
      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
      color:"#fff", fontSize:11, fontWeight:700, fontFamily:"var(--font-body)",
      letterSpacing:".02em"}}>
      {feat && <i className="fas fa-star" style={{fontSize:9}}></i>}{children}</span>
  );
}

function CvFav({saved}) {
  return (
    <button style={{position:"absolute", top:8, right:8, width:32, height:32, borderRadius:"999px",
      border:"none", cursor:"pointer", background:"rgba(17,24,42,.4)",
      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
      color: saved ? "#ff7a7a" : "#fff",
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:13}}>
      <i className={(saved?"fas":"far")+" fa-heart"}></i></button>
  );
}

/* ============ VARIANTE A — Overlay: precio sobre la foto ============ */
function CardA({feat, saved}) {
  return (
    <div style={{width:300, background:"var(--surface)", borderRadius:"var(--r-lg)", overflow:"hidden",
      border:"1px solid var(--border)",
      boxShadow: feat ? "0 0 0 1.5px var(--lav-400), var(--shadow-sm)" : "var(--shadow-sm)",
      cursor:"pointer"}}>
      <CvPhoto i={feat?1:0}>
        {feat && <CvBadge feat>Destacado</CvBadge>}
        <CvFav saved={saved}/>
        {/* Protección inferior + precio sobre la foto */}
        <div style={{position:"absolute", left:0, right:0, bottom:0, height:"52%",
          background:"linear-gradient(180deg, transparent, rgba(13,19,33,.78))"}}/>
        <div style={{position:"absolute", left:14, right:14, bottom:11}}>
          <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:21, color:"#fff",
            textShadow:"0 1px 8px rgba(0,0,0,.3)", letterSpacing:"-.01em"}}>Q 1,850,000</div>
          <div style={{display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,.85)",
            fontSize:13, fontFamily:"var(--font-body)", marginTop:2}}>
            <i className="fas fa-map-marker-alt" style={{fontSize:11}}></i> Zona 14, Guatemala</div>
        </div>
      </CvPhoto>
      <div style={{padding:"11px 14px 13px", display:"flex", alignItems:"center",
        justifyContent:"space-between", gap:10}}>
        <span style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>Casa moderna con jardín</span>
        <span style={{display:"flex", gap:12, font:"var(--text-body-sm)", color:"var(--fg-muted)",
          whiteSpace:"nowrap", flexShrink:0}}>
          <span><i className="fas fa-bed" style={{marginRight:5, color:"var(--navy-400)", fontSize:12}}></i>3</span>
          <span><i className="fas fa-bath" style={{marginRight:5, color:"var(--navy-400)", fontSize:12}}></i>2.5</span>
          <span><i className="fas fa-vector-square" style={{marginRight:5, color:"var(--navy-400)", fontSize:12}}></i>180</span>
        </span>
      </div>
    </div>
  );
}

/* ============ VARIANTE B — Foto limpia, cuerpo compacto debajo ============ */
function CardB({feat, saved}) {
  return (
    <div style={{width:300, background:"var(--surface)", borderRadius:"var(--r-lg)", overflow:"hidden",
      border:"1px solid var(--border)",
      boxShadow: feat ? "0 0 0 1.5px var(--lav-400), var(--shadow-sm)" : "var(--shadow-sm)",
      cursor:"pointer"}}>
      <CvPhoto i={feat?1:2}>
        {feat && <CvBadge feat>Destacado</CvBadge>}
        <CvFav saved={saved}/>
      </CvPhoto>
      <div style={{padding:"12px 14px 14px"}}>
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8}}>
          <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20,
            color:"var(--fg-strong)", letterSpacing:"-.01em", whiteSpace:"nowrap"}}>Q 1,850,000</span>
          <span style={{display:"flex", gap:11, font:"var(--text-body-sm)", color:"var(--fg-muted)",
            whiteSpace:"nowrap"}}>
            <span>3 hab</span><span>2.5 b</span><span>180 m²</span>
          </span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:6, font:"var(--text-body-sm)",
          color:"var(--fg-muted)", marginTop:4}}>
          <i className="fas fa-map-marker-alt" style={{fontSize:11, color:"var(--accent-hover)"}}></i>
          Casa moderna con jardín · Zona 14</div>
      </div>
    </div>
  );
}

/* ============ Patrocinada con CTA del sistema ============ */
function CardSponsored() {
  return (
    <div style={{width:300, background:"var(--surface)", borderRadius:"var(--r-lg)", overflow:"hidden",
      border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)", cursor:"pointer"}}>
      <CvPhoto i={0}>
        <CvBadge>Patrocinado</CvBadge>
        <CvFav/>
        <div style={{position:"absolute", left:0, right:0, bottom:0, height:"52%",
          background:"linear-gradient(180deg, transparent, rgba(13,19,33,.78))"}}/>
        <div style={{position:"absolute", left:14, right:14, bottom:11}}>
          <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:21, color:"#fff",
            textShadow:"0 1px 8px rgba(0,0,0,.3)"}}>Q 2,650,000</div>
          <div style={{display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,.85)",
            fontSize:13, fontFamily:"var(--font-body)", marginTop:2}}>
            <i className="fas fa-map-marker-alt" style={{fontSize:11}}></i> Zona 16, Guatemala</div>
        </div>
      </CvPhoto>
      <div style={{padding:"11px 14px 13px"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
          marginBottom:10}}>
          <span style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>Casa en condominio</span>
          <span style={{display:"flex", gap:12, font:"var(--text-body-sm)", color:"var(--fg-muted)",
            whiteSpace:"nowrap", flexShrink:0}}>
            <span><i className="fas fa-bed" style={{marginRight:5, color:"var(--navy-400)", fontSize:12}}></i>4</span>
            <span><i className="fas fa-bath" style={{marginRight:5, color:"var(--navy-400)", fontSize:12}}></i>3.5</span>
          </span>
        </div>
        <button className="kq-btn kq-btn--action kq-btn--sm" style={{width:"100%",
          justifyContent:"center", display:"flex", gap:7}}>
          <i className="fas fa-comments" style={{fontSize:12}}></i> Enviar mensaje</button>
      </div>
    </div>
  );
}

/* ============ /my-publications — fila de propietario ============ */
function OwnerRow({status, dot, dim, actions}) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:16, padding:"14px 16px",
      background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)",
      boxShadow:"var(--shadow-xs)"}}>
      <div style={{width:104, height:70, borderRadius:"var(--r-sm)", flexShrink:0, position:"relative",
        background:cvPhotos[0], overflow:"hidden",
        filter: dim ? "saturate(.35) brightness(.85)" : "none"}}>
        <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", color:"rgba(255,255,255,.4)"}}>
          <i className="fas fa-camera" style={{fontSize:16}}></i></div>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:3}}>
          <span style={{font:"var(--text-label)", fontSize:15, color:"var(--fg-strong)",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>Casa moderna con jardín</span>
          <span style={{display:"inline-flex", alignItems:"center", gap:6, height:22, padding:"0 10px",
            borderRadius:"999px", background:"var(--surface-sunk)", flexShrink:0,
            border:"1px solid var(--border)", fontSize:11, fontWeight:700, color:"var(--fg-muted)"}}>
            <span style={{width:6, height:6, borderRadius:"50%", background:dot}}></span>{status}</span>
        </div>
        <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Q 1,850,000 · Zona 14 · Publicada 12 may 2026</div>
        <div style={{display:"flex", gap:16, font:"var(--text-caption)", color:"var(--fg-subtle)", marginTop:4}}>
          <span><i className="far fa-eye" style={{marginRight:5}}></i>248 vistas</span>
          <span><i className="far fa-heart" style={{marginRight:5}}></i>16 favoritos</span>
          <span><i className="far fa-comments" style={{marginRight:5}}></i>5 consultas</span>
        </div>
      </div>
      <div style={{display:"flex", gap:8, flexShrink:0}}>
        {actions.map(([ic,label,kind])=>(
          <button key={label} title={label} className={"kq-btn kq-btn--sm "+(kind==="primary"?"kq-btn--action":"kq-btn--outline")}
            style={{display:"flex", gap:7, ...(kind==="danger"?{color:"var(--danger)", borderColor:"var(--danger-bg)"}:{})}}>
            <i className={"fas "+ic} style={{fontSize:12}}></i> {label}</button>
        ))}
      </div>
    </div>
  );
}

function MyPubsBoard() {
  return (
    <div style={{display:"flex", flexDirection:"column", gap:12, width:"100%"}}>
      <OwnerRow status="Activa" dot="var(--green-600)"
        actions={[["fa-pen","Editar","outline"],["fa-bullhorn","Pautar","primary"],["fa-handshake","Cerrar venta","outline"]]}/>
      <OwnerRow status="Borrador" dot="var(--ink-400)"
        actions={[["fa-pen","Editar","outline"],["fa-paper-plane","Publicar","primary"],["fa-trash","Eliminar","danger"]]}/>
      <OwnerRow status="Vendida" dot="var(--navy-500)" dim
        actions={[["fa-rotate-left","Republicar","outline"],["fa-trash","Eliminar","danger"]]}/>
    </div>
  );
}

Object.assign(window, {CardA, CardB, CardSponsored, OwnerRow, MyPubsBoard, CvPhoto, CvBadge, CvFav});
