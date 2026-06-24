/* Batch F — Pantallas de soporte/admin. Reusa SupportShell.jsx. */

const fTickets = [
  {id:1042, subject:"No puedo subir fotos a mi publicación", owner:"Carlos Ramírez", handle:"carlosramirez", cat:"Publicaciones", status:"open", agent:"-", date:"23 jun"},
  {id:1041, subject:"¿Cómo recargo saldo de pauta?", owner:"Lucía Martínez", handle:"luciamz", cat:"Pauta", status:"in_progress", agent:"Andrea M.", date:"23 jun"},
  {id:1038, subject:"Error al verificar mi DPI", owner:"Jorge Pérez", handle:"jperez", cat:"Cuenta", status:"in_progress", agent:"Andrea M.", date:"22 jun"},
  {id:1035, subject:"Solicito reembolso de campaña", owner:"María Solís", handle:"mariasolis", cat:"Pauta", status:"resolved", agent:"Diego V.", date:"21 jun"},
  {id:1030, subject:"Mi cuenta aparece suspendida", owner:"Ricardo González", handle:"ricardog", cat:"Cuenta", status:"closed", agent:"Diego V.", date:"20 jun"},
];

function TicketsScreen() {
  return (
    <StaffShell active="tickets" title="Cola de tickets" sub="Todos los tickets de soporte. Filtrá por estado o asignación.">
      <div style={{display:"flex", gap:14, flexWrap:"wrap", alignItems:"center", marginBottom:18}}>
        <FilterTabs active="" tabs={[["","Todos"],["open","Abiertos"],["in_progress","En progreso"],["resolved","Resueltos"],["closed","Cerrados"]]}/>
        <div style={{width:1, height:24, background:"var(--border)"}}></div>
        <FilterTabs active="" tabs={[["","Todos"],["me","Míos"],["unassigned","Sin asignar"]]}/>
        <span style={{marginLeft:"auto", font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>
          <strong style={{color:"var(--fg-strong)"}}>32</strong> tickets</span>
      </div>
      <DataTable cols={[{label:"#"},{label:"Asunto"},{label:"Solicitante"},{label:"Categoría"},{label:"Estado"},{label:"Agente"},{label:"Actualizado", right:true}]}>
        {fTickets.map(t=>(
          <Row key={t.id} onClick={()=>{}}>
            <Cell mono muted>#{t.id}</Cell>
            <Cell strong>{t.subject}</Cell>
            <Cell>{t.owner} <span style={{color:"var(--accent-hover)"}}>@{t.handle}</span></Cell>
            <Cell muted>{t.cat}</Cell>
            <Cell><StatusChip s={t.status}/></Cell>
            <Cell>{t.agent==="-" ? <span style={{color:"var(--fg-subtle)"}}>Sin asignar</span> :
              <span style={{display:"inline-flex", alignItems:"center", gap:7}}><Av init={t.agent.split(" ").map(x=>x[0]).join("")} sm/> {t.agent}</span>}</Cell>
            <Cell right muted mono>{t.date}</Cell>
          </Row>
        ))}
      </DataTable>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:18,
        font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>
        <span>Mostrando 1–5 de 32</span>
        <div style={{display:"flex", gap:6}}>
          {["‹","1","2","3","›"].map((n,i)=>(
            <button key={i} style={{minWidth:34, height:34, borderRadius:"var(--r-sm)", cursor:"pointer",
              border: n==="1"?"1.5px solid transparent":"1.5px solid var(--border-strong)",
              background: n==="1"?"var(--navy-800)":"var(--surface)",
              color: n==="1"?"var(--cream)":"var(--fg)", font:"var(--text-body-sm)", fontWeight:600}}>{n}</button>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}

function TicketDetailScreen() {
  const msgs = [
    {who:"Carlos Ramírez", staff:false, time:"23 jun · 09:14", body:"Hola, cada vez que intento subir fotos a mi publicación me da error. ¿Me pueden ayudar?"},
    {who:"Andrea Móvil", staff:true, time:"23 jun · 09:40", body:"¡Hola Carlos! Gracias por escribir. ¿Qué tamaño tienen las fotos? El límite por imagen es 10MB."},
    {who:"Andrea Móvil", staff:true, internal:true, time:"23 jun · 09:41", body:"Nota interna: revisar si el bucket de imágenes está rechazando >10MB sin mensaje claro."},
    {who:"Carlos Ramírez", staff:false, time:"23 jun · 10:02", body:"Ah, una pesa 14MB. Voy a reducirla y vuelvo a intentar. ¡Gracias!"},
  ];
  return (
    <StaffShell active="tickets" title="Ticket #1042" sub="No puedo subir fotos a mi publicación">
      <div style={{display:"grid", gridTemplateColumns:"1fr 300px", gap:24, alignItems:"start"}}>
        {/* Hilo */}
        <div>
          <div style={{display:"flex", flexDirection:"column", gap:12, marginBottom:20}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{border:"1px solid "+(m.internal?"var(--warning)":m.staff?"var(--lav-300)":"var(--border)"),
                borderRadius:"var(--r-md)", padding:"14px 16px",
                background: m.internal?"var(--warning-bg)":m.staff?"var(--lav-100)":"var(--surface)"}}>
                <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:7}}>
                  <Av init={m.who.split(" ").map(x=>x[0]).join("")} sm/>
                  <strong style={{font:"var(--text-body-sm)", color:"var(--fg-strong)"}}>{m.who}</strong>
                  {m.staff && !m.internal && <span style={{font:"var(--text-caption)", fontWeight:700, padding:"1px 8px", borderRadius:"999px", background:"var(--lav-500)", color:"#fff"}}>Soporte</span>}
                  {m.internal && <span style={{font:"var(--text-caption)", fontWeight:700, padding:"1px 8px", borderRadius:"999px", background:"var(--warning)", color:"#fff"}}>Nota interna</span>}
                  <span style={{marginLeft:"auto", font:"var(--text-caption)", color:"var(--fg-subtle)"}}>{m.time}</span>
                </div>
                <p style={{margin:0, font:"var(--text-body)", color:"var(--fg)"}}>{m.body}</p>
              </div>
            ))}
          </div>
          {/* Responder */}
          <div style={{border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:14, background:"var(--surface)"}}>
            <textarea className="kq-input" rows={3} placeholder="Escribí tu respuesta…"
              style={{resize:"vertical", fontFamily:"var(--font-body)"}}></textarea>
            <div style={{display:"flex", alignItems:"center", gap:14, marginTop:12}}>
              <label style={{display:"flex", alignItems:"center", gap:8, font:"var(--text-body-sm)", color:"var(--fg-muted)", cursor:"pointer", marginRight:"auto"}}>
                <input type="checkbox" style={{width:16, height:16, accentColor:"var(--warning)"}}/> Nota interna</label>
              <button className="kq-btn kq-btn--action">Responder</button>
            </div>
          </div>
        </div>
        {/* Panel lateral de control */}
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          <div style={{border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:18, background:"var(--surface)"}}>
            <div style={{font:"var(--text-label)", color:"var(--fg-strong)", marginBottom:12}}>Estado</div>
            <div style={{position:"relative", marginBottom:18}}>
              <select className="kq-input" defaultValue="Abierto" style={{appearance:"none", cursor:"pointer", paddingRight:38}}>
                <option>Abierto</option><option>En progreso</option><option>Resuelto</option><option>Cerrado</option>
              </select>
              <i className="fas fa-chevron-down" style={{position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"var(--fg-subtle)", pointerEvents:"none"}}></i>
            </div>
            <div style={{font:"var(--text-label)", color:"var(--fg-strong)", marginBottom:12}}>Asignado a</div>
            <div style={{position:"relative"}}>
              <select className="kq-input" defaultValue="Andrea Móvil" style={{appearance:"none", cursor:"pointer", paddingRight:38}}>
                <option>Sin asignar</option><option>Andrea Móvil</option><option>Diego Vargas</option>
              </select>
              <i className="fas fa-chevron-down" style={{position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"var(--fg-subtle)", pointerEvents:"none"}}></i>
            </div>
          </div>
          <div style={{border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:18, background:"var(--surface)",
            display:"flex", flexDirection:"column", gap:10, font:"var(--text-body-sm)"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"var(--fg-muted)"}}>Solicitante</span><span style={{color:"var(--fg-strong)", fontWeight:600}}>Carlos Ramírez</span></div>
            <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"var(--fg-muted)"}}>Categoría</span><span style={{color:"var(--fg-strong)"}}>Publicaciones</span></div>
            <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"var(--fg-muted)"}}>Creado</span><span style={{color:"var(--fg-strong)"}}>23 jun · 09:14</span></div>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}

Object.assign(window, {TicketsScreen, TicketDetailScreen, fTickets});
