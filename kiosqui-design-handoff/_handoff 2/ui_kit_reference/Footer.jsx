/* Footer */
function Footer() {
  const col = (title, links) => (
    <div>
      <div style={{font:"var(--text-label)", color:"var(--cream)", marginBottom:14}}>{title}</div>
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {links.map(l=>(
          <a key={l} href="#" style={{font:"var(--text-body-sm)", color:"var(--fg-on-dark-muted)",
            textDecoration:"none"}}>{l}</a>
        ))}
      </div>
    </div>
  );
  return (
    <footer style={{background:"var(--ink-900)", color:"var(--cream)", marginTop:80}}>
      <div style={{maxWidth:1200, margin:"0 auto", padding:"56px 28px 40px",
        display:"grid", gridTemplateColumns:"1.6fr 1fr 1fr 1fr", gap:40}}>
        <div>
          <img src="../../assets/logo-navy-bg.png" alt="Kiosqui" style={{height:34, marginBottom:16}}/>
          <p style={{font:"var(--text-body-sm)", color:"var(--fg-on-dark-muted)", maxWidth:280, margin:0}}>
            La plataforma digital para comprar y vender inmuebles en Guatemala. Profesional, simple y confiable.</p>
        </div>
        {col("Explorar", ["Casas en venta","Apartamentos","Terrenos","Oficinas","En renta"])}
        {col("Kiosqui", ["Sobre nosotros","Agentes verificados","Cómo funciona","Blog"])}
        {col("Soporte", ["Centro de ayuda","Contacto","Términos","Privacidad"])}
      </div>
      <div style={{borderTop:"1px solid var(--border-on-dark)"}}>
        <div style={{maxWidth:1200, margin:"0 auto", padding:"18px 28px", display:"flex",
          justifyContent:"space-between", flexWrap:"wrap", gap:10,
          font:"var(--text-caption)", color:"var(--fg-on-dark-muted)"}}>
          <span>© 2026 Kiosqui. Todos los derechos reservados.</span>
          <span>Hecho en Guatemala 🇬🇹</span>
        </div>
      </div>
    </footer>
  );
}
Object.assign(window, {Footer});
