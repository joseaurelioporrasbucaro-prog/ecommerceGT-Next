/* Batch D — Listado de publicaciones (/publications)
   Barra de filtros cohesiva (tipo portal) + chips activos + contador +
   toggle lista↔mapa + estados loading/vacío. Reusa KqHeader. */

const dProps = [
  {price:"Q 1,850,000", usd:"US$ 237,000", type:"Casa", op:"Venta", title:"Casa moderna con jardín y dúplex", loc:"Zona 14, Guatemala", beds:3, baths:2.5, m2:180, park:2, ph:"linear-gradient(135deg,#283a5c,#1e2d4a)", feat:"Destacado", glb:true},
  {price:"Q 4,200/mes", usd:"US$ 540/mes", type:"Apartamento", op:"Renta", title:"Apartamento amueblado con vista", loc:"Zona 10, Guatemala", beds:2, baths:2, m2:95, park:1, ph:"linear-gradient(135deg,#6d62cf,#45407e)", feat:"Nuevo", glb:true},
  {price:"Q 2,650,000", usd:"US$ 340,000", type:"Casa", op:"Venta", title:"Casa en condominio cerrado", loc:"Zona 16, Guatemala", beds:4, baths:3.5, m2:260, park:3, ph:"linear-gradient(135deg,#344a72,#161f33)", glb:true},
  {price:"Q 985,000", usd:"US$ 126,000", type:"Terreno", op:"Venta", title:"Terreno residencial plano", loc:"San Lucas, Sacatepéquez", beds:0, baths:0, m2:420, park:0, ph:"linear-gradient(135deg,#84ad3f,#5c7c28)"},
  {price:"Q 1,290,000", usd:"US$ 165,000", type:"Apartamento", op:"Venta", title:"Apartamento con vista al volcán", loc:"Zona 15, Guatemala", beds:2, baths:2, m2:110, park:1, ph:"linear-gradient(135deg,#b0d56e,#6f9433)", feat:"Nuevo", glb:true},
  {price:"Q 6,500/mes", usd:"US$ 835/mes", type:"Oficina", op:"Renta", title:"Oficina en torre corporativa", loc:"Zona 4, Guatemala", beds:0, baths:1, m2:75, park:2, ph:"linear-gradient(135deg,#8a7fe3,#5b54a8)"},
];

