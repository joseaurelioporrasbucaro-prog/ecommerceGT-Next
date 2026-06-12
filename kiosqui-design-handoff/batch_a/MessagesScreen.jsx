/* Batch A — /messages
   HeaderTwo en modo compact (sin buscador) + 2 paneles:
   lista de conversaciones · hilo con contexto de la propiedad. */

const msgsData = [
  {init:"CR", name:"Carlos Ramírez", prop:"Casa moderna con jardín", last:"¿Sigue disponible para visita el sábado?", time:"10:42", unread:2, active:true},
  {init:"LM", name:"Lucía Martínez", prop:"Apartamento Zona 10", last:"Perfecto, quedamos así entonces 👍", time:"09:15", unread:0},
  {init:"JP", name:"Jorge Pérez", prop:"Terreno San Lucas", last:"Vos: Te comparto el modelo 3D", time:"Ayer", unread:0},
  {init:"MS", name:"María Solís", prop:"Casa Zona 16", last:"Gracias por la info!", time:"Lun", unread:0},
];

function MessagesHeader() {
  return (
    <div style={{height:72, borderBottom:"1px solid var(--border)", background:"var(--bg-elevated)",
      display:"flex", alignItems:"center", gap:18, padding:"0 24px", flexShrink:0}}>
      <button style={{width:40, height:40, borderRadius:"999px", border:"none", cursor:"pointer",
        background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
        fontFamily:"var(--font-display)", fontWeight:700, fontSize:14}}>AR</button>
      <img src="assets/logo-transparent.png" alt="Kiosqui" style={{height:32}} className="kq-logo-light"/>
      <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:12}}>
        <button style={{width:38, height:38, borderRadius:"999px", border:"1.5px solid var(--border-strong)",
          background:"var(--surface)", color:"var(--fg-strong)", cursor:"pointer", position:"relative"}}>
          <i className="fas fa-bell" style={{fontSize:15}}></i>
          <span style={{position:"absolute", top:7, right:8, width:8, height:8, borderRadius:"50%",
            background:"var(--green-500)", border:"2px solid var(--surface)"}}></span></button>
        <button style={{width:38, height:38, borderRadius:"999px", border:"1.5px solid var(--border-strong)",
          background:"var(--surface)", color:"var(--fg-strong)", cursor:"pointer"}}>
          <i className="fas fa-bars" style={{fontSize:15}}></i></button>
      </div>
    </div>
  );
}

function ConvoItem({c}) {
  return (
    <div style={{display:"flex", gap:12, padding:"14px 16px", cursor:"pointer",
      borderRadius:"var(--r-md)",
      background: c.active ? "var(--accent-soft)" : "transparent"}}>
      <div style={{width:46, height:46, borderRadius:"999px", flexShrink:0,
        background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"var(--font-display)", fontWeight:700, fontSize:15}}>{c.init}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8}}>
          <span style={{font:"var(--text-label)", fontWeight:700, color:"var(--fg-strong)",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{c.name}</span>
          <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)", flexShrink:0}}>{c.time}</span>
        </div>
        <div style={{font:"var(--text-caption)", color:"var(--accent-hover)", fontWeight:600,
          margin:"2px 0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          <i className="fas fa-home" style={{fontSize:10, marginRight:5}}></i>{c.prop}</div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
          <span style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", whiteSpace:"nowrap",
            overflow:"hidden", textOverflow:"ellipsis"}}>{c.last}</span>
          {c.unread>0 && <span style={{flexShrink:0, minWidth:20, height:20, borderRadius:"999px",
            background:"var(--green-500)", color:"var(--navy-900)", font:"var(--text-caption)",
            fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center",
            padding:"0 6px"}}>{c.unread}</span>}
        </div>
      </div>
    </div>
  );
}

function Bubble({mine, children, time}) {
  return (
    <div style={{display:"flex", flexDirection:"column", alignItems: mine?"flex-end":"flex-start"}}>
      <div style={{maxWidth:"72%", padding:"11px 16px", font:"var(--text-body-sm)", lineHeight:1.5,
        background: mine ? "var(--navy-800)" : "var(--surface)",
        color: mine ? "var(--cream)" : "var(--fg)",
        border: mine ? "none" : "1px solid var(--border)",
        borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        boxShadow:"var(--shadow-xs)"}}>{children}</div>
      <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)", margin:"5px 4px 0"}}>{time}</span>
    </div>
  );
}

