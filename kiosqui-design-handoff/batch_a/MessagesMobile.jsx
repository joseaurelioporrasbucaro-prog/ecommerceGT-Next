/* Batch A.1 — /messages en mobile: patrón lista → hilo apilado (una vista a la vez).
   Reusa Bubble/ConvoItem de MessagesScreen.jsx (se carga antes). Ancho teléfono 390. */

function MTopbar({title, back, onBack, action}) {
  return (
    <div style={{height:60, flexShrink:0, display:"flex", alignItems:"center", gap:12,
      padding:"0 14px", borderBottom:"1px solid var(--border)", background:"var(--bg-elevated)"}}>
      {back && (
        <button onClick={onBack} style={{width:38, height:38, borderRadius:"999px", flexShrink:0,
          border:"none", background:"var(--surface-sunk)", color:"var(--fg-strong)", cursor:"pointer"}}>
          <i className="fas fa-arrow-left" style={{fontSize:15}}></i></button>
      )}
      <div style={{flex:1, minWidth:0}}>{title}</div>
      {action}
    </div>
  );
}

/* Estado 1 — bandeja (lista) */
function MessagesMobileInbox() {
  return (
    <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <MTopbar title={<span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20,
        color:"var(--fg-strong)"}}>Mensajes</span>}/>
      <div style={{padding:"12px 12px 0"}}>
        <div style={{display:"flex", alignItems:"center", gap:9, height:42, padding:"0 14px",
          background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"999px"}}>
          <i className="fas fa-search" style={{fontSize:13, color:"var(--fg-subtle)"}}></i>
          <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Buscar conversación…</span>
        </div>
      </div>
      <div style={{flex:1, overflowY:"auto", padding:"8px"}}>
        {msgsData.map(c=><ConvoItem key={c.init} c={c}/>)}
      </div>
    </div>
  );
}

/* Estado 2 — hilo (con back, contexto compacto colapsable y composer) */
function MessagesMobileThread() {
  return (
    <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <MTopbar back
        title={
          <div style={{display:"flex", alignItems:"center", gap:10, minWidth:0}}>
            <div style={{width:36, height:36, borderRadius:"999px", flexShrink:0,
              background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--font-display)", fontWeight:700, fontSize:12}}>CR</div>
            <div style={{minWidth:0}}>
              <div style={{font:"var(--text-label)", color:"var(--fg-strong)", lineHeight:1.2,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>Carlos Ramírez <i className="fas fa-check-circle" style={{color:"var(--green-600)", fontSize:11}}></i></div>
              <div style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>En línea</div>
            </div>
          </div>}
      />
      {/* Contexto de propiedad compacto */}
      <div style={{display:"flex", alignItems:"center", gap:11, padding:"10px 14px",
        borderBottom:"1px solid var(--border)", background:"var(--accent-soft)"}}>
        <div style={{width:44, height:34, borderRadius:"var(--r-sm)", flexShrink:0,
          background:"linear-gradient(135deg,#283a5c,#1e2d4a)", display:"flex",
          alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.5)"}}>
          <i className="fas fa-camera" style={{fontSize:12}}></i></div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{font:"var(--text-caption)", fontWeight:700, color:"var(--fg-strong)",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>Casa moderna con jardín</div>
          <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>Q 1,850,000 · Zona 14</div>
        </div>
        <button className="kq-btn kq-btn--accent kq-btn--sm" style={{display:"flex", gap:6, flexShrink:0,
          padding:"7px 12px"}}>
          <i className="fas fa-cube" style={{fontSize:12}}></i> 3D</button>
      </div>
      {/* Mensajes */}
      <div style={{flex:1, overflowY:"auto", padding:"18px 16px", display:"flex",
        flexDirection:"column", gap:14}}>
        <div style={{alignSelf:"center", font:"var(--text-caption)", color:"var(--fg-subtle)",
          background:"var(--surface-sunk)", padding:"4px 14px", borderRadius:"999px"}}>Hoy</div>
        <Bubble time="10:36">Hola Ana, vi tu publicación. ¿Sigue disponible?</Bubble>
        <Bubble mine time="10:38">¡Hola Carlos! Sí. ¿Ya viste el modelo 3D?</Bubble>
        <Bubble time="10:42">¿Sigue disponible para visita el sábado?</Bubble>
      </div>
      {/* Composer */}
      <div style={{padding:"10px 12px 14px", borderTop:"1px solid var(--border)", background:"var(--bg-elevated)"}}>
        <div style={{display:"flex", alignItems:"center", gap:9}}>
          <button style={{width:40, height:40, borderRadius:"999px", flexShrink:0,
            border:"1.5px solid var(--border-strong)", background:"var(--surface)",
            color:"var(--fg-muted)", cursor:"pointer"}}>
            <i className="fas fa-paperclip" style={{fontSize:14}}></i></button>
          <div style={{flex:1, display:"flex", alignItems:"center", height:44, padding:"0 16px",
            background:"var(--surface)", border:"1.5px solid var(--border-strong)", borderRadius:"999px"}}>
            <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>Mensaje…</span>
          </div>
          <button style={{width:44, height:44, borderRadius:"999px", flexShrink:0, border:"none",
            background:"var(--green-500)", color:"var(--navy-900)", cursor:"pointer"}}>
            <i className="fas fa-paper-plane" style={{fontSize:15}}></i></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {MessagesMobileInbox, MessagesMobileThread, MTopbar});
