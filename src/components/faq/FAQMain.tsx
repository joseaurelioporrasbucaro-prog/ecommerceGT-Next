"use client";
import React, { useState } from "react";
import Link from "next/link";
import ThemeChanger from "../home/ThemeChanger";
import Breadcrumbs from "@/utils/Breadcrumbs";

/**
 * Fase 18 — FAQ con contenido real para marketplace de bienes raíces.
 *
 * Reemplaza el FAQContent dummy del template (que tenía preguntas NFT
 * en inglés) por categorías y preguntas reales del flujo KIOSQUI. La
 * estructura es 6 categorías con subpreguntas en acordeón.
 *
 * Diseño intencionalmente sobrio — el contenido es el contenido. Cada
 * pregunta se expande inline, una a la vez por categoría (estado local
 * `openId`).
 */

interface FAQItem {
  q: string;
  a: React.ReactNode;
}

interface FAQGroup {
  id: string;
  title: string;
  icon: string;
  items: FAQItem[];
}

const GROUPS: FAQGroup[] = [
  {
    id: 'cuenta',
    title: 'Cuenta y registro',
    icon: 'fa-user-circle',
    items: [
      {
        q: '¿Necesito una cuenta para buscar propiedades?',
        a: (
          <p>
            No. Podés explorar el catálogo sin registrarte. Necesitás cuenta
            solo si querés contactar a un vendedor, guardar favoritos o
            publicar tu propia propiedad.
          </p>
        ),
      },
      {
        q: '¿Cómo me registro?',
        a: (
          <p>
            Andá a <Link href="/register">/register</Link>, completá nombre,
            correo y contraseña. Aceptás los Términos y la Política de
            Privacidad, recibís un correo de verificación y listo — podés
            entrar a la plataforma. Es gratis.
          </p>
        ),
      },
      {
        q: '¿Olvidé mi contraseña, cómo la recupero?',
        a: (
          <p>
            En <Link href="/login">/login</Link> hacé clic en{' '}
            <em>¿Olvidaste tu contraseña?</em>. Te enviaremos un correo con
            un enlace para crear una nueva. El enlace vence en 24 horas por
            seguridad.
          </p>
        ),
      },
      {
        q: '¿Cómo cambio mi correo o teléfono?',
        a: (
          <p>
            Iniciá sesión, andá a{' '}
            <Link href="/creator-profile-info-personal">tu perfil</Link>,
            sección "Información personal". Cualquier cambio se guarda al
            instante.
          </p>
        ),
      },
    ],
  },
  {
    id: 'verificacion',
    title: 'Verificación de identidad',
    icon: 'fa-shield-alt',
    items: [
      {
        q: '¿Por qué tengo que verificarme?',
        a: (
          <p>
            La verificación protege a compradores y vendedores. Una cuenta
            verificada inspira más confianza, aparece destacada con un check
            azul y desbloquea funciones como subir archivos 3D (GLB) y crear
            campañas de pauta.
          </p>
        ),
      },
      {
        q: '¿Qué documentos necesito?',
        a: (
          <>
            <p>Dependiendo del tipo de cuenta:</p>
            <ul>
              <li><strong>Persona natural:</strong> DPI vigente o pasaporte + selfie sosteniendo el documento.</li>
              <li><strong>Empresa:</strong> NIT + RTU vigente del SAT + DPI del representante legal.</li>
            </ul>
          </>
        ),
      },
      {
        q: '¿Cuánto tarda la verificación?',
        a: (
          <p>
            Nuestro equipo de soporte revisa cada solicitud manualmente.
            Apuntamos a resolver en menos de 48 horas hábiles. Recibís
            notificación por correo y dentro de la plataforma al aprobarse o
            rechazarse.
          </p>
        ),
      },
      {
        q: '¿Mis datos sensibles están seguros?',
        a: (
          <p>
            Sí. Tu DPI y NIT se almacenan cifrados con AES-256-GCM en
            nuestra base de datos. Solo el equipo de soporte autorizado los
            visualiza durante la revisión, y nunca se exponen en perfiles
            públicos ni en endpoints abiertos. Detalles en la{' '}
            <Link href="/privacidad">Política de Privacidad</Link>.
          </p>
        ),
      },
    ],
  },
  {
    id: 'publicar',
    title: 'Publicar propiedades',
    icon: 'fa-home',
    items: [
      {
        q: '¿Cómo publico una propiedad?',
        a: (
          <p>
            Iniciá sesión y andá a <Link href="/upload">/upload</Link>.
            Completá el formulario (tipo, ubicación, precio, fotos), y al
            enviar quedará publicada de inmediato. No hay revisión previa,
            pero las publicaciones que infrinjan la{' '}
            <Link href="/contenido">Política de Contenido</Link> pueden ser
            ocultadas.
          </p>
        ),
      },
      {
        q: '¿Cuántas propiedades puedo tener publicadas?',
        a: (
          <p>
            Depende de tu plan. El plan gratuito permite una cantidad
            limitada; los planes pagos amplían el cupo. Consultá los detalles
            en <Link href="/pricing-plan">/pricing-plan</Link>.
          </p>
        ),
      },
      {
        q: '¿Qué fotos puedo subir?',
        a: (
          <p>
            JPG, JPEG, PNG, WEBP o GIF, hasta 8 MB cada una, máximo 10 fotos
            por publicación. Tienen que ser fotos reales del inmueble — no
            de stock ni copiadas de otros sitios. Más detalles en{' '}
            <Link href="/contenido#fotos">Política de Contenido</Link>.
          </p>
        ),
      },
      {
        q: '¿Puedo subir un recorrido 3D?',
        a: (
          <p>
            Sí, en formato <code>.glb</code>. La función está disponible
            para cuentas con plan pago. Si tu modelo está en otro formato
            (FBX, OBJ, DAE), podés convertirlo con AnyConv, Aspose 3D o
            Blender — el dropzone tiene la guía completa.
          </p>
        ),
      },
      {
        q: '¿Cómo edito o anulo una publicación?',
        a: (
          <p>
            Desde <Link href="/my-publications">/my-publications</Link>.
            Cada publicación tiene botones para editar, marcar como vendida
            o anular. Las anuladas dejan de aparecer en el catálogo pero
            siguen en tu historial.
          </p>
        ),
      },
    ],
  },
  {
    id: 'pauta',
    title: 'Planes y pauta',
    icon: 'fa-bolt',
    items: [
      {
        q: '¿Tengo que pagar para usar KIOSQUI?',
        a: (
          <p>
            No. El plan gratuito te permite publicar y contactar vendedores.
            Los planes pagos quitan límites de publicaciones, agregan acceso
            a archivos 3D y permiten gestionar equipos.
          </p>
        ),
      },
      {
        q: '¿Qué es la "pauta"?',
        a: (
          <p>
            Es publicidad paga para destacar tu publicación. Tu propiedad
            aparece en secciones de inicio y al principio de los listados
            durante el plazo que elijas. Más info en{' '}
            <Link href="/pauta">/pauta</Link>.
          </p>
        ),
      },
      {
        q: 'Si la pauta se interrumpe, ¿me devuelven el dinero?',
        a: (
          <p>
            No reembolsamos dinero a tarjeta. Si tu campaña se interrumpe
            (por ejemplo, por sanción a la publicación), el saldo no
            consumido vuelve como{' '}
            <strong>crédito interno reutilizable</strong> en futuras
            campañas. El crédito no caduca y no es transferible entre
            cuentas. Detalles en los{' '}
            <Link href="/terminos#pauta">Términos</Link>.
          </p>
        ),
      },
      {
        q: '¿Cómo cancelo mi plan?',
        a: (
          <p>
            Desde <Link href="/pricing-plan">/pricing-plan</Link>, sección
            "Mi plan". Al cancelar conservás los beneficios hasta el final
            del ciclo facturado; no se renueva al vencer.
          </p>
        ),
      },
    ],
  },
  {
    id: 'cuenta-cierre',
    title: 'Eliminar o desactivar cuenta',
    icon: 'fa-user-times',
    items: [
      {
        q: '¿Cuál es la diferencia entre desactivar y eliminar?',
        a: (
          <p>
            <strong>Desactivar</strong> pausa tu cuenta — tus datos y
            publicaciones quedan intactos. Cuando iniciás sesión otra vez,
            todo se reactiva.{' '}
            <strong>Eliminar</strong> inicia un plazo de 30 días al final
            del cual tus datos personales se borran de forma definitiva.
            Ambas opciones viven en{' '}
            <Link href="/creator-profile-info-personal">tu perfil</Link>,
            sección "Zona sensible".
          </p>
        ),
      },
      {
        q: 'Si elimino mi cuenta, ¿puedo recuperarla?',
        a: (
          <p>
            Sí, dentro de los <strong>30 días</strong> posteriores a la
            solicitud. Solo iniciá sesión con tu correo y contraseña — la
            eliminación se cancela y tus publicaciones se restauran.
            Pasados los 30 días, la anonimización es irreversible y deberás
            crear una cuenta nueva.
          </p>
        ),
      },
      {
        q: '¿Qué pasa con mis publicaciones si elimino la cuenta?',
        a: (
          <p>
            Se pausan inmediatamente al solicitar la eliminación. Si recuperás
            la cuenta dentro de los 30 días, vuelven al estado activo.
            Pasado el plazo, se anulan definitivamente.
          </p>
        ),
      },
      {
        q: 'Si tengo saldo de pauta, ¿se pierde al eliminar?',
        a: (
          <p>
            Sí. Por política de los Términos, el crédito de pauta no es
            canjeable a dinero ni transferible y se pierde al cerrar la
            cuenta (sea por desactivación o eliminación al pasar los 30
            días). Cuando recuperás la cuenta dentro del plazo, el crédito
            se conserva.
          </p>
        ),
      },
    ],
  },
  {
    id: 'soporte',
    title: 'Soporte y denuncias',
    icon: 'fa-life-ring',
    items: [
      {
        q: '¿Cómo contacto soporte?',
        a: (
          <p>
            La forma más rápida es crear un ticket en{' '}
            <Link href="/soporte/tickets">/soporte/tickets</Link>. También
            podés escribir a{' '}
            <a href="mailto:soporte@kiosqui.gt">soporte@kiosqui.gt</a>{' '}
            (respuesta en horario laboral).
          </p>
        ),
      },
      {
        q: '¿Cómo denuncio una publicación o usuario?',
        a: (
          <p>
            Cada publicación y comentario tiene un botón "Reportar". La
            denuncia llega al panel de soporte y se revisa por gravedad. Tu
            identidad no se revela al denunciado.
          </p>
        ),
      },
      {
        q: 'Mi cuenta fue sancionada y creo que es un error.',
        a: (
          <p>
            En la pantalla de login bloqueado verás un botón{' '}
            <em>Apelar esta decisión</em>. Al enviarlo, se crea un ticket
            prioritario que será revisado por un agente distinto al que
            aplicó la sanción.
          </p>
        ),
      },
      {
        q: '¿KIOSQUI me asegura que la transacción es legítima?',
        a: (
          <p>
            KIOSQUI conecta partes pero <strong>no es parte</strong> de las
            transacciones de bienes inmuebles. Verificá titularidad,
            condiciones legales y áreas reales antes de cerrar. Siempre
            recomendamos asesoría legal profesional para el contrato final.
          </p>
        ),
      },
    ],
  },
];

