/* Batch B — Contacto, FAQ, Soporte y plantilla de Legales.
   Comparten patrón "página de contenido": header + cabecera de página + cuerpo centrado. */

function PageHead({overline, title, sub}) {
  return (
    <div style={{textAlign:"center", padding:"52px 28px 40px"}}>
      {overline && <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
        textTransform:"uppercase", color:"var(--accent-hover)", marginBottom:12}}>{overline}</div>}
      <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:36,
        letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 10px"}}>{title}</h1>
      {sub && <p style={{font:"var(--text-body)", color:"var(--fg-muted)", margin:"0 auto", maxWidth:520}}>{sub}</p>}
    </div>
  );
}

/* ---------- CONTACTO ---------- */
function ContactScreen() {
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <PageHead overline="Contacto" title="Hablemos"
        sub="¿Tenés dudas sobre una propiedad, tu cuenta o querés trabajar con nosotros? Escribinos."/>
      <div style={{maxWidth:980, margin:"0 auto", padding:"0 28px 64px",
        display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:28, alignItems:"start"}}>
        {/* Formulario */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-sm)", padding:"28px 30px"}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16}}>
            <div className="kq-field"><label>Nombre</label><input className="kq-input" placeholder="Tu nombre"/></div>
            <div className="kq-field"><label>Correo electrónico</label><input className="kq-input" placeholder="tu@correo.com"/></div>
          </div>
          <div className="kq-field" style={{marginBottom:16}}><label>Asunto</label>
            <div style={{position:"relative"}}>
              <select className="kq-input" style={{appearance:"none", cursor:"pointer"}}>
                <option>Consulta sobre una propiedad</option>
                <option>Problema con mi cuenta</option>
                <option>Pauta y publicidad</option>
                <option>Otro</option>
              </select>
              <i className="fas fa-chevron-down" style={{position:"absolute", right:16, top:"50%",
                transform:"translateY(-50%)", fontSize:12, color:"var(--fg-subtle)", pointerEvents:"none"}}></i>
            </div>
          </div>
          <div className="kq-field" style={{marginBottom:20}}><label>Mensaje</label>
            <textarea className="kq-input" rows={5} placeholder="Contanos en qué te ayudamos…" style={{resize:"vertical", fontFamily:"var(--font-body)"}}></textarea></div>
          <button className="kq-btn kq-btn--action" style={{display:"flex", gap:8}}>
            <i className="fas fa-paper-plane" style={{fontSize:13}}></i> Enviar mensaje</button>
        </div>
        {/* Info lateral */}
        <div style={{display:"flex", flexDirection:"column", gap:14}}>
          {[["fa-envelope","Correo","soporte@kiosqui.gt","Respondemos en menos de 24 h"],
            ["fa-headset","Soporte","Centro de ayuda","Guías y preguntas frecuentes"],
            ["fa-bullhorn","Pauta","pauta@kiosqui.gt","Para anunciantes y agencias"]].map(([ic,t,v,d])=>(
            <div key={t} style={{display:"flex", gap:14, padding:"18px 18px",
              background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)"}}>
              <span style={{width:42, height:42, borderRadius:"var(--r-md)", flexShrink:0,
                background:"var(--accent-soft)", color:"var(--accent-hover)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16}}>
                <i className={"fas "+ic}></i></span>
              <div>
                <div style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>{t}</div>
                <div style={{font:"var(--text-label)", color:"var(--fg-strong)", margin:"1px 0 2px"}}>{v}</div>
                <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>{d}</div>
              </div>
            </div>
          ))}
          <div style={{padding:"18px 20px", background:"var(--navy-800)", borderRadius:"var(--r-md)",
            color:"var(--cream)", position:"relative", overflow:"hidden"}}>
            <div style={{position:"absolute", inset:0,
              background:"radial-gradient(300px 180px at 90% -20%, rgba(181,172,239,.3), transparent 60%)"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, marginBottom:4}}>¿Sos vendedor?</div>
              <div style={{font:"var(--text-body-sm)", color:"rgba(248,244,238,.75)", marginBottom:12}}>Publicá tu propiedad gratis en minutos.</div>
              <button className="kq-btn kq-btn--action kq-btn--sm">Crear publicación</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- FAQ ---------- */
const faqs = [
  {q:"¿Cómo verifican a los vendedores?", a:"Cada vendedor valida su identidad con su DPI antes de poder publicar. Las publicaciones verificadas muestran la insignia verde en el perfil del vendedor.", open:true},
  {q:"¿Qué es el modelo 3D de una propiedad?", a:""},
  {q:"¿Publicar tiene costo?", a:""},
  {q:"¿Cómo contacto a un propietario?", a:""},
  {q:"¿Kiosqui cobra comisión por la venta?", a:""},
  {q:"¿Puedo pausar o eliminar mi publicación?", a:""},
];

function FaqScreen() {
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <PageHead overline="Centro de ayuda" title="Preguntas frecuentes"
        sub="Las respuestas a lo que más nos preguntan. Si no encontrás la tuya, escribinos."/>
      <div style={{maxWidth:760, margin:"0 auto", padding:"0 28px 24px"}}>
        {/* Buscador */}
        <div style={{display:"flex", alignItems:"center", gap:11, height:52, padding:"0 20px",
          background:"var(--surface)", border:"1.5px solid var(--border-strong)",
          borderRadius:"999px", boxShadow:"var(--shadow-sm)", marginBottom:18}}>
          <i className="fas fa-search" style={{fontSize:15, color:"var(--fg-subtle)"}}></i>
          <span style={{font:"var(--text-body)", color:"var(--fg-subtle)"}}>Buscar una pregunta…</span>
        </div>
        {/* Chips de categoría */}
        <div style={{display:"flex", gap:9, flexWrap:"wrap", marginBottom:26, justifyContent:"center"}}>
          {["Todas","Cuenta","Publicaciones","Modelo 3D","Pagos","Seguridad"].map((c,i)=>(
            <span key={c} className={"kq-chip"+(i===0?" kq-chip--active":"")}>{c}</span>
          ))}
        </div>
        {/* Acordeón */}
        <div style={{display:"flex", flexDirection:"column", gap:12, paddingBottom:48}}>
          {faqs.map(f=>(
            <div key={f.q} style={{background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:"var(--r-md)", overflow:"hidden",
              boxShadow: f.open ? "var(--shadow-sm)" : "none"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:14, padding:"17px 20px", cursor:"pointer"}}>
                <span style={{font:"var(--text-label)", fontSize:15, color:"var(--fg-strong)"}}>{f.q}</span>
                <span style={{width:28, height:28, borderRadius:"999px", flexShrink:0,
                  background: f.open ? "var(--lav-500)" : "var(--surface-sunk)",
                  color: f.open ? "#fff" : "var(--fg-muted)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:11}}>
                  <i className={"fas "+(f.open?"fa-minus":"fa-plus")}></i></span>
              </div>
              {f.open && f.a && (
                <div style={{padding:"0 20px 18px", font:"var(--text-body-sm)", lineHeight:1.6,
                  color:"var(--fg-muted)", maxWidth:600}}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- SOPORTE ---------- */
function SoporteScreen() {
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <PageHead overline="Soporte" title="¿En qué te ayudamos?"
        sub="Elegí un tema para ver guías, o abrí un ticket si necesitás hablar con el equipo."/>
      <div style={{maxWidth:980, margin:"0 auto", padding:"0 28px 56px"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, marginBottom:30}}>
          {[["fa-user-gear","Mi cuenta","Acceso, verificación DPI, datos personales","8 guías"],
            ["fa-building","Publicaciones","Crear, editar, destacar y estados","12 guías"],
            ["fa-cube","Modelo 3D","Cómo subir y compartir tu modelo","5 guías"],
            ["fa-credit-card","Planes y pagos","Suscripciones, facturas, reembolsos","7 guías"],
            ["fa-shield-halved","Seguridad","Reportar anuncios, estafas, bloqueos","6 guías"],
            ["fa-bullhorn","Pauta","Anuncios destacados y campañas","4 guías"]].map(([ic,t,d,n])=>(
            <div key={t} style={{padding:"22px 20px", background:"var(--surface)",
              border:"1.5px solid var(--border)", borderRadius:"var(--r-lg)", cursor:"pointer"}}>
              <span style={{width:46, height:46, borderRadius:"var(--r-md)", marginBottom:14,
                background:"var(--accent-soft)", color:"var(--accent-hover)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18}}>
                <i className={"fas "+ic}></i></span>
              <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:17,
                color:"var(--fg-strong)", marginBottom:5}}>{t}</div>
              <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", marginBottom:10, lineHeight:1.5}}>{d}</div>
              <div style={{font:"var(--text-caption)", fontWeight:700, color:"var(--accent-hover)"}}>{n} <i className="fas fa-arrow-right" style={{fontSize:10, marginLeft:3}}></i></div>
            </div>
          ))}
        </div>
        {/* Banda de ticket */}
        <div style={{display:"flex", alignItems:"center", gap:20, padding:"22px 26px",
          background:"var(--green-100)", border:"1.5px solid var(--green-300)", borderRadius:"var(--r-lg)"}}>
          <span style={{width:46, height:46, borderRadius:"999px", flexShrink:0,
            background:"var(--green-500)", color:"var(--navy-900)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:17}}>
            <i className="fas fa-life-ring"></i></span>
          <div style={{flex:1}}>
            <div style={{font:"var(--text-label)", fontSize:15, color:"var(--fg-strong)"}}>¿No encontraste lo que buscabas?</div>
            <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Abrí un ticket y el equipo te responde en menos de 24 horas.</div>
          </div>
          <button className="kq-btn kq-btn--primary">Abrir ticket</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- LEGALES (plantilla) ---------- */
function LegalScreen() {
  const toc = ["1. Aceptación de los términos","2. Cuentas y verificación","3. Publicaciones",
    "4. Modelo 3D y contenido","5. Pagos y planes","6. Responsabilidades","7. Privacidad de datos","8. Contacto"];
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <div style={{maxWidth:980, margin:"0 auto", padding:"44px 28px 64px",
        display:"grid", gridTemplateColumns:"230px 1fr", gap:44, alignItems:"start"}}>
        {/* TOC */}
        <div style={{position:"sticky", top:24, display:"flex", flexDirection:"column", gap:2}}>
          <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
            textTransform:"uppercase", color:"var(--fg-subtle)", marginBottom:10}}>Contenido</div>
          {toc.map((t,i)=>(
            <a key={t} href="#" style={{font:"var(--text-body-sm)", fontWeight: i===0?700:500,
              color: i===0 ? "var(--accent-hover)" : "var(--fg-muted)", textDecoration:"none",
              padding:"6px 12px", borderRadius:"var(--r-xs)",
              background: i===0 ? "var(--accent-soft)" : "transparent",
              borderLeft: i===0 ? "2.5px solid var(--lav-500)" : "2.5px solid transparent"}}>{t}</a>
          ))}
        </div>
        {/* Prosa */}
        <div style={{maxWidth:640}}>
          <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
            textTransform:"uppercase", color:"var(--accent-hover)", marginBottom:10}}>Legal</div>
          <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:34,
            letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 8px"}}>Términos y condiciones</h1>
          <div style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)", marginBottom:28,
            paddingBottom:24, borderBottom:"1px solid var(--border)"}}>
            Última actualización: 1 de junio de 2026</div>
          <h2 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:21,
            color:"var(--fg-strong)", margin:"0 0 12px"}}>1. Aceptación de los términos</h2>
          <p style={{font:"var(--text-body)", lineHeight:1.7, color:"var(--fg)", margin:"0 0 14px"}}>
            Al crear una cuenta o usar Kiosqui aceptás estos términos. Kiosqui es una plataforma
            digital que conecta a compradores y vendedores de inmuebles en Guatemala; no somos
            parte de la negociación ni de la transacción final entre las partes.</p>
          <p style={{font:"var(--text-body)", lineHeight:1.7, color:"var(--fg)", margin:"0 0 28px"}}>
            Podemos actualizar estos términos. Si el cambio es significativo, te lo avisamos por
            correo y dentro de la plataforma con al menos 15 días de anticipación.</p>
          <h2 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:21,
            color:"var(--fg-strong)", margin:"0 0 12px"}}>2. Cuentas y verificación</h2>
          <p style={{font:"var(--text-body)", lineHeight:1.7, color:"var(--fg)", margin:"0 0 14px"}}>
            Para publicar necesitás verificar tu identidad con tu DPI. La insignia de verificación
            indica que validamos el documento, no que garantizamos la conducta del usuario.</p>
          <div style={{display:"flex", gap:11, padding:"14px 16px", background:"var(--accent-soft)",
            borderRadius:"var(--r-md)", font:"var(--text-body-sm)", lineHeight:1.55,
            color:"var(--fg-muted)"}}>
            <i className="fas fa-info-circle" style={{color:"var(--accent-hover)", marginTop:2}}></i>
            <span>Plantilla tipográfica: títulos display 21px, prosa 16px/1.7, callouts en lavanda suave. El copy legal final lo redacta el equipo legal.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {PageHead, ContactScreen, FaqScreen, SoporteScreen, LegalScreen});
