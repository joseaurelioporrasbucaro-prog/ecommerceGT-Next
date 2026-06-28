/* Batch D — Comentarios / Preguntas sobre la propiedad (en el detalle)
   Patrón moderno pregunta→respuesta, respuestas del vendedor destacadas,
   composer pill on-brand, colapso de hilos, estado vacío. */

function QAvatar({init, seller}) {
  return (
    <div style={{width:42, height:42, borderRadius:"999px", flexShrink:0,
      background: seller ? "linear-gradient(135deg,var(--lav-500),var(--lav-700))"
        : "linear-gradient(135deg,var(--navy-700),var(--navy-900))",
      color: seller ? "#fff" : "var(--cream)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"var(--font-display)", fontWeight:700, fontSize:14}}>{init}</div>
  );
}

/* Acciones (like / responder) reutilizables */
function QActions({likes, liked}) {
  return (
    <div style={{display:"flex", gap:18, font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>
      <button style={{display:"flex", alignItems:"center", gap:7, background:"none", border:"none",
        cursor:"pointer", color: liked?"var(--lav-700)":"var(--fg-muted)", fontWeight:600,
        fontFamily:"var(--font-body)", font:"var(--text-body-sm)"}}>
        <i className={(liked?"fas":"far")+" fa-thumbs-up"} style={{fontSize:13}}></i> {likes||0}</button>
      <button style={{display:"flex", alignItems:"center", gap:7, background:"none", border:"none",
        cursor:"pointer", color:"var(--fg-muted)", fontWeight:600, fontFamily:"var(--font-body)", font:"var(--text-body-sm)"}}>
        <i className="far fa-comment" style={{fontSize:13}}></i> Responder</button>
      <button style={{background:"none", border:"none", cursor:"pointer", color:"var(--fg-subtle)",
        marginLeft:"auto"}}><i className="fas fa-ellipsis-h"></i></button>
    </div>
  );
}

/* Una respuesta (NIVEL 1) — vendedor destacada o comunidad normal.
   Regla: máximo 2 niveles. Una respuesta-a-respuesta NO se indenta más:
   se queda en este mismo nivel (como Instagram/portales), opcionalmente
   con "↳ @mención" para indicar a quién responde. */
function QReply({r}) {
  if (r.seller) {
    return (
      <div style={{display:"flex", gap:12, padding:"13px 15px", background:"var(--accent-soft)",
        borderRadius:"var(--r-md)", borderLeft:"3px solid var(--lav-500)"}}>
        <QAvatar init={r.init} seller/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"center", gap:8, flexWrap:"wrap"}}>
            <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{r.name}</span>
            <span style={{display:"inline-flex", alignItems:"center", gap:5, padding:"2px 9px",
              borderRadius:"999px", background:"var(--lav-500)", color:"#fff",
              font:"var(--text-caption)", fontWeight:700}}>
              <i className="fas fa-home" style={{fontSize:9}}></i> Vendedor</span>
            <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>· {r.time}</span>
          </div>
          <p style={{font:"var(--text-body)", color:"var(--fg)", margin:"6px 0 8px"}}>{r.text}</p>
          <QActions likes={r.likes} liked={r.liked}/>
        </div>
      </div>
    );
  }
  return (
    <div style={{display:"flex", gap:12}}>
      <QAvatar init={r.init}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{r.name}</span>
          <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>· {r.time}</span>
        </div>
        <p style={{font:"var(--text-body)", color:"var(--fg)", margin:"6px 0 8px"}}>
          {r.to && <span style={{color:"var(--lav-700)", fontWeight:600}}>@{r.to} </span>}{r.text}</p>
        <QActions likes={r.likes} liked={r.liked}/>
      </div>
    </div>
  );
}

function QThread({q}) {
  const replies = q.replies || [];
  return (
    <div style={{padding:"22px 0", borderBottom:"1px solid var(--border)"}}>
      {/* Pregunta (nivel 0) */}
      <div style={{display:"flex", gap:14}}>
        <QAvatar init={q.init}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{q.name}</span>
            <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>· {q.time}</span>
          </div>
          <p style={{font:"var(--text-body)", color:"var(--fg)", margin:"6px 0 10px"}}>{q.text}</p>
          <QActions likes={q.likes} liked={q.liked}/>
        </div>
      </div>

      {/* Respuestas (NIVEL 1) — UNA sola sangría, todas alineadas aquí */}
      {replies.length > 0 && (
        <div style={{marginLeft:56, marginTop:14, display:"flex", flexDirection:"column", gap:14}}>
          {replies.map((r,i)=><QReply key={i} r={r}/>)}
        </div>
      )}

      {q.more && (
        <button style={{marginLeft:56, marginTop:14, background:"none", border:"none", cursor:"pointer",
          color:"var(--lav-700)", font:"var(--text-body-sm)", fontWeight:600,
          fontFamily:"var(--font-body)", display:"flex", alignItems:"center", gap:7}}>
          <i className="fas fa-chevron-down" style={{fontSize:11}}></i> Ver {q.more} respuestas más</button>
      )}
    </div>
  );
}

const dQuestions = [
  {init:"CR", name:"Carlos Ramírez", time:"hace 2 días", likes:4, liked:true,
   text:"¿La casa cuenta con pozo propio o solo servicio municipal de agua? Y ¿el precio es negociable?",
   replies:[
     {init:"AM", name:"Andrea Móvil", time:"hace 1 día", seller:true, likes:2,
      text:"¡Hola Carlos! Tiene cisterna con bomba y servicio municipal. El precio tiene un margen de negociación, con gusto lo vemos en una visita."},
     // respuesta-a-respuesta: se queda en ESTE mismo nivel (no se indenta más), con @mención
     {init:"CR", name:"Carlos Ramírez", time:"hace 1 día", to:"Andrea", likes:0,
      text:"Perfecto, ¿podríamos coordinar una visita el sábado por la mañana?"},
   ],
   more:2},
  {init:"LM", name:"Lucía Martínez", time:"hace 3 días", likes:1,
   text:"¿Aceptan financiamiento bancario? ¿La propiedad ya está inscrita en el Registro?"},
  {init:"JP", name:"Jorge Pérez", time:"hace 5 días", likes:7,
   text:"¿Qué incluye la cuota de mantenimiento del condominio y de cuánto es mensual?",
   replies:[
     {init:"AM", name:"Andrea Móvil", time:"hace 4 días", seller:true, likes:3,
      text:"Incluye seguridad 24/7, áreas verdes y mantenimiento de calles. La cuota es de Q 850 mensuales."},
   ]},
];

function CommentsView({empty}) {
  return (
    <div style={{width:"100%", height:"100%", overflowY:"auto", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)", padding:"32px 0"}}>
      <div style={{maxWidth:760, margin:"0 auto", padding:"0 28px"}}>
        <div style={{display:"flex", alignItems:"baseline", gap:10, marginBottom:6}}>
          <h2 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:26,
            letterSpacing:"-.02em", color:"var(--fg-strong)", margin:0}}>Preguntas</h2>
          <span style={{font:"var(--text-body)", color:"var(--fg-subtle)"}}>{empty?"0":"12"}</span>
        </div>
        <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"0 0 22px"}}>
          Preguntá lo que necesites saber sobre esta propiedad. El vendedor o la comunidad te responde.</p>

        {/* Composer pill */}
        <div style={{display:"flex", gap:13, marginBottom:14}}>
          <QAvatar init="TÚ"/>
          <div style={{flex:1, display:"flex", alignItems:"center", gap:10, padding:"4px 4px 4px 18px",
            background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"999px"}}>
            <span style={{flex:1, font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Escribí tu pregunta…</span>
            <button className="kq-btn kq-btn--action kq-btn--sm" style={{display:"flex", gap:7}}>
              <i className="fas fa-paper-plane" style={{fontSize:12}}></i> Preguntar</button>
          </div>
        </div>

        {empty ? (
          <div style={{textAlign:"center", padding:"56px 0", color:"var(--fg-subtle)"}}>
            <div style={{width:76, height:76, borderRadius:"999px", margin:"0 auto 14px",
              background:"var(--accent-soft)", color:"var(--lav-700)", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:30}}>
              <i className="far fa-comments"></i></div>
            <div style={{font:"var(--text-h4)", fontFamily:"var(--font-display)", fontWeight:700,
              color:"var(--fg-strong)"}}>Sé el primero en preguntar</div>
            <div style={{font:"var(--text-body-sm)", marginTop:4}}>Tu pregunta ayuda a otros compradores también.</div>
          </div>
        ) : (
          <div style={{marginTop:8, borderTop:"1px solid var(--border)"}}>
            {dQuestions.map(q=><QThread key={q.init+q.time} q={q}/>)}
            <button style={{display:"block", margin:"22px auto 0", padding:"11px 24px",
              borderRadius:"999px", border:"1.5px solid var(--border-strong)", background:"var(--surface)",
              cursor:"pointer", font:"var(--text-label)", fontFamily:"var(--font-display)",
              color:"var(--fg-strong)"}}>Ver más preguntas</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {CommentsView, QThread, QReply, QActions, QAvatar, dQuestions});