function MessagesScreen() {
  return (
    <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <MessagesHeader/>
      <div style={{flex:1, display:"grid", gridTemplateColumns:"360px 1fr", minHeight:0}}>

        {/* Lista de conversaciones */}
        <div style={{borderRight:"1px solid var(--border)", background:"var(--bg-elevated)",
          display:"flex", flexDirection:"column", minHeight:0}}>
          <div style={{padding:"18px 16px 10px"}}>
            <h2 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20,
              color:"var(--fg-strong)", margin:"0 0 14px"}}>Mensajes</h2>
            <div style={{display:"flex", alignItems:"center", gap:9, height:40, padding:"0 14px",
              background:"var(--surface)", border:"1.5px solid var(--border-strong)",
              borderRadius:"var(--r-pill)"}}>
              <i className="fas fa-search" style={{fontSize:13, color:"var(--fg-subtle)"}}></i>
              <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Buscar conversación…</span>
            </div>
          </div>
          <div style={{flex:1, overflowY:"auto", padding:"4px 8px"}}>
            {msgsData.map(c=><ConvoItem key={c.init} c={c}/>)}
          </div>
        </div>

        {/* Hilo */}
        <div style={{display:"flex", flexDirection:"column", minHeight:0}}>
          {/* Contexto de la propiedad */}
          <div style={{display:"flex", alignItems:"center", gap:14, padding:"12px 20px",
            borderBottom:"1px solid var(--border)", background:"var(--bg-elevated)"}}>
            <div style={{width:52, height:40, borderRadius:"var(--r-sm)", flexShrink:0,
              background:"linear-gradient(135deg,#283a5c,#1e2d4a)", display:"flex",
              alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.5)"}}>
              <i className="fas fa-camera" style={{fontSize:14}}></i></div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{font:"var(--text-label)", fontWeight:700, color:"var(--fg-strong)"}}>Casa moderna con jardín</div>
              <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>Q 1,850,000 · Zona 14 · con Carlos Ramírez <i className="fas fa-check-circle" style={{color:"var(--green-600)"}}></i></div>
            </div>
            <button className="kq-btn kq-btn--outline kq-btn--sm">Ver publicación</button>
            <button className="kq-btn kq-btn--accent kq-btn--sm" style={{display:"flex", gap:7}}>
              <i className="fas fa-cube" style={{fontSize:13}}></i> Modelo 3D</button>
          </div>

          {/* Mensajes */}
          <div style={{flex:1, overflowY:"auto", padding:"24px 28px", display:"flex",
            flexDirection:"column", gap:16}}>
            <div style={{alignSelf:"center", font:"var(--text-caption)", color:"var(--fg-subtle)",
              background:"var(--surface-sunk)", padding:"4px 14px", borderRadius:"999px"}}>Hoy</div>
            <Bubble time="10:36">Hola Ana, vi tu publicación de la casa en Zona 14. ¿Sigue disponible?</Bubble>
            <Bubble mine time="10:38">¡Hola Carlos! Sí, está disponible. ¿Ya viste el modelo 3D? Podés recorrerla desde la publicación.</Bubble>
            <Bubble time="10:40">Sí, lo acabo de ver — el jardín es justo lo que buscamos. Me encantó la cocina.</Bubble>
            <Bubble time="10:42">¿Sigue disponible para visita el sábado?</Bubble>
          </div>

          {/* Composer */}
          <div style={{padding:"14px 20px 18px", borderTop:"1px solid var(--border)",
            background:"var(--bg-elevated)"}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <button style={{width:42, height:42, borderRadius:"999px", flexShrink:0,
                border:"1.5px solid var(--border-strong)", background:"var(--surface)",
                color:"var(--fg-muted)", cursor:"pointer"}}>
                <i className="fas fa-paperclip" style={{fontSize:15}}></i></button>
              <div style={{flex:1, display:"flex", alignItems:"center", height:46, padding:"0 18px",
                background:"var(--surface)", border:"1.5px solid var(--border-strong)",
                borderRadius:"var(--r-pill)"}}>
                <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Escribí un mensaje…</span>
              </div>
              <button style={{width:46, height:46, borderRadius:"999px", flexShrink:0, border:"none",
                background:"var(--green-500)", color:"var(--navy-900)", cursor:"pointer",
                boxShadow:"var(--shadow-sm)"}}>
                <i className="fas fa-paper-plane" style={{fontSize:16}}></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {MessagesScreen});
