/* PublishFlow — multi-step "publicar inmueble" wizard */
function Stepper({step}) {
  const steps = ["Tipo", "Detalles", "Fotos", "Precio"];
  return (
    <div style={{display:"flex", alignItems:"center", gap:0, marginBottom:36}}>
      {steps.map((s,i)=>(
        <React.Fragment key={s}>
          <div style={{display:"flex", alignItems:"center", gap:9}}>
            <div style={{width:30, height:30, borderRadius:"999px", display:"flex",
              alignItems:"center", justifyContent:"center", font:"var(--text-label)",
              fontFamily:"var(--font-display)",
              background: i<step ? "var(--green-500)" : i===step ? "var(--navy-800)" : "var(--sand-200)",
              color: i<=step ? (i===step?"var(--cream)":"var(--navy-900)") : "var(--fg-subtle)"}}>
              {i<step ? <IconCheck size={16}/> : i+1}</div>
            <span style={{font:"var(--text-body-sm)", fontWeight:i===step?700:500,
              color: i<=step ? "var(--fg-strong)" : "var(--fg-subtle)"}}>{s}</span>
          </div>
          {i<steps.length-1 && <div style={{flex:1, height:2, margin:"0 14px",
            background: i<step ? "var(--green-500)" : "var(--border-strong)"}}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PublishFlow({onDone}) {
  const [step, setStep] = React.useState(0);
  const [pType, setPType] = React.useState("Casa");
  const next = () => step<3 ? setStep(step+1) : onDone();
  const types = [["Casa",<IconHome size={26}/>],["Apartamento",<IconBuilding size={26}/>],
    ["Terreno",<IconRuler size={26}/>],["Oficina",<IconBuilding size={26}/>]];
  return (
    <div style={{maxWidth:680, margin:"0 auto", padding:"40px 28px 72px"}}>
      <h1 style={{font:"var(--text-h1)", fontFamily:"var(--font-display)", fontWeight:700,
        letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 6px"}}>Publica tu inmueble</h1>
      <p style={{font:"var(--text-body)", color:"var(--fg-muted)", margin:"0 0 32px"}}>
        Completa los pasos. Es gratis y toma menos de 5 minutos.</p>
      <Stepper step={step}/>

      <div className="kq-card" style={{padding:28}}>
        {step===0 && (<>
          <h3 style={{font:"var(--text-h3)", fontFamily:"var(--font-display)", fontWeight:600, margin:"0 0 4px"}}>¿Qué tipo de inmueble?</h3>
          <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"0 0 20px"}}>Selecciona una categoría.</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14}}>
            {types.map(([t,ic])=>(
              <button key={t} onClick={()=>setPType(t)} style={{display:"flex", alignItems:"center", gap:14,
                padding:"18px 18px", borderRadius:"var(--r-md)", cursor:"pointer", textAlign:"left",
                background: pType===t ? "var(--lav-100)" : "var(--surface)",
                border: pType===t ? "2px solid var(--lav-500)" : "2px solid var(--border)"}}>
                <span style={{color: pType===t ? "var(--lav-700)":"var(--navy-600)"}}>{ic}</span>
                <span style={{font:"var(--text-h4)", fontFamily:"var(--font-display)", fontWeight:600,
                  color:"var(--fg-strong)"}}>{t}</span>
              </button>
            ))}
          </div>
        </>)}

        {step===1 && (<>
          <h3 style={{font:"var(--text-h3)", fontFamily:"var(--font-display)", fontWeight:600, margin:"0 0 20px"}}>Detalles del inmueble</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
            <div className="kq-field" style={{gridColumn:"1/3"}}><label>Título del anuncio</label>
              <input className="kq-input" defaultValue="Casa moderna con jardín"/></div>
            <div className="kq-field"><label>Habitaciones</label><input className="kq-input" defaultValue="3"/></div>
            <div className="kq-field"><label>Baños</label><input className="kq-input" defaultValue="2.5"/></div>
            <div className="kq-field"><label>Área (m²)</label><input className="kq-input" defaultValue="180"/></div>
            <div className="kq-field"><label>Parqueos</label><input className="kq-input" defaultValue="2"/></div>
            <div className="kq-field" style={{gridColumn:"1/3"}}><label>Ubicación</label>
              <input className="kq-input" defaultValue="Zona 14, Ciudad de Guatemala"/></div>
          </div>
        </>)}

        {step===2 && (<>
          <h3 style={{font:"var(--text-h3)", fontFamily:"var(--font-display)", fontWeight:600, margin:"0 0 4px"}}>Agrega fotos</h3>
          <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"0 0 20px"}}>Anuncios con fotos reciben 5× más consultas.</p>
          <div style={{border:"2px dashed var(--border-strong)", borderRadius:"var(--r-lg)",
            padding:"40px", textAlign:"center", color:"var(--fg-muted)", background:"var(--surface-sunk)"}}>
            <div style={{width:54, height:54, margin:"0 auto 14px", borderRadius:"999px",
              background:"var(--lav-200)", color:"var(--lav-700)", display:"flex",
              alignItems:"center", justifyContent:"center"}}><IconCamera size={28}/></div>
            <div style={{font:"var(--text-label)", color:"var(--fg-strong)", marginBottom:4}}>Arrastra tus fotos aquí</div>
            <div style={{font:"var(--text-body-sm)"}}>o haz clic para seleccionar · JPG, PNG hasta 10MB</div>
          </div>
        </>)}

        {step===3 && (<>
          <h3 style={{font:"var(--text-h3)", fontFamily:"var(--font-display)", fontWeight:600, margin:"0 0 20px"}}>Precio y operación</h3>
          <div style={{display:"flex", gap:10, marginBottom:18}}>
            <span className="kq-chip kq-chip--active">Venta</span>
            <span className="kq-chip">Renta</span>
          </div>
          <div className="kq-field"><label>Precio (GTQ)</label>
            <input className="kq-input" defaultValue="Q 1,850,000" style={{fontSize:"1.25rem", fontFamily:"var(--font-display)"}}/></div>
          <div style={{display:"flex", gap:11, marginTop:22, padding:"14px 16px",
            background:"var(--green-100)", borderRadius:"var(--r-md)", color:"var(--green-800)"}}>
            <IconShield size={20}/>
            <span style={{font:"var(--text-body-sm)"}}>Tu anuncio será revisado y verificado antes de publicarse.</span>
          </div>
        </>)}
      </div>

      <div style={{display:"flex", justifyContent:"space-between", marginTop:24}}>
        <button className="kq-btn kq-btn--ghost" onClick={()=>step>0?setStep(step-1):onDone()}>
          {step>0 ? "Atrás" : "Cancelar"}</button>
        <button className="kq-btn kq-btn--action" onClick={next} style={{display:"flex", gap:8}}>
          {step<3 ? "Continuar" : "Publicar inmueble"} {step<3 && <IconArrowR size={17}/>}</button>
      </div>
    </div>
  );
}
Object.assign(window, {PublishFlow, Stepper});
