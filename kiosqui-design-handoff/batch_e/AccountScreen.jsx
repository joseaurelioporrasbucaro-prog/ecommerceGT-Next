/* Batch E — Configuración de cuenta (/creator-profile-info)
   Columna izq: portada + avatar + nombre + menú vertical.
   Columna der: tab activa (Información personal / Verificar cuenta / Métodos de pago).
   Reusa KqHeader. */

function AField({label, value, type, full, children, hint, ok}) {
  return (
    <div style={{gridColumn: full?"1 / -1":"auto", display:"flex", flexDirection:"column", gap:7}}>
      <label style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{label}</label>
      {children || (
        <input className="kq-input" defaultValue={value} type={type||"text"}
          style={{height:50}}/>
      )}
      {hint && <span style={{font:"var(--text-caption)", color: ok?"var(--green-700)":"var(--fg-subtle)"}}>{hint}</span>}
    </div>
  );
}

function ASelect({label, value, opts, full}) {
  return (
    <div style={{gridColumn: full?"1 / -1":"auto", display:"flex", flexDirection:"column", gap:7}}>
      <label style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>{label}</label>
      <div style={{position:"relative"}}>
        <select className="kq-input" defaultValue={value}
          style={{height:50, width:"100%", appearance:"none", cursor:"pointer", paddingRight:38}}>
          {(opts||[value]).map(o=><option key={o}>{o}</option>)}
        </select>
        <i className="fas fa-chevron-down" style={{position:"absolute", right:16, top:"50%",
          transform:"translateY(-50%)", fontSize:12, color:"var(--fg-subtle)", pointerEvents:"none"}}></i>
      </div>
    </div>
  );
}

function AccountNav({active}) {
  const items = [
    ["personal","fa-user","Información personal"],
    ["cuenta","fa-cog","Configuración de cuenta"],
    ["notif","fa-bell","Notificaciones"],
    ["pago","fa-credit-card","Métodos de pago"],
    ["verificar","fa-shield-alt","Verificar cuenta"],
  ];
  return (
    <div style={{display:"flex", flexDirection:"column", gap:3, padding:"8px 0 0"}}>
      {items.map(([k,ic,label])=>(
        <div key={k} style={{display:"flex", alignItems:"center", gap:13, padding:"12px 16px",
          borderRadius:"var(--r-sm)", cursor:"pointer",
          background: active===k?"var(--navy-800)":"transparent",
          color: active===k?"var(--cream)":"var(--fg-muted)",
          font:"var(--text-body-sm)", fontWeight:600}}>
          <i className={"fas "+ic} style={{width:20, textAlign:"center", fontSize:15,
            color: active===k?"var(--green-400)":"var(--fg-subtle)"}}></i> {label}
        </div>
      ))}
    </div>
  );
}

function AccountScreen({tab="personal"}) {
  return (
    <div style={{width:"100%", height:"100%", overflowY:"auto", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--fg)"}}>
      <KqHeader/>
      <div style={{maxWidth:1120, margin:"0 auto", padding:"28px 28px 64px"}}>
        <h1 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:30,
          letterSpacing:"-.02em", color:"var(--fg-strong)", margin:"0 0 6px"}}>Mi cuenta</h1>
        <p style={{font:"var(--text-body)", color:"var(--fg-muted)", margin:"0 0 28px"}}>
          Administrá tu información, seguridad y métodos de pago.</p>

        <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap:28, alignItems:"start"}}>
          {/* Columna izquierda */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-sm)", overflow:"hidden"}}>
            {/* Franja decorativa uniforme (igual en todos los perfiles) */}
            <div style={{height:96, background:"linear-gradient(120deg,var(--navy-800),var(--lav-600))"}}></div>
            <div style={{padding:"0 20px 16px", textAlign:"center"}}>
              {/* Avatar con badge de cámara — no se recorta */}
              <div style={{position:"relative", width:104, height:104, margin:"-52px auto 12px"}}>
                <div style={{width:104, height:104, borderRadius:"999px",
                  background:"linear-gradient(135deg,var(--lav-500),var(--lav-700))", color:"#fff",
                  border:"4px solid var(--surface)", display:"flex", alignItems:"center",
                  justifyContent:"center", fontFamily:"var(--font-display)", fontWeight:700, fontSize:34}}>AR</div>
                <div style={{position:"absolute", right:2, bottom:2, width:32, height:32, borderRadius:"999px",
                  background:"var(--green-500)", color:"var(--navy-900)", border:"3px solid var(--surface)",
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:12}}
                  title="Cambiar foto de perfil"><i className="fas fa-camera"></i></div>
              </div>
              <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:7}}>
                <span style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:18,
                  color:"var(--fg-strong)"}}>Ana Rodríguez</span>
                <i className="fas fa-check-circle" style={{color:"var(--green-600)", fontSize:14}}></i>
              </div>
              <div style={{font:"var(--text-body-sm)", color:"var(--fg-muted)"}}>ana@kiosqui.com</div>
            </div>
            <div style={{padding:"4px 12px 16px", borderTop:"1px solid var(--border)"}}>
              <AccountNav active={tab}/>
            </div>
          </div>

          {/* Columna derecha — contenido de la tab */}
          <div style={{display:"flex", flexDirection:"column", gap:24}}>
            {tab==="personal" && <PersonalInfoCard/>}
            {tab==="verificar" && <VerifyCard/>}
            {tab==="pago" && <PaymentCard/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({title, children, sub}) {
  return (
    <div style={{background:"var(--surface)", border:"1px solid var(--border)",
      borderRadius:"var(--r-lg)", boxShadow:"var(--shadow-sm)", padding:28}}>
      <h3 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:20,
        color:"var(--fg-strong)", margin:"0 0 4px"}}>{title}</h3>
      {sub && <p style={{font:"var(--text-body-sm)", color:"var(--fg-muted)", margin:"0 0 20px"}}>{sub}</p>}
      {!sub && <div style={{height:18}}></div>}
      {children}
    </div>
  );
}

