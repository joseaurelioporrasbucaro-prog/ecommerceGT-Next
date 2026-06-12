/* Card v2.1 — exploración del CTA "Enviar mensaje" para cards pautadas.
   4 opciones del botón, mostradas en light y dark. */

function CtaCardShell({children, label}) {
  return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:10}}>
      <div style={{width:316, background:"var(--surface)", borderRadius:"var(--r-lg)", overflow:"hidden",
        border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)"}}>
        <CvPhoto i={0}>
          <CvBadge>Patrocinado</CvBadge>
          <CvFav/>
        </CvPhoto>
        <div style={{padding:"16px 18px 18px"}}>
          <PriceSwitch gtq="2,650,000" usd="339,700"/>
          <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)",
            margin:"10px 0 5px"}}>Casa en condominio cerrado</div>
          <div style={{display:"flex", alignItems:"center", gap:7, font:"var(--text-body-sm)",
            color:"var(--fg-muted)"}}>
            <i className="fas fa-map-marker-alt" style={{fontSize:12, color:"var(--accent-hover)"}}></i>
            Zona 16, Ciudad de Guatemala</div>
          <div style={{display:"flex", gap:22, marginTop:14, paddingTop:14,
            borderTop:"1px solid var(--border)"}}>
            <Spec21 icon="fa-bed">4 hab</Spec21>
            <Spec21 icon="fa-bath">3.5 baños</Spec21>
            <Spec21 icon="fa-vector-square">260 m²</Spec21>
          </div>
          {children}
        </div>
      </div>
      <span style={{font:"var(--text-caption)", fontWeight:700, color:"var(--fg-subtle)",
        fontFamily:"var(--font-body)"}}>{label}</span>
    </div>
  );
}

/* Opción 1 — verde sólido (la actual) */
function Cta1() {
  return (
    <CtaCardShell label="1 · Verde sólido (actual)">
      <button className="kq-btn kq-btn--action kq-btn--sm" style={{width:"100%",
        justifyContent:"center", display:"flex", gap:8, marginTop:14}}>
        <i className="fas fa-comments" style={{fontSize:12}}></i> Enviar mensaje</button>
    </CtaCardShell>
  );
}

/* Opción 2 — outline navy: presente pero discreto, no compite con el precio */
function Cta2() {
  return (
    <CtaCardShell label="2 · Outline discreto">
      <button className="kq-btn kq-btn--outline kq-btn--sm" style={{width:"100%",
        justifyContent:"center", display:"flex", gap:8, marginTop:14}}>
        <i className="fas fa-comments" style={{fontSize:12}}></i> Enviar mensaje</button>
    </CtaCardShell>
  );
}

/* Opción 3 — ghost lavanda con flecha: parece link, mínimo peso */
function Cta3() {
  return (
    <CtaCardShell label="3 · Texto lavanda">
      <button style={{width:"100%", marginTop:14, display:"flex", alignItems:"center",
        justifyContent:"center", gap:8, background:"var(--accent-soft)", border:"none",
        borderRadius:"var(--r-pill)", padding:"10px 0", cursor:"pointer",
        font:"var(--text-label)", fontSize:13, color:"var(--lav-700)",
        fontFamily:"var(--font-display)"}}>
        <i className="fas fa-comments" style={{fontSize:12}}></i> Enviar mensaje
        <i className="fas fa-arrow-right" style={{fontSize:11}}></i></button>
    </CtaCardShell>
  );
}

/* Opción 4 — split: contacto compacto a la derecha del specs row, sin fila extra */
function Cta4() {
  return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:10}}>
      <div style={{width:316, background:"var(--surface)", borderRadius:"var(--r-lg)", overflow:"hidden",
        border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)"}}>
        <CvPhoto i={0}>
          <CvBadge>Patrocinado</CvBadge>
          <CvFav/>
        </CvPhoto>
        <div style={{padding:"16px 18px 18px"}}>
          <PriceSwitch gtq="2,650,000" usd="339,700"/>
          <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)",
            margin:"10px 0 5px"}}>Casa en condominio cerrado</div>
          <div style={{display:"flex", alignItems:"center", gap:7, font:"var(--text-body-sm)",
            color:"var(--fg-muted)"}}>
            <i className="fas fa-map-marker-alt" style={{fontSize:12, color:"var(--accent-hover)"}}></i>
            Zona 16, Ciudad de Guatemala</div>
          <div style={{display:"flex", alignItems:"center", gap:18, marginTop:14, paddingTop:14,
            borderTop:"1px solid var(--border)"}}>
            <Spec21 icon="fa-bed">4 hab</Spec21>
            <Spec21 icon="fa-bath">3.5</Spec21>
            <button style={{marginLeft:"auto", width:38, height:38, borderRadius:"999px",
              border:"none", cursor:"pointer", background:"var(--green-500)", color:"var(--navy-900)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
              boxShadow:"var(--shadow-xs)"}} title="Enviar mensaje">
              <i className="fas fa-comments"></i></button>
          </div>
        </div>
      </div>
      <span style={{font:"var(--text-caption)", fontWeight:700, color:"var(--fg-subtle)",
        fontFamily:"var(--font-body)"}}>4 · Burbuja compacta</span>
    </div>
  );
}

Object.assign(window, {Cta1, Cta2, Cta3, Cta4, CtaCardShell});
