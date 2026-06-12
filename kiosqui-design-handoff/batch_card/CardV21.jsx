/* Card v2.1 — Variante B refinada (elegida por Aurelio):
   - Foto 3:2 limpia, protagonista
   - Cuerpo con MÁS AIRE: precio (con switch animado Q ⇄ US$), ubicación, specs con íconos espaciados
   - Versión pautada con CTA "Enviar mensaje" verde */

function usePriceSwitch(gtq, usd, interval=3200) {
  const [showUsd, setShowUsd] = React.useState(false);
  React.useEffect(()=>{
    const t = setInterval(()=>setShowUsd(v=>!v), interval);
    return ()=>clearInterval(t);
  },[interval]);
  return showUsd ? {cur:"US$", val:usd, key:"usd"} : {cur:"Q", val:gtq, key:"gtq"};
}

/* Precio con transición: el número cruza con fade+slide vertical */
function PriceSwitch({gtq, usd, per}) {
  const p = usePriceSwitch(gtq, usd);
  return (
    <div style={{display:"flex", alignItems:"baseline", gap:7, overflow:"hidden"}}>
      <div key={p.key} className="kq-price-swap" style={{display:"flex", alignItems:"baseline", gap:7}}>
        <span style={{fontFamily:"var(--font-display)", fontWeight:500, fontSize:14,
          color:"var(--fg-subtle)"}}>{p.cur}</span>
        <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:23,
          letterSpacing:"-.015em", color:"var(--fg-strong)"}}>{p.val}</span>
      </div>
      {per && <span style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)"}}>{per}</span>}
    </div>
  );
}

function Spec21({icon, children}) {
  return (
    <span style={{display:"inline-flex", alignItems:"center", gap:8, font:"var(--text-body-sm)",
      color:"var(--fg-muted)", whiteSpace:"nowrap"}}>
      <i className={"fas "+icon} style={{fontSize:13, color:"var(--navy-400)"}}></i>{children}</span>
  );
}

function CardV21({feat, saved, sponsored, i=2}) {
  return (
    <div style={{width:316, background:"var(--surface)", borderRadius:"var(--r-lg)", overflow:"hidden",
      border:"1px solid var(--border)",
      boxShadow: feat ? "0 0 0 1.5px var(--lav-400), var(--shadow-sm)" : "var(--shadow-sm)",
      cursor:"pointer", transition:"transform .2s, box-shadow .2s"}}>
      <CvPhoto i={i}>
        {feat && <CvBadge feat>Destacado</CvBadge>}
        {sponsored && !feat && <CvBadge>Patrocinado</CvBadge>}
        <CvFav saved={saved}/>
      </CvPhoto>

      {/* Cuerpo con aire: 18px padding, bloques separados */}
      <div style={{padding:"16px 18px 18px"}}>
        <PriceSwitch gtq="1,850,000" usd="237,200"/>
        <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)",
          margin:"10px 0 5px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
          Casa moderna con jardín</div>
        <div style={{display:"flex", alignItems:"center", gap:7, font:"var(--text-body-sm)",
          color:"var(--fg-muted)"}}>
          <i className="fas fa-map-marker-alt" style={{fontSize:12, color:"var(--accent-hover)"}}></i>
          Zona 14, Ciudad de Guatemala</div>

        {/* Specs con íconos, espaciados, separados por hairline */}
        <div style={{display:"flex", gap:22, marginTop:14, paddingTop:14,
          borderTop:"1px solid var(--border)"}}>
          <Spec21 icon="fa-bed">3 hab</Spec21>
          <Spec21 icon="fa-bath">2.5 baños</Spec21>
          <Spec21 icon="fa-vector-square">180 m²</Spec21>
        </div>

        {sponsored && (
          <button className="kq-btn kq-btn--action kq-btn--sm kq-card-cta" style={{width:"100%",
            justifyContent:"center", display:"flex", gap:8, marginTop:14}}>
            <i className="fas fa-comments" style={{fontSize:12}}></i> Enviar mensaje</button>
        )}
      </div>
    </div>
  );
}

/* Variante renta para ver el sufijo /mes con el switch */
function CardV21Rent({saved}) {
  return (
    <div style={{width:316, background:"var(--surface)", borderRadius:"var(--r-lg)", overflow:"hidden",
      border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)", cursor:"pointer"}}>
      <CvPhoto i={1}>
        <CvFav saved={saved}/>
      </CvPhoto>
      <div style={{padding:"16px 18px 18px"}}>
        <PriceSwitch gtq="4,200" usd="540" per="/mes"/>
        <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)",
          margin:"10px 0 5px"}}>Apartamento amueblado con vista</div>
        <div style={{display:"flex", alignItems:"center", gap:7, font:"var(--text-body-sm)",
          color:"var(--fg-muted)"}}>
          <i className="fas fa-map-marker-alt" style={{fontSize:12, color:"var(--accent-hover)"}}></i>
          Zona 10, Ciudad de Guatemala</div>
        <div style={{display:"flex", gap:22, marginTop:14, paddingTop:14,
          borderTop:"1px solid var(--border)"}}>
          <Spec21 icon="fa-bed">2 hab</Spec21>
          <Spec21 icon="fa-bath">2 baños</Spec21>
          <Spec21 icon="fa-vector-square">95 m²</Spec21>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {CardV21, CardV21Rent, PriceSwitch, Spec21, usePriceSwitch});