function PersonalInfoCard() {
  return (
    <React.Fragment>
      <Card title="Nombre de usuario" sub="Podés cambiarlo hasta 2 veces.">
        <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:14, alignItems:"end"}}>
          <AField label="Usuario" value="ana_rodriguez" hint="Cambios disponibles: 2 / 2"/>
          <button className="kq-btn kq-btn--outline" style={{height:50}}>Guardar usuario</button>
        </div>
      </Card>

      <Card title="Información personal">
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18}}>
          <AField label="Nombre(s)" value="Ana"/>
          <AField label="Apellido(s)" value="Rodríguez"/>
          <ASelect label="Género" value="Femenino" opts={["Femenino","Masculino","Prefiero no decir"]}/>
          <AField label="Fecha de nacimiento" value="1992-04-18" type="date"/>
          <AField label="Teléfono" value="5512 3456"/>
          <ASelect label="Idioma preferido" value="Español" opts={["Español","English"]}/>
          <AField label="Dirección" full>
            <textarea className="kq-input" rows={2} defaultValue="4a Avenida 12-34, Zona 14"
              style={{resize:"vertical", fontFamily:"var(--font-body)"}}></textarea>
          </AField>
          <ASelect label="Departamento" value="Guatemala" opts={["Guatemala","Sacatepéquez","Quetzaltenango"]}/>
          <ASelect label="Municipio" value="Ciudad de Guatemala" opts={["Ciudad de Guatemala","Mixco","Villa Nueva"]}/>
        </div>
        <label style={{display:"flex", alignItems:"center", gap:11, marginTop:18, cursor:"pointer"}}>
          <input type="checkbox" defaultChecked style={{width:18, height:18, accentColor:"var(--lav-600)"}}/>
          <span style={{font:"var(--text-body-sm)", color:"var(--fg)"}}>Mostrar mi ubicación (departamento y municipio) en mi perfil público</span>
        </label>
        <div style={{marginTop:22}}>
          <button className="kq-btn kq-btn--action">Guardar información personal</button>
        </div>
      </Card>

      {/* Zona de peligro */}
      <div style={{border:"1.5px solid var(--danger)", borderRadius:"var(--r-lg)",
        background:"var(--danger-bg)", padding:24}}>
        <div style={{display:"flex", alignItems:"center", gap:9, marginBottom:6}}>
          <i className="fas fa-exclamation-triangle" style={{color:"var(--danger)"}}></i>
          <h3 style={{fontFamily:"var(--font-display)", fontWeight:700, fontSize:18,
            color:"var(--danger)", margin:0}}>Zona de peligro</h3>
        </div>
        <p style={{font:"var(--text-body-sm)", color:"var(--ink-700)", margin:"0 0 16px", maxWidth:520}}>
          Eliminar tu cuenta es permanente. Se borrarán tus publicaciones, mensajes y saldo de pauta.</p>
        <button style={{display:"inline-flex", alignItems:"center", gap:8, padding:"11px 20px",
          borderRadius:"var(--r-pill)", border:"1.5px solid var(--danger)", background:"transparent",
          color:"var(--danger)", font:"var(--text-label)", fontFamily:"var(--font-display)",
          cursor:"pointer"}}><i className="fas fa-trash-alt" style={{fontSize:13}}></i> Eliminar mi cuenta</button>
      </div>
    </React.Fragment>
  );
}

