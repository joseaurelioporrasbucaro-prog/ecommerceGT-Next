/* Batch C v2 — Pauta estilo "saldo + campaña" (modelo FB Ads) e Invite con crédito Q50.
   Reemplaza el modelo de planes fijos.
   Modelo: el usuario RECARGA saldo (tarjeta) y lo INVIERTE en una campaña con objetivo
   (impresiones = alcance+posición destacada · mensajes = botón enviar mensaje+posición).
   El monto invertido genera un ESTIMADO de impresiones. */

function fmtQ(n){ return "Q " + n.toLocaleString("es-GT"); }

/* ---------- PAUTA: constructor de campaña ---------- */
function PautaScreen() {
  const [objetivo, setObjetivo] = React.useState("impresiones");
  const [monto, setMonto] = React.useState(120);
  // estimado cosmético: ~75 impresiones por Q en impresiones, ~52 en mensajes (incluye CTA)
  const factor = objetivo === "impresiones" ? 75 : 52;
  const lo = Math.round(monto * factor * 0.85);
  const hi = Math.round(monto * factor * 1.15);
  const saldo = 90; // saldo disponible (incluye Q50 de referidos)

  const Obj = ({id, icon, title, desc}) => (
    <button onClick={()=>setObjetivo(id)} style={{textAlign:"left", cursor:"pointer",
      display:"flex", gap:13, padding:"16px 16px", borderRadius:"var(--r-md)",
      background: objetivo===id ? "var(--lav-100)" : "var(--surface)",
      border: objetivo===id ? "2px solid var(--lav-500)" : "1.5px solid var(--border)"}}>
      <span style={{width:42, height:42, borderRadius:"var(--r-md)", flexShrink:0,
        background: objetivo===id ? "var(--lav-500)" : "var(--surface-sunk)",
        color: objetivo===id ? "#fff" : "var(--fg-muted)",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:16}}>
        <i className={"fas "+icon}></i></span>
      <span>
        <span style={{display:"block", font:"var(--text-label)", fontSize:14.5, color:"var(--fg-strong)"}}>{title}</span>
        <span style={{display:"block", font:"var(--text-body-sm)", color:"var(--fg-muted)", marginTop:2, lineHeight:1.4}}>{desc}</span>
      </span>
    </button>
  );

  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <PageHead overline="Pauta" title="Invertí en visibilidad"
        sub="Recargá tu saldo y usalo para que más personas vean tu propiedad y te escriban."/>
      <div style={{maxWidth:1040, margin:"0 auto", padding:"0 28px 48px",
        display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24, alignItems:"start"}}>

        {/* Columna izquierda: campaña */}
        <div style={{display:"flex", flexDirection:"column", gap:18}}>
          {/* Publicación */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
            padding:"18px 20px", boxShadow:"var(--shadow-xs)"}}>
            <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
              textTransform:"uppercase", color:"var(--fg-subtle)", marginBottom:12}}>1 · Publicación a promocionar</div>
            <div style={{display:"flex", alignItems:"center", gap:14}}>
              <div style={{width:72, height:52, borderRadius:"var(--r-sm)", flexShrink:0,
                background:"linear-gradient(135deg,#283a5c,#1e2d4a)", display:"flex",
                alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.4)"}}>
                <i className="fas fa-camera" style={{fontSize:14}}></i></div>
              <div style={{flex:1}}>
                <div style={{font:"var(--text-label)", fontSize:15, color:"var(--fg-strong)"}}>Casa moderna con jardín</div>
                <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Q 1,850,000 · Zona 14</div>
              </div>
              <button className="kq-btn kq-btn--outline kq-btn--sm">Cambiar</button>
            </div>
          </div>

          {/* Objetivo */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
            padding:"18px 20px", boxShadow:"var(--shadow-xs)"}}>
            <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
              textTransform:"uppercase", color:"var(--fg-subtle)", marginBottom:12}}>2 · Objetivo</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <Obj id="impresiones" icon="fa-chart-line" title="Más impresiones"
                desc="Alcance amplio + posición destacada en listados."/>
              <Obj id="mensajes" icon="fa-comments" title="Más mensajes"
                desc="Botón Enviar mensaje + posición destacada."/>
            </div>
          </div>

          {/* Inversión */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
            padding:"18px 20px", boxShadow:"var(--shadow-xs)"}}>
            <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
              textTransform:"uppercase", color:"var(--fg-subtle)", marginBottom:14}}>3 · Cuánto invertir</div>
            <div style={{display:"flex", alignItems:"baseline", gap:8, marginBottom:14}}>
              <span style={{fontFamily:"var(--font-display)", fontWeight:500, fontSize:18, color:"var(--fg-subtle)"}}>Q</span>
              <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:38,
                color:"var(--fg-strong)", letterSpacing:"-.02em"}}>{monto}</span>
            </div>
            <input type="range" min="20" max="500" step="10" value={monto}
              onChange={e=>setMonto(+e.target.value)}
              style={{width:"100%", accentColor:"var(--green-600)", marginBottom:8}}/>
            <div style={{display:"flex", justifyContent:"space-between", font:"var(--text-caption)", color:"var(--fg-subtle)"}}>
              <span>Q 20</span><span>Q 500</span></div>
            {/* Estimado */}
            <div style={{display:"flex", alignItems:"center", gap:13, marginTop:16, padding:"14px 16px",
              background:"var(--lav-100)", borderRadius:"var(--r-md)"}}>
              <i className="fas fa-bolt" style={{color:"var(--lav-700)", fontSize:18}}></i>
              <div>
                <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Estimado con {fmtQ(monto)}</div>
                <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:18, color:"var(--fg-strong)"}}>
                  {lo.toLocaleString("es-GT")}–{hi.toLocaleString("es-GT")} {objetivo==="impresiones" ? "impresiones" : "personas alcanzadas"}</div>
              </div>
            </div>
            <div style={{font:"var(--text-caption)", color:"var(--fg-subtle)", marginTop:8}}>
              El estimado es aproximado y depende de la zona y la competencia.</div>
          </div>

          {/* Segmentación */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
            padding:"18px 20px", boxShadow:"var(--shadow-xs)"}}>
            <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
              textTransform:"uppercase", color:"var(--fg-subtle)", marginBottom:4}}>4 · Segmentación</div>
            <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", marginBottom:14}}>
              ¿A quién querés mostrarle la publicación? Dejá en “Todos” para no segmentar.</div>

            {/* Ubicación */}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12}}>
              <div className="kq-field">
                <label>Departamento</label>
                <div style={{position:"relative"}}>
                  <select className="kq-input" style={{appearance:"none", cursor:"pointer"}}>
                    <option>Todos</option><option>Guatemala</option><option>Sacatepéquez</option>
                    <option>Quetzaltenango</option><option>Escuintla</option><option>Petén</option>
                  </select>
                  <i className="fas fa-chevron-down" style={{position:"absolute", right:14, top:"50%",
                    transform:"translateY(-50%)", fontSize:11, color:"var(--fg-subtle)", pointerEvents:"none"}}></i>
                </div>
              </div>
              <div className="kq-field">
                <label>Municipio</label>
                <div style={{position:"relative"}}>
                  <select className="kq-input" style={{appearance:"none", cursor:"pointer"}} defaultValue="Zona 14">
                    <option>Todos</option><option>Guatemala</option><option>Mixco</option>
                    <option>Villa Nueva</option><option>Santa Catarina Pinula</option>
                  </select>
                  <i className="fas fa-chevron-down" style={{position:"absolute", right:14, top:"50%",
                    transform:"translateY(-50%)", fontSize:11, color:"var(--fg-subtle)", pointerEvents:"none"}}></i>
                </div>
              </div>
            </div>

            {/* Edad */}
            <label className="kq-label" style={{display:"block", marginBottom:6}}>Rango de edad</label>
            <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:14}}>
              <input className="kq-input" type="number" defaultValue="25" style={{width:88, textAlign:"center"}}/>
              <span style={{height:1.5, flex:1, background:"var(--border-strong)"}}></span>
              <input className="kq-input" type="number" defaultValue="55" style={{width:88, textAlign:"center"}}/>
              <span style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", whiteSpace:"nowrap"}}>años</span>
            </div>

            {/* Fechas */}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <div className="kq-field"><label>Inicio</label><input className="kq-input" type="date" defaultValue="2026-06-15"/></div>
              <div className="kq-field"><label>Fin (opcional)</label><input className="kq-input" type="date"/></div>
            </div>

            {/* Resumen de segmentación */}
            <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:14}}>
              <span className="kq-badge kq-badge--lav"><i className="fas fa-map-marker-alt" style={{fontSize:10}}></i> Guatemala · Zona 14</span>
              <span className="kq-badge kq-badge--lav"><i className="fas fa-user" style={{fontSize:10}}></i> 25–55 años</span>
            </div>
          </div>
        </div>

        {/* Columna derecha: saldo + resumen */}
        <div style={{position:"sticky", top:24, display:"flex", flexDirection:"column", gap:16}}>
          {/* Saldo */}
          <div style={{position:"relative", overflow:"hidden", background:"var(--navy-800)",
            borderRadius:"var(--r-lg)", padding:"22px 22px", color:"var(--cream)"}}>
            <div style={{position:"absolute", inset:0,
              background:"radial-gradient(280px 160px at 90% -30%, rgba(181,172,239,.32), transparent 60%)"}}/>
            <div style={{position:"relative"}}>
              <div style={{font:"var(--text-caption)", color:"rgba(248,244,238,.65)", textTransform:"uppercase", letterSpacing:".1em"}}>Tu saldo de pauta</div>
              <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:34,
                letterSpacing:"-.02em", margin:"4px 0 2px"}}>{fmtQ(saldo)}.00</div>
              <div style={{display:"inline-flex", alignItems:"center", gap:6, font:"var(--text-caption)",
                color:"var(--green-400)", fontWeight:700}}>
                <i className="fas fa-gift" style={{fontSize:11}}></i> Incluye Q50 de referidos</div>
              <button className="kq-btn kq-btn--action" style={{width:"100%", justifyContent:"center",
                marginTop:16, display:"flex", gap:8}}>
                <i className="fas fa-plus" style={{fontSize:12}}></i> Recargar saldo</button>
            </div>
          </div>
          {/* Resumen */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
            padding:"20px 22px", boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:16,
              color:"var(--fg-strong)", marginBottom:14}}>Resumen</div>
            {[["Objetivo", objetivo==="impresiones"?"Impresiones":"Mensajes"],
              ["Inversión", fmtQ(monto)],
              ["Segmentación", "Zona 14 · 25-55"],
              ["Saldo disponible", fmtQ(saldo)]].map(([k,v])=>(
              <div key={k} style={{display:"flex", justifyContent:"space-between", padding:"7px 0",
                font:"var(--text-body-sm)"}}>
                <span style={{color:"var(--fg-muted)"}}>{k}</span>
                <span style={{color:"var(--fg-strong)", fontWeight:600}}>{v}</span></div>
            ))}
            <div style={{borderTop:"1px solid var(--border)", margin:"8px 0", paddingTop:10,
              display:"flex", justifyContent:"space-between"}}>
              <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>A pagar con tarjeta</span>
              <span style={{fontFamily:"var(--font-display)", fontWeight:700, color:"var(--fg-strong)"}}>
                {monto>saldo ? fmtQ(monto-saldo) : "Q 0"}</span></div>
            <button className="kq-btn kq-btn--action" style={{width:"100%", justifyContent:"center", marginTop:10}}>
              Activar pauta</button>
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:12,
              font:"var(--text-caption)", color:"var(--fg-subtle)"}}>
              <i className="far fa-credit-card"></i> Pago seguro con tarjeta</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- INVITE: crédito Q50 ---------- */
