/* Batch A — Auth screens (login, register, forgot, verify)
   Layout: panel de marca (navy, halos lavanda/verde) + panel de formulario (cream).
   Cosmético: los formularios no envían nada. */

function AuthShell({children, headline, sub}) {
  return (
    <div style={{display:"grid", gridTemplateColumns:"minmax(420px, 44%) 1fr", width:"100%",
      height:"100%", background:"var(--bg)", fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      {/* Panel de marca */}
      <div style={{position:"relative", background:"var(--navy-800)", overflow:"hidden",
        display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"44px 48px"}}>
        <div style={{position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(620px 420px at 90% -10%, rgba(181,172,239,.30), transparent 60%), radial-gradient(520px 380px at -10% 110%, rgba(155,198,74,.16), transparent 60%)"}}/>
        <img src="assets/logo-cream-transparent.png" alt="Kiosqui" style={{height:36, alignSelf:"flex-start", position:"relative"}}/>
        <div style={{position:"relative"}}>
          <h2 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:38, lineHeight:1.15,
            letterSpacing:"-.02em", color:"var(--cream)", margin:"0 0 26px", maxWidth:420}}>{headline}</h2>
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            {[["fa-cube","Vé cada inmueble en modelo 3D"],
              ["fa-id-card","Propietarios verificados con DPI"],
              ["fa-comments","Tratá directo, sin intermediarios"]].map(([ic,t])=>(
              <div key={t} style={{display:"flex", alignItems:"center", gap:14}}>
                <span style={{width:38, height:38, borderRadius:"var(--r-md)", flexShrink:0,
                  background:"rgba(181,172,239,.18)", color:"var(--lav-300)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:15}}>
                  <i className={"fas "+ic}></i></span>
                <span style={{font:"var(--text-body-sm)", color:"#d8dfeb", fontWeight:500}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:"relative", font:"var(--text-caption)", color:"rgba(248,244,238,.5)"}}>
          © 2026 Kiosqui · Hecho en Guatemala 🇬🇹</div>
      </div>
      {/* Panel de formulario */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 40px"}}>
        <div style={{width:"100%", maxWidth:400}}>{children}</div>
      </div>
    </div>
  );
}

function FormHead({title, sub}) {
  return (
    <div style={{marginBottom:28}}>
      <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:30,
        letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 8px"}}>{title}</h1>
      {sub && <p style={{font:"var(--text-body)", color:"var(--fg-muted)", margin:0}}>{sub}</p>}
    </div>
  );
}

function Field({label, type, placeholder, value, right}) {
  return (
    <div className="kq-field" style={{marginBottom:16}}>
      <label style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        {label}{right && <a href="#" style={{font:"var(--text-caption)", fontWeight:600,
          color:"var(--accent-hover)", textDecoration:"none"}}>{right}</a>}</label>
      <input className="kq-input" type={type||"text"} placeholder={placeholder} defaultValue={value}/>
    </div>
  );
}

function SubmitBtn({children}) {
  return <button className="kq-btn kq-btn--action" style={{width:"100%", height:50,
    fontSize:16, marginTop:6}}>{children}</button>;
}

function FootLink({q, a}) {
  return <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", textAlign:"center",
    marginTop:24}}>{q} <a href="#" style={{color:"var(--accent-hover)", fontWeight:700,
    textDecoration:"none"}}>{a}</a></p>;
}

/* ---------- LOGIN ---------- */
function LoginScreen() {
  return (
    <AuthShell headline="Bienvenido de vuelta. Tu próxima propiedad te espera.">
      <FormHead title="Iniciar sesión" sub="Ingresá a tu cuenta de Kiosqui."/>
      <Field label="Correo electrónico" type="email" placeholder="tu@correo.com"/>
      <Field label="Contraseña" type="password" placeholder="••••••••" right="¿La olvidaste?"/>
      <label style={{display:"flex", alignItems:"center", gap:9, font:"var(--text-body-sm)",
        color:"var(--fg-muted)", marginBottom:6, cursor:"pointer"}}>
        <input type="checkbox" defaultChecked style={{width:17, height:17, accentColor:"var(--green-600)"}}/>
        Mantener sesión iniciada</label>
      <SubmitBtn>Ingresar</SubmitBtn>
      <FootLink q="¿No tenés cuenta?" a="Registrate gratis"/>
    </AuthShell>
  );
}

/* ---------- REGISTER ---------- */
function RegisterScreen() {
  return (
    <AuthShell headline="Creá tu cuenta y publicá tu primera propiedad gratis.">
      <FormHead title="Crear cuenta" sub="Toma menos de un minuto."/>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <Field label="Nombre" placeholder="Ana"/>
        <Field label="Apellido" placeholder="Rodríguez"/>
      </div>
      <Field label="Correo electrónico" type="email" placeholder="tu@correo.com"/>
      <Field label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"/>
      <label style={{display:"flex", alignItems:"flex-start", gap:9, font:"var(--text-body-sm)",
        color:"var(--fg-muted)", marginBottom:6, cursor:"pointer", lineHeight:1.45}}>
        <input type="checkbox" style={{width:17, height:17, accentColor:"var(--green-600)", marginTop:2, flexShrink:0}}/>
        <span>Acepto los <a href="#" style={{color:"var(--accent-hover)", fontWeight:600}}>términos y condiciones</a> y la <a href="#" style={{color:"var(--accent-hover)", fontWeight:600}}>política de privacidad</a></span></label>
      <SubmitBtn>Crear cuenta</SubmitBtn>
      <FootLink q="¿Ya tenés cuenta?" a="Iniciá sesión"/>
    </AuthShell>
  );
}

/* ---------- FORGOT ---------- */
function ForgotScreen() {
  return (
    <AuthShell headline="Tranquilo, recuperamos tu acceso en un minuto.">
      <a href="#" style={{display:"inline-flex", alignItems:"center", gap:8, font:"var(--text-body-sm)",
        fontWeight:600, color:"var(--fg-muted)", textDecoration:"none", marginBottom:22}}>
        <i className="fas fa-arrow-left" style={{fontSize:13}}></i> Volver a iniciar sesión</a>
      <FormHead title="Recuperar contraseña" sub="Ingresá tu correo y te enviamos un enlace para restablecerla."/>
      <Field label="Correo electrónico" type="email" placeholder="tu@correo.com"/>
      <SubmitBtn>Enviar enlace</SubmitBtn>
      <div style={{display:"flex", gap:11, marginTop:22, padding:"13px 15px",
        background:"var(--accent-soft)", borderRadius:"var(--r-md)", color:"var(--fg-muted)",
        font:"var(--text-body-sm)", lineHeight:1.5}}>
        <i className="fas fa-info-circle" style={{color:"var(--accent-hover)", marginTop:2}}></i>
        <span>Si no lo ves en tu bandeja, revisá la carpeta de spam. El enlace vence en 30 minutos.</span>
      </div>
    </AuthShell>
  );
}

/* ---------- VERIFY ---------- */
function VerifyScreen() {
  const digits = ["4","7","",""];
  return (
    <AuthShell headline="Un paso más. Confirmá que sos vos.">
      <FormHead title="Verificá tu correo" sub={<span>Enviamos un código de 4 dígitos a <strong style={{color:"var(--fg-strong)"}}>ana@correo.com</strong></span>}/>
      <div style={{display:"flex", gap:12, marginBottom:24}}>
        {digits.map((d,i)=>(
          <input key={i} defaultValue={d} maxLength={1} style={{width:64, height:72, textAlign:"center",
            fontFamily:"var(--font-display)", fontWeight:700, fontSize:28, color:"var(--fg-strong)",
            background:"var(--surface)", borderRadius:"var(--r-md)",
            border: i===2 ? "2px solid var(--accent)" : "1.5px solid var(--border-strong)",
            boxShadow: i===2 ? "var(--shadow-focus)" : "none", outline:"none"}}/>
        ))}
      </div>
      <SubmitBtn>Verificar</SubmitBtn>
      <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", textAlign:"center", marginTop:22}}>
        ¿No llegó? <a href="#" style={{color:"var(--accent-hover)", fontWeight:700, textDecoration:"none"}}>Reenviar código</a>
        <span style={{color:"var(--fg-subtle)"}}> · disponible en 0:42</span></p>
    </AuthShell>
  );
}

Object.assign(window, {AuthShell, LoginScreen, RegisterScreen, ForgotScreen, VerifyScreen});
