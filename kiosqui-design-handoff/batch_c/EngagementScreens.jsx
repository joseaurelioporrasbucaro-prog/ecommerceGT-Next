/* Batch C — Pauta (promocionar publicación), Activity (feed), Survey, Invite.
   Usan KqHeader (de batch_b/ProfileScreen.jsx). */

/* ---------- PAUTA ---------- */
function PautaScreen() {
  const plans = [
    {name:"Básico", days:"7 días", price:"Q 75", feats:["Badge Destacado","Aparece en listados","Hasta 200 vistas extra"], pop:false},
    {name:"Impulso", days:"15 días", price:"Q 140", feats:["Todo lo de Básico","Tope de la categoría","Sección Patrocinado en home","CTA Enviar mensaje"], pop:true},
    {name:"Máximo", days:"30 días", price:"Q 240", feats:["Todo lo de Impulso","Home + búsquedas","Reporte de desempeño","Soporte prioritario"], pop:false},
  ];
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <PageHead overline="Pauta" title="Destacá tu propiedad"
        sub="Llegá a más compradores. Elegí cuánto tiempo querés que tu publicación aparezca arriba."/>
      <div style={{maxWidth:1040, margin:"0 auto", padding:"0 28px 32px"}}>
        {/* Publicación a promocionar */}
        <div style={{display:"flex", alignItems:"center", gap:16, padding:"16px 18px",
          background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)",
          marginBottom:26, boxShadow:"var(--shadow-xs)"}}>
          <div style={{width:80, height:56, borderRadius:"var(--r-sm)", flexShrink:0,
            background:"linear-gradient(135deg,#283a5c,#1e2d4a)", display:"flex",
            alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.4)"}}>
            <i className="fas fa-camera" style={{fontSize:15}}></i></div>
          <div style={{flex:1}}>
            <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
              textTransform:"uppercase", color:"var(--fg-subtle)"}}>Promocionando</div>
            <div style={{font:"var(--text-label)", fontSize:15, color:"var(--fg-strong)", margin:"2px 0"}}>Casa moderna con jardín</div>
            <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Q 1,850,000 · Zona 14</div>
          </div>
          <button className="kq-btn kq-btn--outline kq-btn--sm">Cambiar</button>
        </div>
        {/* Planes de pauta */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18}}>
          {plans.map(p=>(
            <div key={p.name} style={{position:"relative", background:"var(--surface)",
              border: p.pop ? "2px solid var(--navy-800)" : "1px solid var(--border)",
              borderRadius:"var(--r-lg)", padding:"26px 22px",
              boxShadow: p.pop ? "var(--shadow-md)" : "var(--shadow-sm)"}}>
              {p.pop && <span style={{position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                display:"inline-flex", alignItems:"center", gap:6, padding:"4px 13px", borderRadius:"999px",
                background:"var(--green-500)", color:"var(--navy-900)", font:"var(--text-caption)",
                fontWeight:700, whiteSpace:"nowrap"}}><i className="fas fa-star" style={{fontSize:9}}></i> Más elegido</span>}
              <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:19,
                color:"var(--fg-strong)"}}>{p.name}</div>
              <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", marginBottom:14}}>{p.days}</div>
              <div style={{display:"flex", alignItems:"baseline", gap:4, marginBottom:18}}>
                <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:32,
                  color:"var(--fg-strong)", letterSpacing:"-.02em"}}>{p.price}</span>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:22}}>
                {p.feats.map(f=>(
                  <div key={f} style={{display:"flex", alignItems:"center", gap:9,
                    font:"var(--text-body-sm)", color:"var(--fg)"}}>
                    <i className="fas fa-check" style={{fontSize:12, color:"var(--green-600)"}}></i>{f}</div>
                ))}
              </div>
              <button className={"kq-btn "+(p.pop?"kq-btn--action":"kq-btn--outline")} style={{width:"100%", justifyContent:"center"}}>Elegir {p.name}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- ACTIVITY ---------- */