function InviteScreen() {
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <div style={{maxWidth:560, margin:"0 auto", padding:"44px 28px 56px"}}>
        <div style={{position:"relative", overflow:"hidden", background:"var(--navy-800)",
          borderRadius:"var(--r-xl)", padding:"40px 36px", color:"var(--cream)", marginBottom:24}}>
          <div style={{position:"absolute", inset:0,
            background:"radial-gradient(400px 240px at 90% -20%, rgba(181,172,239,.32), transparent 60%), radial-gradient(360px 220px at -10% 120%, rgba(155,198,74,.18), transparent 60%)"}}/>
          <div style={{position:"relative"}}>
            <span style={{width:54, height:54, borderRadius:"var(--r-md)", background:"rgba(181,172,239,.2)",
              color:"var(--lav-300)", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, marginBottom:18}}><i className="fas fa-gift"></i></span>
            <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:28, lineHeight:1.2,
              letterSpacing:"-.02em", margin:"0 0 10px"}}>Invitá a un amigo y ganá Q50 en pauta</h1>
            <p style={{font:"var(--text-body)", color:"rgba(248,244,238,.8)", margin:0}}>
              Cuando tu amigo se registre y haga su <strong style={{color:"#fff"}}>primera compra de pauta</strong>, los dos reciben <strong style={{color:"var(--green-400)"}}>Q50 de crédito</strong> en su saldo. Sin límite.</p>
          </div>
        </div>

        {/* Pasos */}
        <div style={{display:"flex", gap:10, marginBottom:24}}>
          {[["fa-paper-plane","Compartí tu enlace"],["fa-user-check","Tu amigo se registra"],["fa-bolt","Compra pauta → Q50 c/u"]].map(([ic,t],i)=>(
            <div key={t} style={{flex:1, textAlign:"center", padding:"16px 10px",
              background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)"}}>
              <div style={{width:36, height:36, margin:"0 auto 8px", borderRadius:"999px",
                background:"var(--lav-200)", color:"var(--lav-700)", display:"flex",
                alignItems:"center", justifyContent:"center", fontSize:14}}><i className={"fas "+ic}></i></div>
              <div style={{font:"var(--text-caption)", color:"var(--fg-muted)", lineHeight:1.4}}>{t}</div>
            </div>
          ))}
        </div>

        {/* Link */}
        <div style={{marginBottom:8, font:"var(--text-label)", color:"var(--fg-strong)"}}>Tu enlace de invitación</div>
        <div style={{display:"flex", gap:10, marginBottom:20}}>
          <div style={{flex:1, display:"flex", alignItems:"center", padding:"0 16px", height:48,
            background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"var(--r-sm)",
            font:"var(--text-body-sm)", color:"var(--fg-muted)", overflow:"hidden", whiteSpace:"nowrap"}}>
            kiosqui.com/invite/ANA2026</div>
          <button className="kq-btn kq-btn--action" style={{display:"flex", gap:8}}>
            <i className="fas fa-copy" style={{fontSize:13}}></i> Copiar</button>
        </div>
        <div style={{display:"flex", gap:10, marginBottom:26}}>
          {[["fa-whatsapp","WhatsApp","#25D366","fab"],["fa-facebook","Facebook","#1877F2","fab"],
            ["fa-envelope","Correo","var(--navy-600)","fas"]].map(([ic,t,c,fam])=>(
            <button key={t} style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center",
              gap:8, height:44, borderRadius:"var(--r-sm)", cursor:"pointer",
              border:"1.5px solid var(--border-strong)", background:"var(--surface)",
              font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)"}}>
              <i className={fam+" "+ic} style={{color:c, fontSize:16}}></i> {t}</button>
          ))}
        </div>

        {/* Progreso */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-md)", padding:"18px 20px", display:"flex", alignItems:"center", gap:16}}>
          <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:28, color:"var(--green-600)"}}>1</div>
          <div style={{flex:1}}>
            <div style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>amigo activó su pauta</div>
            <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Ganaste Q50 · 2 pendientes de comprar pauta</div>
          </div>
          <button className="kq-btn kq-btn--outline kq-btn--sm">Ver detalle</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {PautaScreen, InviteScreen, fmtQ});
