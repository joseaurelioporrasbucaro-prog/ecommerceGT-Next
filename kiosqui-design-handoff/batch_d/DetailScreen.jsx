/* Batch D — Detalle de publicación (/publications/[id])
   Galería protagonista + 3D · precio/título/ubicación · specs · amenidades ·
   card de vendedor (rating verde) · mapa · barra sticky móvil. */

function DSpec({icon, value, label}) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:12, padding:"15px 16px",
      background:"var(--surface-sunk)", borderRadius:"var(--r-md)"}}>
      <i className={icon} style={{color:"var(--lav-700)", fontSize:20, width:22, textAlign:"center"}}></i>
      <div>
        <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:19,
          color:"var(--fg-strong)", lineHeight:1.1}}>{value}</div>
        <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>{label}</div>
      </div>
    </div>
  );
}

function DetailScreen() {
  return (
    <div style={{width:"100%", height:"100%", overflow:"hidden", display:"flex", flexDirection:"column",
      background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <div style={{flex:1, overflowY:"auto"}}>
        <div style={{maxWidth:1120, margin:"0 auto", padding:"20px 28px 40px"}}>
          <button style={{display:"flex", alignItems:"center", gap:7, background:"none", border:"none",
            cursor:"pointer", color:"var(--fg-muted)", font:"var(--text-body-sm)", fontWeight:600,
            fontFamily:"var(--font-body)", padding:"4px 0", marginBottom:14}}>
            <i className="fas fa-chevron-left"></i> Volver a resultados</button>

          {/* Galería protagonista */}
          <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, height:420, marginBottom:26}}>
            <div style={{position:"relative", borderRadius:"var(--r-lg)", overflow:"hidden",
              background:"linear-gradient(135deg,#283a5c,#1e2d4a)", display:"flex",
              alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.45)"}}>
              <i className="fas fa-camera" style={{fontSize:34}}></i>
            </div>
            <div style={{display:"grid", gridTemplateRows:"1fr 1fr", gap:10}}>
              <div style={{borderRadius:"var(--r-lg)", background:"linear-gradient(135deg,#6d62cf,#45407e)",
                display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.4)"}}>
                <i className="fas fa-camera" style={{fontSize:24}}></i></div>
              <div style={{position:"relative", borderRadius:"var(--r-lg)", overflow:"hidden",
                background:"linear-gradient(135deg,#84ad3f,#5c7c28)", display:"flex",
                alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.4)"}}>
                <i className="fas fa-camera" style={{fontSize:24}}></i>
                <span style={{position:"absolute", inset:0, background:"rgba(17,24,42,.5)",
                  display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
                  font:"var(--text-label)", fontFamily:"var(--font-display)"}}>+21 fotos</span></div>
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:38, alignItems:"start"}}>
            {/* Columna principal */}
            <div>
              <div style={{display:"flex", gap:9, marginBottom:13}}>
                <span className="kq-badge-feat"><i className="fas fa-star"></i> Destacado</span>
                <span className="kq-badge-type">Venta</span>
              </div>
              <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:32,
                letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 8px"}}>Casa moderna con jardín y dúplex</h1>
              <div style={{display:"flex", alignItems:"center", gap:7, color:"var(--fg-muted)",
                font:"var(--text-body)", marginBottom:22}}>
                <i className="fas fa-map-marker-alt" style={{color:"var(--lav-700)"}}></i> Zona 14, Ciudad de Guatemala</div>

              <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:30}}>
                <DSpec icon="fas fa-bed" value="3" label="Habitaciones"/>
                <DSpec icon="fas fa-bath" value="2.5" label="Baños"/>
                <DSpec icon="fas fa-vector-square" value="180" label="m² const."/>
                <DSpec icon="fas fa-car" value="2" label="Parqueos"/>
              </div>

              <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:21,
                color:"var(--fg-strong)", margin:"0 0 10px"}}>Descripción</h3>
              <p style={{font:"var(--text-body)", color:"var(--fg)", margin:"0 0 26px", maxWidth:560}}>
                Hermosa propiedad en una de las mejores zonas de la ciudad. Amplios espacios llenos de
                luz natural, acabados modernos y áreas verdes. A pocos minutos de centros comerciales,
                colegios y vías principales.</p>

              <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:21,
                color:"var(--fg-strong)", margin:"0 0 14px"}}>Amenidades</h3>
              <div style={{display:"flex", flexWrap:"wrap", gap:10, marginBottom:30}}>
                {["Cocina equipada","Seguridad 24/7","Áreas verdes","Gimnasio","Piscina","Pet friendly"].map(a=>(
                  <span key={a} style={{display:"inline-flex", alignItems:"center", gap:8,
                    padding:"9px 14px", borderRadius:"var(--r-sm)", background:"var(--surface-sunk)",
                    font:"var(--text-body-sm)", fontWeight:500, color:"var(--fg)"}}>
                    <i className="fas fa-check" style={{color:"var(--green-600)", fontSize:12}}></i> {a}</span>
                ))}
              </div>

              {/* Mapa */}
              <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:21,
                color:"var(--fg-strong)", margin:"0 0 14px"}}>Ubicación</h3>
              <div style={{height:240, borderRadius:"var(--r-lg)", overflow:"hidden", position:"relative",
                background:"linear-gradient(135deg,#344a72,#161f33)", display:"flex",
                alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.7)"}}>
                <i className="fas fa-map-marker-alt" style={{fontSize:38}}></i>
              </div>
            </div>

            {/* Card de vendedor sticky */}
            <div style={{position:"sticky", top:0}}>
              <div style={{background:"var(--surface)", border:"1px solid var(--border)",
                borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-md)", padding:24}}>
                <div style={{display:"flex", alignItems:"baseline", gap:10}}>
                  <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:30,
                    color:"var(--fg-strong)", letterSpacing:"-.02em"}}>Q 1,850,000</span>
                </div>
                <div style={{font:"var(--text-body-sm)", color:"var(--fg-subtle)", marginBottom:20}}>US$ 237,000 · Precio de venta</div>

                <div style={{display:"flex", alignItems:"center", gap:12, padding:"14px 0",
                  borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", marginBottom:18}}>
                  <div style={{width:48, height:48, borderRadius:"999px", flexShrink:0,
                    background:"linear-gradient(135deg,var(--navy-700),var(--navy-900))", color:"var(--cream)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"var(--font-display)", fontWeight:700}}>AM</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{font:"var(--text-label)", color:"var(--fg-strong)", display:"flex",
                      alignItems:"center", gap:6}}>Andrea Móvil <i className="fas fa-check-circle" style={{color:"var(--green-600)", fontSize:12}}></i></div>
                    <div style={{display:"flex", alignItems:"center", gap:5, font:"var(--text-caption)", color:"var(--fg-muted)"}}>
                      <i className="fas fa-star" style={{color:"var(--rating, var(--green-600))", fontSize:11}}></i> 4.9 · Agente verificado</div>
                  </div>
                </div>

                <button className="kq-btn kq-btn--action" style={{width:"100%", display:"flex", gap:8}}>
                  <i className="fas fa-comment-dots"></i> Enviar mensaje</button>
                {/* Modelo 3D Premium — junto al CTA de mensaje */}
                <button style={{width:"100%", marginTop:10, display:"flex", gap:9, alignItems:"center",
                  justifyContent:"center", height:50, borderRadius:"999px", cursor:"pointer",
                  border:"1.5px solid var(--lav-500)", background:"var(--lav-100)", color:"var(--lav-700)",
                  fontFamily:"var(--font-display)", fontWeight:700, fontSize:15}}>
                  <i className="fas fa-cube" style={{fontSize:16}}></i> Ver modelo 3D
                  <span style={{display:"inline-flex", alignItems:"center", gap:5, marginLeft:2,
                    padding:"4px 10px", borderRadius:"999px", background:"var(--lav-500)", color:"#fff",
                    fontSize:12, fontWeight:800}}>
                    <i className="fas fa-crown" style={{fontSize:11, color:"#ffd86b"}}></i> Premium</span>
                </button>
                <div style={{display:"flex", gap:10, marginTop:14}}>
                  <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{flex:1, display:"flex", gap:7}}>
                    <i className="far fa-heart"></i> Guardar</button>
                  <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{flex:1, display:"flex", gap:7}}>
                    <i className="fas fa-share-alt"></i> Compartir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra sticky móvil (demostrativa, abajo) */}
      <div style={{flexShrink:0, display:"flex", alignItems:"center", gap:14, padding:"12px 28px",
        borderTop:"1px solid var(--border)", background:"var(--bg-elevated)"}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--fg-strong)"}}>Q 1,850,000</div>
          <div style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>US$ 237,000 · Venta</div>
        </div>
        <button className="kq-btn kq-btn--outline kq-btn--sm" style={{display:"flex", gap:7, alignItems:"center"}}>
          <i className="fas fa-cube"></i> 3D <i className="fas fa-crown" style={{fontSize:10, color:"#e0a93b"}}></i></button>
        <button className="kq-btn kq-btn--action" style={{display:"flex", gap:8}}>
          <i className="fas fa-comment-dots"></i> Enviar mensaje</button>
      </div>
    </div>
  );
}

Object.assign(window, {DetailScreen, DSpec});
