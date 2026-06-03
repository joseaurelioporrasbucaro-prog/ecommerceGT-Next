"use client";
import React from 'react';
import Link from 'next/link';
import LegalPageMain, { LegalSection } from './LegalPageMain';

const LAST_UPDATED = '2 de junio de 2026';

const sections: LegalSection[] = [
  {
    id: 'aceptacion',
    title: '1. Aceptación de los Términos',
    body: (
      <>
        <p>
          Al crear una cuenta, publicar una propiedad o utilizar cualquier
          función de KIOSQUI aceptas estos Términos y Condiciones en su
          totalidad. Si no estás de acuerdo con alguna parte, no debes
          utilizar la plataforma.
        </p>
        <p>
          Estos Términos forman un contrato vinculante entre vos y KIOSQUI.
          Te recomendamos leerlos junto con nuestra{' '}
          <Link href="/privacidad">Política de Privacidad</Link> y{' '}
          <Link href="/contenido">Política de Contenido</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'quienes-somos',
    title: '2. Quiénes somos',
    body: (
      <>
        <p>
          KIOSQUI es una plataforma digital con sede en la República de
          Guatemala que permite a propietarios, agentes y empresas anunciar,
          buscar y conectar para la compraventa o renta de bienes inmuebles
          (casas, apartamentos y terrenos).
        </p>
        <p>
          KIOSQUI <strong>no es propietario</strong> de los inmuebles
          listados ni interviene directamente en las transacciones entre
          usuarios. Funcionamos como intermediario tecnológico que facilita
          el contacto entre partes.
        </p>
      </>
    ),
  },
  {
    id: 'cuenta',
    title: '3. Cuenta de usuario',
    body: (
      <>
        <p>
          Para publicar o contactar vendedores debes crear una cuenta. Al
          hacerlo declarás que:
        </p>
        <ul>
          <li>Sos mayor de 18 años de edad.</li>
          <li>
            La información proporcionada (nombre, correo, número de
            teléfono) es verídica y actualizada.
          </li>
          <li>
            Mantendrás la confidencialidad de tu contraseña; sos responsable
            de toda actividad realizada desde tu cuenta.
          </li>
          <li>
            Notificarás de inmediato cualquier acceso no autorizado por
            medio del{' '}
            <Link href="/soporte/tickets">portal de soporte</Link>.
          </li>
        </ul>
        <p>
          KIOSQUI puede suspender o eliminar tu cuenta si detecta uso
          fraudulento, suplantación de identidad o violación reiterada de
          estos Términos.
        </p>
      </>
    ),
  },
  {
    id: 'verificacion',
    title: '4. Verificación de identidad',
    body: (
      <>
        <p>
          Para acceder a ciertas funciones (como ser vendedor verificado,
          subir archivos 3D, recibir crédito de pauta o gestionar una
          empresa) deberás completar la verificación de identidad enviando:
        </p>
        <ul>
          <li>
            DPI o pasaporte vigente (personas naturales) — solo se almacena
            el número, encriptado.
          </li>
          <li>NIT y RTU vigente del SAT (empresas o negocios).</li>
          <li>Una fotografía sosteniendo el documento (selfie).</li>
        </ul>
        <p>
          Estos documentos se procesan únicamente para validar identidad.
          Consultá nuestra{' '}
          <Link href="/privacidad">Política de Privacidad</Link> sobre cómo
          los almacenamos y protegemos. Aprobar la verificación es
          discrecional de KIOSQUI; podemos solicitar información adicional.
        </p>
      </>
    ),
  },
  {
    id: 'publicaciones',
    title: '5. Publicaciones de propiedades',
    body: (
      <>
        <p>
          Como anunciante, sos el único responsable del contenido y la
          veracidad de tus publicaciones. Te comprometés a:
        </p>
        <ul>
          <li>
            Publicar únicamente propiedades sobre las que tengás el derecho
            legal de venta o renta (titularidad, poder, mandato).
          </li>
          <li>
            Subir fotografías reales del inmueble — no imágenes de stock,
            renders sin advertencia, ni fotos de otras propiedades.
          </li>
          <li>
            Indicar de buena fe el precio, ubicación, área y características
            de la propiedad.
          </li>
          <li>
            Marcar como <code>Vendida</code> o <code>Pausada</code> la
            publicación cuando ya no esté disponible.
          </li>
          <li>
            Cumplir con la <Link href="/contenido">Política de Contenido</Link>{' '}
            (prohibiciones de imágenes, contacto, lenguaje, etc.).
          </li>
        </ul>
        <p>
          Las publicaciones con información falsa o que infringen la
          política pueden ser ocultadas o eliminadas sin previo aviso, y
          podrían derivar en sanciones a la cuenta.
        </p>
      </>
    ),
  },
  {
    id: 'planes',
    title: '6. Planes, pagos y suscripciones',
    body: (
      <>
        <p>
          KIOSQUI ofrece un plan gratuito con límite de publicaciones y
          planes pagos con mayores cuotas, gestión de equipo y acceso a
          archivos 3D (GLB). Los precios y términos de cada plan se muestran
          en la página de <Link href="/pricing-plan">planes</Link>.
        </p>
        <ul>
          <li>
            Los pagos se procesan a través de proveedores de pago
            autorizados; KIOSQUI no almacena datos completos de tarjetas.
          </li>
          <li>
            Las suscripciones se renuevan automáticamente en el periodo
            contratado, salvo que las canceles antes del vencimiento.
          </li>
          <li>
            <strong>Reembolsos:</strong> los planes son no reembolsables una
            vez activados, salvo error técnico imputable a KIOSQUI o
            disposición legal.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'pauta',
    title: '7. Pauta y publicaciones destacadas',
    body: (
      <p>
        Podés <Link href="/pauta">pautar</Link> una publicación para que
        aparezca destacada en listados y secciones de inicio. La pauta tiene
        precio dinámico según duración y segmentación. Si una pauta no se
        consume por sanción o suspensión, KIOSQUI puede reembolsarla como
        crédito interno reutilizable en futuras campañas.
      </p>
    ),
  },
  {
    id: 'sanciones',
    title: '8. Sanciones, suspensión y baneo',
    body: (
      <>
        <p>
          KIOSQUI puede aplicar las siguientes sanciones cuando se detecte
          incumplimiento de estos Términos o de la Política de Contenido:
        </p>
        <ul>
          <li>
            <strong>Advertencia</strong> — notificación al usuario con
            indicaciones.
          </li>
          <li>
            <strong>Ocultar publicación</strong> — la publicación deja de
            ser visible hasta corregir.
          </li>
          <li>
            <strong>Suspensión temporal</strong> — bloqueo de la cuenta por
            7, 15, 30 días o periodo personalizado.
          </li>
          <li>
            <strong>Baneo permanente</strong> — bloqueo definitivo de la
            cuenta.
          </li>
        </ul>
        <p>
          Toda sanción puede <strong>apelarse</strong> desde la pantalla de
          login bloqueado, lo que genera un ticket de soporte con prioridad
          alta. El equipo de soporte revisará el caso y resolverá en plazo
          razonable.
        </p>
      </>
    ),
  },
  {
    id: 'propiedad-intelectual',
    title: '9. Propiedad intelectual',
    body: (
      <>
        <p>
          El nombre, logotipo, código fuente, diseño, ilustraciones y demás
          elementos de KIOSQUI son propiedad de sus titulares y están
          protegidos por la legislación de derechos de autor y marcas de
          Guatemala y tratados internacionales aplicables.
        </p>
        <p>
          Las fotografías y descripciones que subís a tus publicaciones son
          de tu propiedad o cuentas con autorización expresa. Al publicarlas
          en KIOSQUI nos otorgás una licencia <strong>no exclusiva</strong>,
          revocable, gratuita y mundial para mostrar, redimensionar y
          procesar dicho contenido únicamente con el fin de operar la
          plataforma.
        </p>
      </>
    ),
  },
  {
    id: 'limitacion',
    title: '10. Limitación de responsabilidad',
    body: (
      <>
        <p>
          KIOSQUI se ofrece <strong>"como está"</strong> y "según
          disponibilidad". En la máxima medida permitida por la ley:
        </p>
        <ul>
          <li>
            No garantizamos que la plataforma esté libre de interrupciones,
            errores o vulnerabilidades.
          </li>
          <li>
            No somos parte ni avalamos transacciones de bienes inmuebles
            entre usuarios. Verificar la titularidad, condiciones legales,
            áreas, linderos y precios reales es responsabilidad de las
            partes.
          </li>
          <li>
            No nos hacemos responsables por daños indirectos, lucro cesante,
            pérdida de oportunidades o reclamos derivados del contacto
            entre usuarios fuera de la plataforma.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'modificaciones',
    title: '11. Modificaciones a estos Términos',
    body: (
      <p>
        Podemos actualizar estos Términos en cualquier momento. La nueva
        versión entrará en vigor desde su publicación en esta página. Si los
        cambios son significativos, notificaremos a los usuarios registrados
        por correo o mediante un aviso en la plataforma con al menos{' '}
        <strong>15 días</strong> de anticipación. El uso continuado de la
        plataforma luego de la entrada en vigor implica la aceptación de los
        nuevos Términos.
      </p>
    ),
  },
  {
    id: 'jurisdiccion',
    title: '12. Ley aplicable y jurisdicción',
    body: (
      <p>
        Estos Términos se rigen por las leyes de la República de Guatemala.
        Cualquier controversia que surja en relación con la plataforma será
        sometida a los tribunales competentes de la Ciudad de Guatemala,
        salvo disposición legal en contrario.
      </p>
    ),
  },
];

const TermsMain: React.FC = () => (
  <LegalPageMain
    pageTitle="Términos y Condiciones"
    breadcrumbSubTitle="Términos"
    lastUpdated={LAST_UPDATED}
    intro={
      <p>
        Bienvenido/a a <strong>KIOSQUI</strong>, plataforma digital de bienes
        raíces. Estos Términos regulan la relación entre vos como
        usuario/a y KIOSQUI cuando navegás, publicás o contactás a través
        del sitio. Te invitamos a leerlos con atención.
      </p>
    }
    sections={sections}
  />
);

export default TermsMain;