function ActivityScreen() {
  const groups = [
    {day:"Hoy", items:[
      ["fa-comments","var(--lav-700)","var(--lav-200)","Carlos Ramírez te envió un mensaje","sobre Casa moderna con jardín","10:42"],
      ["fa-heart","var(--danger)","var(--danger-bg)","Tu publicación recibió 3 favoritos","Apartamento Zona 10","09:15"],
      ["fa-eye","var(--navy-600)","var(--navy-100)","42 personas vieron tus publicaciones","hoy","08:00"],
    ]},
    {day:"Ayer", items:[
      ["fa-circle-check","var(--green-700)","var(--green-100)","Tu publicación fue aprobada","Terreno San Lucas ya está visible","16:20"],
      ["fa-bullhorn","var(--lav-700)","var(--lav-200)","Tu pauta Impulso está activa","Vence en 14 días","11:05"],
    ]},
  ];
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <div style={{maxWidth:640, margin:"0 auto", padding:"36px 28px 56px"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22}}>
          <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:30,
            letterSpacing:"-.02em", color:"var(--fg-strong)", margin:0}}>Actividad</h1>
          <button style={{background:"none", border:"none", cursor:"pointer",
            font:"var(--text-body-sm)", fontWeight:700, color:"var(--accent-hover)"}}>Marcar todo leído</button>
        </div>
        {groups.map(g=>(
          <div key={g.day} style={{marginBottom:18}}>
            <div style={{font:"var(--text-overline)", letterSpacing:"var(--tracking-overline)",
              textTransform:"uppercase", color:"var(--fg-subtle)", margin:"0 0 10px 2px"}}>{g.day}</div>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              {g.items.map((it,i)=>(
                <div key={i} style={{display:"flex", gap:14, alignItems:"flex-start", padding:"14px 16px",
                  background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-md)",
                  boxShadow:"var(--shadow-xs)"}}>
                  <span style={{width:40, height:40, borderRadius:"var(--r-md)", flexShrink:0,
                    background:it[2], color:it[1], display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:15}}><i className={"fas "+it[0]}></i></span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg-strong)"}}>{it[3]}</div>
                    <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>{it[4]}</div>
                  </div>
                  <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)", flexShrink:0}}>{it[5]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- SURVEY ---------- */
function SurveyScreen() {
  return (
    <div style={{width:"100%", minHeight:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <div style={{maxWidth:600, margin:"0 auto", padding:"40px 28px 56px"}}>
        <div style={{background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-sm)", padding:"32px 34px"}}>
          {/* Progreso */}
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
            <span style={{font:"var(--text-caption)", fontWeight:700, color:"var(--accent-hover)"}}>Pregunta 2 de 4</span>
            <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>50%</span>
          </div>
          <div style={{height:7, background:"var(--surface-sunk)", borderRadius:"999px", overflow:"hidden", marginBottom:26}}>
            <div style={{width:"50%", height:"100%", background:"var(--green-500)", borderRadius:"999px"}}></div>
          </div>
          <h2 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:23,
            letterSpacing:"-.01em", color:"var(--fg-strong)", margin:"0 0 6px"}}>¿Qué tan fácil fue encontrar tu propiedad?</h2>
          <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"0 0 24px"}}>Tu opinión nos ayuda a mejorar la búsqueda.</p>
          {/* Escala */}
          <div style={{display:"flex", gap:10, marginBottom:26}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} style={{flex:1, height:56, borderRadius:"var(--r-md)", cursor:"pointer",
                fontFamily:"var(--font-display)", fontWeight:700, fontSize:18,
                background: n===4 ? "var(--lav-500)" : "var(--surface)",
                color: n===4 ? "#fff" : "var(--fg-muted)",
                border: n===4 ? "2px solid var(--lav-500)" : "1.5px solid var(--border-strong)"}}>{n}</button>
            ))}
          </div>
          <div style={{display:"flex", justifyContent:"space-between", font:"var(--text-caption)",
            color:"var(--fg-subtle)", marginBottom:30, marginTop:-16}}>
            <span>Muy difícil</span><span>Muy fácil</span></div>
          <div style={{display:"flex", gap:12}}>
            <button className="kq-btn kq-btn--ghost" style={{flex:"0 0 auto"}}>Atrás</button>
            <button className="kq-btn kq-btn--action" style={{flex:1, justifyContent:"center"}}>Continuar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- INVITE ---------- */
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
              letterSpacing:"-.02em", margin:"0 0 10px"}}>Invitá a un amigo y ganá pauta gratis</h1>
            <p style={{font:"var(--text-body)", color:"rgba(248,244,238,.8)", margin:0}}>
              Por cada amigo que se registre y verifique su cuenta, los dos reciben <strong style={{color:"var(--green-400)"}}>7 días de pauta gratis</strong>.</p>
          </div>
        </div>
        {/* Link de invitación */}
        <div style={{marginBottom:8, font:"var(--text-label)", color:"var(--fg-strong)"}}>Tu enlace de invitación</div>
        <div style={{display:"flex", gap:10, marginBottom:24}}>
          <div style={{flex:1, display:"flex", alignItems:"center", padding:"0 16px", height:48,
            background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"var(--r-sm)",
            font:"var(--text-body-sm)", color:"var(--fg-muted)", overflow:"hidden", whiteSpace:"nowrap"}}>
            kiosqui.com/invite/ANA2026</div>
          <button className="kq-btn kq-btn--action" style={{display:"flex", gap:8}}>
            <i className="fas fa-copy" style={{fontSize:13}}></i> Copiar</button>
        </div>
        {/* Compartir */}
        <div style={{display:"flex", gap:10, marginBottom:30}}>
          {[["fa-whatsapp","WhatsApp","#25D366","fab"],["fa-facebook","Facebook","#1877F2","fab"],
            ["fa-envelope","Correo","var(--navy-600)","fas"]].map(([ic,t,c,fam])=>(
            <button key={t} style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center",
              gap:8, height:44, borderRadius:"var(--r-sm)", cursor:"pointer",
              border:"1.5px solid var(--border-strong)", background:"var(--surface)",
              font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)"}}>
              <i className={fam+" "+ic} style={{color:c, fontSize:16}}></i> {t}</button>
          ))}
        </div>
        {/* Progreso de invitaciones */}
        <div style={{background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-md)", padding:"18px 20px", display:"flex", alignItems:"center", gap:16}}>
          <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:28, color:"var(--green-600)"}}>3</div>
          <div style={{flex:1}}>
            <div style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>amigos se han unido</div>
            <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>Ganaste 21 días de pauta</div>
          </div>
          <button className="kq-btn kq-btn--outline kq-btn--sm">Ver detalle</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {PautaScreen, ActivityScreen, SurveyScreen, InviteScreen});
