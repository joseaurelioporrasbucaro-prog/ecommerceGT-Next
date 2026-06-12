"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageHead from "@/components/common/PageHead";

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
            <a href="mailto:soporte@kiosqui.com">soporte@kiosqui.com</a>{' '}
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
  // Handoff #6 §2 — chips de categoría + búsqueda por texto de pregunta.
  // El portal /soporte linkea con ?cat=<id> para aterrizar filtrado.
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat');
  const [activeCat, setActiveCat] = useState<string>(
    initialCat && GROUPS.some((g) => g.id === initialCat) ? initialCat : 'todas',
  );
  const [query, setQuery] = useState('');

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  const normalized = query.trim().toLowerCase();
  const visibleGroups = GROUPS
    .filter((g) => activeCat === 'todas' || g.id === activeCat)
    .map((g) => ({
      ...g,
      items: normalized
        ? g.items.filter((it) => it.q.toLowerCase().includes(normalized))
        : g.items,
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <section className="faq-area-kiosqui pb-100">
        <PageHead
          overline="Centro de ayuda"
          title="Preguntas frecuentes"
          sub="Respuestas a las dudas más comunes sobre cuenta, publicaciones, planes y soporte."
        />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9 faq-col">
              {/* Buscador pill */}
              <div className="faq-search">
                <i className="fas fa-search" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Buscá tu pregunta…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Buscar pregunta"
                />
              </div>

              {/* Chips de categoría */}
              <div className="faq-chips">
                <button
                  type="button"
                  className={`faq-chip ${activeCat === 'todas' ? 'is-active' : ''}`}
                  onClick={() => setActiveCat('todas')}
                >
                  Todas
                </button>
                {GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`faq-chip ${activeCat === g.id ? 'is-active' : ''}`}
                    onClick={() => setActiveCat(g.id)}
                  >
                    {g.title}
                  </button>
                ))}
              </div>

              {visibleGroups.length === 0 && (
                <p className="faq-no-results">
                  No encontramos preguntas con ese texto. Probá con otra palabra
                  o <Link href="/soporte/tickets">creá un ticket</Link>.
                </p>
              )}

              {visibleGroups.map((g) => (
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
          .faq-col {
            max-width: 760px;
          }
          /* Buscador pill con sombra (handoff #6 §2). */
          .faq-search {
            display: flex;
            align-items: center;
            gap: 12px;
            height: 52px;
            padding: 0 22px;
            background: var(--surface, #fff);
            border: 1.5px solid var(--border-strong, #d4c8b6);
            border-radius: 999px;
            box-shadow: var(--shadow-sm, 0 2px 6px rgba(30, 45, 74, 0.08));
            margin-bottom: 18px;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .faq-search:focus-within {
            border-color: var(--accent, #b5acef);
            box-shadow: var(--shadow-focus, 0 0 0 3px rgba(181, 172, 239, 0.55));
          }
          .faq-search :global(i) {
            color: var(--fg-subtle, #9aa0a8);
            font-size: 14px;
          }
          .faq-search input {
            flex: 1;
            border: none;
            background: transparent;
            outline: none;
            font-size: 15px;
            color: var(--fg-strong, #22252a);
            min-width: 0;
          }
          /* Chips de categoría. */
          .faq-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 34px;
          }
          .faq-chip {
            padding: 8px 16px;
            border-radius: 999px;
            border: 1.5px solid var(--border-strong, #d4c8b6);
            background: var(--surface, #fff);
            color: var(--fg-muted, #5c616a);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
          }
          .faq-chip:hover {
            border-color: var(--lav-500, #b5acef);
            color: var(--lav-700, #6d62cf);
          }
          .faq-chip.is-active {
            background: var(--navy-800, #1e2d4a);
            border-color: var(--navy-800, #1e2d4a);
            color: var(--cream, #f8f4ee);
          }
          :global([data-theme='dark']) .faq-chip.is-active {
            background: var(--lav-500, #b5acef);
            border-color: var(--lav-500, #b5acef);
            color: var(--navy-900, #161f33);
          }
          .faq-no-results {
            text-align: center;
            color: var(--fg-muted, #5c616a);
            font-size: 14.5px;
            padding: 30px 0;
          }
          .faq-no-results :global(a) {
            color: var(--accent-hover, #8a7fe3);
            font-weight: 700;
          }
          .faq-group {
            margin-bottom: 40px;
          }
          .faq-group-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: var(--font-display);
            font-size: 19px;
            font-weight: 700;
            color: var(--fg-strong, #22252a);
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border, #e6ddcf);
          }
          .faq-group-title :global(i) {
            color: var(--lav-700, #6d62cf);
            font-size: 17px;
          }
          .faq-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .faq-item {
            background: var(--surface, #fff);
            border: 1px solid var(--border, #e6ddcf);
            border-radius: 14px;
            overflow: hidden;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .faq-item.is-open {
            border-color: var(--lav-300, #ddd8f8);
            box-shadow: var(--shadow-sm, 0 2px 6px rgba(30, 45, 74, 0.08));
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
            font-weight: 700;
            text-align: left;
            color: var(--fg-strong, #22252a);
            cursor: pointer;
          }
          /* Botón circular +/− (cerrado: surface-sunk; abierto: lavanda). */
          .faq-q :global(i) {
            width: 28px;
            height: 28px;
            border-radius: 999px;
            background: var(--surface-sunk, #f1ebe1);
            color: var(--fg-muted, #5c616a);
            font-size: 11px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: background 0.15s, color 0.15s;
          }
          .faq-item.is-open .faq-q :global(i) {
            background: var(--lav-500, #b5acef);
            color: #fff;
          }
          .faq-a {
            padding: 0 20px 18px;
            font-size: 14px;
            line-height: 1.6;
            color: var(--fg-muted, #5c616a);
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
            color: var(--accent-hover, #8a7fe3);
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
            background: var(--accent-soft, #ebe8fb);
            border-radius: 14px;
            font-size: 14.5px;
            color: var(--fg-muted, #5c616a);
          }
          .faq-footer :global(a) {
            color: var(--lav-700, #6d62cf);
            font-weight: 700;
          }
        `}</style>
      </section>
    </>
  );
};

export default FAQMain;