/* ---- Tarjeta horizontal para el listado (foto + cuerpo con aire) ---- */
function DListRow({p}) {
  return (
    <div className={"pub-card"+(p.feat?" is-featured":"")} style={{display:"flex", flexShrink:0,
      background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
      overflow:"hidden", boxShadow:"var(--shadow-sm)", cursor:"pointer"}}>
      <div style={{position:"relative", width:280, flexShrink:0, minHeight:188, background:p.ph,
        display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.5)"}}>
        {p.feat && <span className="kq-badge-feat" style={{position:"absolute", top:12, left:12}}>
          <i className="fas fa-star"></i> {p.feat}</span>}
        <button style={{position:"absolute", top:10, right:10, width:36, height:36, borderRadius:"999px",
          border:"none", background:"rgba(255,255,255,.92)", color:"var(--navy-700)", cursor:"pointer"}}>
          <i className="far fa-heart" style={{fontSize:15}}></i></button>
        {p.glb && <span style={{position:"absolute", bottom:12, left:12, display:"inline-flex",
          alignItems:"center", gap:6, padding:"5px 11px", borderRadius:"999px",
          background:"rgba(17,24,42,.62)", color:"#fff", font:"var(--text-caption)", fontWeight:600,
          backdropFilter:"blur(6px)"}}><i className="fas fa-cube" style={{fontSize:11}}></i> 3D</span>}
        <i className="fas fa-camera" style={{fontSize:26}}></i>
      </div>
      <div style={{flex:1, padding:"20px 22px", display:"flex", flexDirection:"column", minWidth:0}}>
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12}}>
          <div style={{minWidth:0}}>
            <div style={{display:"flex", alignItems:"baseline", gap:10}}>
              <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:24,
                color:"var(--fg-strong)", letterSpacing:"-.01em"}}>{p.price}</span>
              <span style={{font:"var(--text-caption)", color:"var(--fg-subtle)"}}>{p.usd}</span>
            </div>
            <div style={{font:"var(--text-h4)", fontFamily:"var(--font-display)", fontWeight:600,
              color:"var(--fg)", margin:"8px 0 6px"}}>{p.title}</div>
            <div style={{display:"flex", alignItems:"center", gap:6, color:"var(--fg-muted)",
              font:"var(--text-body-sm)"}}>
              <i className="fas fa-map-marker-alt" style={{color:"var(--lav-700)", fontSize:13}}></i> {p.loc}</div>
          </div>
          <span className="kq-badge-type" style={{flexShrink:0}}>{p.op}</span>
        </div>
        <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16,
          marginTop:"auto", paddingTop:18, flexWrap:"wrap"}}>
          <div style={{display:"flex", gap:18, rowGap:10, flexWrap:"wrap",
            color:"var(--fg-muted)", font:"var(--text-body-sm)"}}>
            {p.beds>0 && <span style={{display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap"}}><i className="fas fa-bed" style={{color:"var(--navy-500)"}}></i> {p.beds} hab.</span>}
            {p.baths>0 && <span style={{display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap"}}><i className="fas fa-bath" style={{color:"var(--navy-500)"}}></i> {p.baths} baños</span>}
            <span style={{display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap"}}><i className="fas fa-vector-square" style={{color:"var(--navy-500)"}}></i> {p.m2} m²</span>
            {p.park>0 && <span style={{display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap"}}><i className="fas fa-car" style={{color:"var(--navy-500)"}}></i> {p.park} parqueos</span>}
          </div>
          <button className="kq-btn kq-btn--action kq-btn--sm" onClick={(e)=>e.stopPropagation()}
            style={{display:"flex", gap:8, flexShrink:0, whiteSpace:"nowrap"}}>
            <i className="fas fa-comment-dots" style={{fontSize:13}}></i> Enviar mensaje</button>
        </div>
      </div>
    </div>
  );
}

/* ---- Tarjeta vertical v2.1 data-driven (reusa PriceSwitch/Spec21 de CardV21.jsx) ---- */
function parsePrice(s){ // "Q 4,200/mes" -> {gtq:"4,200", per:"/mes"}
  const per = s.includes("/mes") ? "/mes" : null;
  const gtq = s.replace(/^Q\s*/,"").replace("/mes","");
  return {gtq, per};
}
function DGridCard({p}) {
  const {gtq, per} = parsePrice(p.price);
  const usd = p.usd.replace(/^US\$\s*/,"").replace("/mes","");
  return (
    <div className={"pub-card"+(p.feat?" is-featured":"")} style={{background:"var(--surface)",
      borderRadius:"var(--r-lg)", overflow:"hidden", border:"1px solid var(--border)",
      boxShadow:"var(--shadow-sm)", cursor:"pointer"}}>
      <div style={{position:"relative", aspectRatio:"3 / 2", background:p.ph,
        display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.5)"}}>
        {p.feat && <span className="kq-badge-feat" style={{position:"absolute", top:12, left:12}}>
          <i className="fas fa-star"></i> {p.feat}</span>}
        <button style={{position:"absolute", top:10, right:10, width:36, height:36, borderRadius:"999px",
          border:"none", background:"rgba(255,255,255,.92)", color:"var(--navy-700)", cursor:"pointer"}}>
          <i className="far fa-heart" style={{fontSize:15}}></i></button>
        {p.glb && <span style={{position:"absolute", bottom:12, left:12, display:"inline-flex",
          alignItems:"center", gap:6, padding:"5px 11px", borderRadius:"999px",
          background:"rgba(17,24,42,.62)", color:"#fff", font:"var(--text-caption)", fontWeight:600,
          backdropFilter:"blur(6px)"}}><i className="fas fa-cube" style={{fontSize:11}}></i> 3D</span>}
        <i className="fas fa-camera" style={{fontSize:26}}></i>
      </div>
      <div style={{padding:"16px 18px 18px"}}>
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8}}>
          <PriceSwitch gtq={gtq} usd={usd} per={per}/>
          <span className="kq-badge-type" style={{flexShrink:0}}>{p.op}</span>
        </div>
        <div style={{font:"var(--text-body-sm)", fontWeight:600, color:"var(--fg)",
          margin:"10px 0 5px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.title}</div>
        <div style={{display:"flex", alignItems:"center", gap:7, font:"var(--text-body-sm)",
          color:"var(--fg-muted)"}}>
          <i className="fas fa-map-marker-alt" style={{fontSize:12, color:"var(--accent-hover)"}}></i> {p.loc}</div>
        <div style={{display:"flex", gap:20, marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)"}}>
          {p.beds>0 && <Spec21 icon="fa-bed">{p.beds} hab</Spec21>}
          {p.baths>0 && <Spec21 icon="fa-bath">{p.baths} baños</Spec21>}
          <Spec21 icon="fa-vector-square">{p.m2} m²</Spec21>
        </div>
      </div>
    </div>
  );
}

function DSelect({icon, label, value, w}) {
  return (
    <button style={{display:"flex", alignItems:"center", gap:9, height:44, padding:"0 14px",
      width:w, background:"var(--surface)", border:"1.5px solid var(--border-strong)",
      borderRadius:"var(--r-sm)", cursor:"pointer", font:"var(--text-body-sm)",
      fontFamily:"var(--font-body)", color: value?"var(--fg-strong)":"var(--fg-subtle)"}}>
      {icon && <i className={icon} style={{fontSize:13, color:"var(--fg-subtle)"}}></i>}
      <span style={{flex:1, textAlign:"left", whiteSpace:"nowrap", overflow:"hidden",
        textOverflow:"ellipsis", fontWeight: value?600:400}}>{value||label}</span>
      <i className="fas fa-chevron-down" style={{fontSize:11, color:"var(--fg-subtle)"}}></i>
    </button>
  );
}

function DChip({children}) {
  return (
    <span style={{display:"inline-flex", alignItems:"center", gap:8, padding:"6px 8px 6px 13px",
      borderRadius:"999px", background:"var(--accent-soft)", color:"var(--lav-700)",
      font:"var(--text-body-sm)", fontWeight:600}}>
      {children}
      <button style={{width:18, height:18, borderRadius:"999px", border:"none", cursor:"pointer",
        background:"rgba(109,98,207,.18)", color:"var(--lav-700)", display:"flex",
        alignItems:"center", justifyContent:"center"}}><i className="fas fa-times" style={{fontSize:9}}></i></button>
    </span>
  );
}

function ListingScreen({map, empty, grid}) {
  return (
    <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)", overflow:"hidden"}}>
      <KqHeader compact/>

      {/* Barra de filtros cohesiva */}
      <div style={{padding:"16px 28px 0", flexShrink:0}}>
        <div style={{display:"flex", gap:10, flexWrap:"wrap", alignItems:"center"}}>
          <DSelect icon="fas fa-home" label="Tipo" value="Casa"/>
          <DSelect icon="fas fa-map-marker-alt" label="Departamento" value="Guatemala"/>
          <DSelect label="Municipio" value="Zona 14"/>
          <DSelect icon="fas fa-tag" label="Precio" value="Q 1M – 3M" w={150}/>
          <DSelect icon="fas fa-bed" label="Cuartos" value="3+"/>
          <DSelect icon="fas fa-bath" label="Baños" value=""/>
          <DSelect icon="fas fa-vector-square" label="Tamaño" value=""/>
          <DSelect icon="fas fa-sliders-h" label="Amenidades" value="2"/>
          <div style={{marginLeft:"auto", display:"flex", gap:10}}>
            <DSelect icon="fas fa-sort-amount-down" label="Orden" value="Más recientes" w={170}/>
            {/* toggle lista/mapa */}
            <div style={{display:"flex", background:"var(--surface)", border:"1.5px solid var(--border-strong)",
              borderRadius:"var(--r-sm)", overflow:"hidden", height:44}}>
              <button style={{width:46, border:"none", cursor:"pointer",
                background: map?"transparent":"var(--navy-800)", color: map?"var(--fg-muted)":"var(--cream)"}}>
                <i className="fas fa-th-large" style={{fontSize:14}}></i></button>
              <button style={{width:46, border:"none", cursor:"pointer",
                background: map?"var(--navy-800)":"transparent", color: map?"var(--cream)":"var(--fg-muted)"}}>
                <i className="fas fa-map-marked-alt" style={{fontSize:14}}></i></button>
            </div>
          </div>
        </div>
        {/* Chips activos + limpiar */}
        <div style={{display:"flex", gap:9, flexWrap:"wrap", alignItems:"center", margin:"14px 0"}}>
          <DChip>Casa</DChip>
          <DChip>Guatemala · Zona 14</DChip>
          <DChip>Q 1M – 3M</DChip>
          <DChip>3+ cuartos</DChip>
          <DChip>Piscina</DChip>
          <DChip>Seguridad 24/7</DChip>
          <button style={{background:"none", border:"none", cursor:"pointer", color:"var(--fg-muted)",
            font:"var(--text-body-sm)", fontWeight:600, textDecoration:"underline", padding:"4px 6px"}}>Limpiar todo</button>
        </div>
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between",
          paddingBottom:14, borderBottom:"1px solid var(--border)"}}>
          <div style={{font:"var(--text-body)", color:"var(--fg-muted)"}}>
            <strong style={{color:"var(--fg-strong)", fontFamily:"var(--font-display)"}}>{empty?"0":"148"} inmuebles</strong> en Zona 14, Guatemala</div>
        </div>
      </div>

      {/* Cuerpo */}
      {empty ? (
        <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", textAlign:"center", padding:40, gap:6}}>
          <div style={{width:84, height:84, borderRadius:"999px", background:"var(--accent-soft)",
            color:"var(--lav-700)", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:34, marginBottom:8}}><i className="fas fa-search-minus"></i></div>
          <div style={{font:"var(--text-h3)", fontFamily:"var(--font-display)", fontWeight:700,
            color:"var(--fg-strong)"}}>Sin resultados</div>
          <div style={{font:"var(--text-body)", color:"var(--fg-muted)", maxWidth:380}}>
            No encontramos inmuebles con estos filtros. Probá ampliar el rango de precio o quitar amenidades.</div>
          <button className="kq-btn kq-btn--outline" style={{marginTop:14}}>Limpiar filtros</button>
        </div>
      ) : grid ? (
        <div style={{flex:1, overflowY:"auto", padding:"20px 28px 28px"}}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:22}}>
            {dProps.map(p=><DGridCard key={p.title} p={p}/>)}
          </div>
        </div>
      ) : map ? (
        <div style={{flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, overflow:"hidden"}}>
          <div style={{overflowY:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:16}}>
            {dProps.slice(0,4).map(p=><DListRow key={p.title} p={p}/>)}
          </div>
          <div style={{position:"relative", background:"linear-gradient(135deg,#344a72,#161f33)",
            display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.75)"}}>
            <div style={{textAlign:"center"}}>
              <i className="fas fa-map-marked-alt" style={{fontSize:40}}></i>
              <div style={{font:"var(--text-body-sm)", marginTop:10}}>Mapa interactivo · 148 pines</div>
            </div>
            {[["28%","34%","Q 1.8M"],["52%","56%","Q 2.6M"],["68%","30%","Q 4.2k/mes"],["40%","70%","Q 985k"]].map(([t,l,txt],i)=>(
              <span key={i} style={{position:"absolute", top:t, left:l, transform:"translate(-50%,-50%)",
                padding:"6px 12px", borderRadius:"999px", background:"var(--green-500)",
                color:"var(--navy-900)", font:"var(--text-caption)", fontWeight:700,
                boxShadow:"0 4px 12px rgba(17,24,42,.3)", whiteSpace:"nowrap"}}>{txt}</span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{flex:1, overflowY:"auto", padding:"18px 28px 28px", display:"flex",
          flexDirection:"column", gap:16}}>
          {dProps.map(p=><DListRow key={p.title} p={p}/>)}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {ListingScreen, DListRow, DGridCard, dProps, DSelect, DChip});