const FAQMain: React.FC = () => {
  // Acordeón con ID compuesto "<groupId>:<index>" para soportar una pregunta
  // abierta a la vez en toda la página (no por grupo). Más simple.
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <>
      <ThemeChanger />
      <Breadcrumbs breadcrumbTitle="Preguntas frecuentes" breadcrumbSubTitle="FAQ" />

      <section className="faq-area-kiosqui pt-80 pb-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <p className="faq-intro">
                Respuestas a las dudas más comunes sobre cuenta, publicaciones,
                planes y soporte. Si no encontrás lo que buscás, escribinos a{' '}
                <a href="mailto:soporte@kiosqui.gt">soporte@kiosqui.gt</a> o
                creá un <Link href="/soporte/tickets">ticket de soporte</Link>.
              </p>

              {GROUPS.map((g) => (
                <div key={g.id} className="faq-group">
                  <h3 className="faq-group-title">
                    <i className={`fas ${g.icon}`} aria-hidden="true" /> {g.title}
                  </h3>
                  <div className="faq-items">
                    {g.items.map((item, idx) => {
                      const id = `${g.id}:${idx}`;
                      const isOpen = openId === id;
                      return (
                        <div key={id} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                          <button
                            type="button"
                            className="faq-q"
                            onClick={() => toggle(id)}
                            aria-expanded={isOpen}
                            aria-controls={`a-${id}`}
                          >
                            <span>{item.q}</span>
                            <i className={`fas ${isOpen ? 'fa-minus' : 'fa-plus'}`} aria-hidden="true" />
                          </button>
                          {isOpen && (
                            <div id={`a-${id}`} className="faq-a">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="faq-footer">
                ¿No encontraste tu respuesta?{' '}
                <Link href="/soporte/tickets">Crear ticket de soporte</Link>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .faq-area-kiosqui {
            background-color: var(--clr-bg-bodylight);
          }
          .faq-intro {
            text-align: center;
            font-size: 15.5px;
            line-height: 1.6;
            max-width: 660px;
            margin: 0 auto 50px;
            color: var(--clr-common-body-text);
          }
          .faq-intro :global(a) {
            color: var(--clr-theme-1, #2785ff);
            font-weight: 600;
          }
          .faq-group {
            margin-bottom: 40px;
          }
          .faq-group-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 20px;
            font-weight: 700;
            color: var(--clr-common-heading);
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--clr-common-border);
          }
          .faq-group-title :global(i) {
            color: var(--clr-theme-1, #2785ff);
            font-size: 18px;
          }
          .faq-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .faq-item {
            background: var(--clr-bg-white, #fff);
            border: 1px solid var(--clr-common-border);
            border-radius: 10px;
            overflow: hidden;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .faq-item.is-open {
            border-color: var(--clr-theme-1, #2785ff);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
          }
          .faq-q {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 16px 20px;
            background: transparent;
            border: none;
            font-size: 15px;
            font-weight: 600;
            text-align: left;
            color: var(--clr-common-heading);
            cursor: pointer;
          }
          .faq-q :global(i) {
            font-size: 12px;
            color: var(--clr-theme-1, #2785ff);
            flex-shrink: 0;
          }
          .faq-a {
            padding: 0 20px 18px;
            font-size: 14.5px;
            line-height: 1.65;
            color: var(--clr-common-body-text);
          }
          .faq-a :global(p) {
            margin: 0 0 10px;
          }
          .faq-a :global(p:last-child) {
            margin-bottom: 0;
          }
          .faq-a :global(ul) {
            padding-left: 22px;
            margin: 8px 0 10px;
          }
          .faq-a :global(li) {
            margin-bottom: 6px;
          }
          .faq-a :global(a) {
            color: var(--clr-theme-1, #2785ff);
            font-weight: 600;
          }
          .faq-a :global(code) {
            background: rgba(128, 128, 128, 0.14);
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 13px;
          }
          .faq-footer {
            text-align: center;
            margin-top: 30px;
            padding: 22px;
            background: var(--clr-bg-white, #fff);
            border-radius: 10px;
            font-size: 14.5px;
            color: var(--clr-common-body-text);
          }
          .faq-footer :global(a) {
            color: var(--clr-theme-1, #2785ff);
            font-weight: 700;
          }
        `}</style>
      </section>
    </>
  );
};

export default FAQMain;