function DocSlot({name, ok}) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:11, flexWrap:"wrap", padding:"14px 16px",
      border:"1.5px solid var(--border-strong)", borderRadius:"var(--r-md)"}}>
      <span style={{font:"var(--text-label)", color:"var(--fg-strong)", minWidth:56}}>{name}</span>
      {ok
        ? <span style={{display:"flex", alignItems:"center", gap:6, color:"var(--green-700)", font:"var(--text-body-sm)", fontWeight:600}}><i className="fas fa-check"></i> Listo</span>
        : <span style={{color:"var(--fg-subtle)", font:"var(--text-body-sm)"}}>Sin adjuntar</span>}
      <button className="kq-btn kq-btn--outline kq-btn--sm" style={{marginLeft:"auto"}}>{ok?"Cambiar":"Adjuntar"}</button>
    </div>
  );
}

function VerifyCard() {
  return (
    <Card title="Verificar cuenta" sub="Verificá tu identidad para obtener el check. Soporte revisa cada solicitud manualmente.">
      <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:18}}>
        <h4 style={{fontFamily:"var(--font-display)", fontWeight:600, fontSize:17, color:"var(--fg-strong)", margin:0}}>Verificación personal (DPI)</h4>
        <span style={{font:"var(--text-caption)", fontWeight:700, padding:"3px 12px", borderRadius:"999px",
          background:"var(--warning-bg)", color:"#9a5a12"}}>En revisión</span>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:9, padding:"12px 16px", borderRadius:"var(--r-md)",
        background:"var(--warning-bg)", color:"#9a5a12", font:"var(--text-body-sm)", marginBottom:20}}>
        <i className="fas fa-clock"></i> En revisión. Soporte validará tu documento pronto.</div>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        <AField label="Número de DPI" value="3012 45678 0101"/>
        <div>
          <label style={{font:"var(--text-label)", color:"var(--fg-strong)", display:"block", marginBottom:10}}>Fotos del DPI (frente y reverso)</label>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
            <DocSlot name="Frente" ok/>
            <DocSlot name="Reverso"/>
          </div>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"flex-start", font:"var(--text-body-sm)", color:"#9a5a12"}}>
          <i className="fas fa-exclamation-triangle" style={{marginTop:2}}></i>
          Los datos del DPI deben verse completos y legibles. Si no se leen, la solicitud será rechazada.</div>
        <p style={{font:"var(--text-caption)", color:"var(--fg-subtle)", margin:0}}>
          Tu documento es privado: solo lo usa soporte para validar tu identidad. No se muestra en tu perfil.</p>
        <div><button className="kq-btn kq-btn--action">Enviar a revisión</button></div>
      </div>
    </Card>
  );
}

function PaymentCard() {
  return (
    <Card title="Métodos de pago" sub="Tarjetas para recargar tu saldo de pauta.">
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        <div style={{display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
          border:"1.5px solid var(--lav-500)", borderRadius:"var(--r-md)", background:"var(--lav-100)"}}>
          <div style={{width:46, height:32, borderRadius:6, background:"var(--navy-800)", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:16}}><i className="fab fa-cc-visa"></i></div>
          <div style={{flex:1}}>
            <div style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>Visa •••• 4242</div>
            <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>Vence 08/27</div>
          </div>
          <span className="kq-badge kq-badge--lav">Principal</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
          border:"1px solid var(--border)", borderRadius:"var(--r-md)"}}>
          <div style={{width:46, height:32, borderRadius:6, background:"var(--ink-700)", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:16}}><i className="fab fa-cc-mastercard"></i></div>
          <div style={{flex:1}}>
            <div style={{font:"var(--text-label)", color:"var(--fg-strong)"}}>Mastercard •••• 8810</div>
            <div style={{font:"var(--text-caption)", color:"var(--fg-muted)"}}>Vence 02/26</div>
          </div>
          <button className="kq-btn kq-btn--ghost kq-btn--sm" style={{color:"var(--danger)"}}>Quitar</button>
        </div>
        <button className="kq-btn kq-btn--outline" style={{alignSelf:"flex-start", marginTop:6, display:"flex", gap:8}}>
          <i className="fas fa-plus"></i> Agregar tarjeta</button>
      </div>
    </Card>
  );
}

Object.assign(window, {AccountScreen, AccountNav, PersonalInfoCard, VerifyCard, PaymentCard, AField, ASelect, Card, DocSlot});
