"use client";
import React from 'react';
import Link from 'next/link';
import LegalPageMain, { LegalSection } from './LegalPageMain';

const LAST_UPDATED = '2 de junio de 2026';

const sections: LegalSection[] = [
  {
    id: 'resumen',
    title: '1. Resumen y propósito',
    body: (
      <p>
        Esta política define qué tipo de contenido es <strong>aceptable</strong>{' '}
        en KIOSQUI y cuál está <strong>prohibido</strong>. Aplica a
        publicaciones de propiedades, fotos, descripciones, comentarios,
        mensajes y cualquier otro contenido subido a la plataforma. Su
        objetivo es proteger a los compradores y arrendatarios potenciales
        y mantener una comunidad confiable para todos los usuarios.
      </p>
    ),
  },
  {
    id: 'contenido-permitido',
    title: '2. Contenido permitido',
    body: (
      <>
        <p>Podés publicar:</p>
        <ul>
          <li>
            Casas, apartamentos y terrenos sobre los que tengás derecho
            legal de venta o renta.
          </li>
          <li>
            Fotografías reales del inmueble, tomadas o producidas
            específicamente para esa propiedad.
          </li>
          <li>
            Renders 3D <strong>siempre que se aclare</strong> en la
            descripción que el inmueble está en planos o construcción.
          </li>
          <li>
            Descripciones honestas: características, materiales,
            ubicación general, vecindario, accesos, vistas.
          </li>
          <li>
            Archivos 3D (GLB) del inmueble — para usuarios con plan pago.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'contenido-prohibido',
    title: '3. Contenido prohibido',
    body: (
      <>
        <p>
          Las siguientes publicaciones serán retiradas y pueden derivar en
          sanciones a la cuenta:
        </p>
        <ul>
          <li>
            <strong>Estafas o publicaciones engañosas:</strong> propiedades
            inexistentes, precios deliberadamente falsos para captar
            interés, contratos en suelo no urbanizable presentado como
            urbanizado, etc.
          </li>
          <li>
            <strong>Publicaciones sin derecho:</strong> inmuebles que no
            pertenecen al anunciante ni cuenta con autorización del
            propietario.
          </li>
          <li>
            <strong>Discriminación:</strong> excluir potenciales compradores
            o arrendatarios por raza, género, religión, nacionalidad,
            orientación sexual, estado civil, situación familiar o
            discapacidad.
          </li>
          <li>
            <strong>Contenido violento, sexual o ilegal</strong> en fotos,
            descripciones o mensajes.
          </li>
          <li>
            Inmuebles destinados a actividades ilícitas (lavado de dinero,
            tráfico, etc.).
          </li>
          <li>
            Publicaciones que infrinjan derechos de autor (fotos copiadas
            sin permiso, planos protegidos).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'fotos',
    title: '4. Requisitos sobre fotografías',
    body: (
      <>
        <ul>
          <li>
            Las fotos deben ser <strong>del propio inmueble</strong>; no
            son válidas imágenes de stock, capturas de internet ni fotos de
            otras propiedades.
          </li>
          <li>
            Resolución mínima recomendada: 800×600 px. Máximo 8 MB por
            archivo.
          </li>
          <li>
            Formatos aceptados: JPG, JPEG, PNG, WEBP, GIF. Máximo 10
            imágenes por publicación.
          </li>
          <li>
            No incluir marcas de agua de otras inmobiliarias o portales sin
            autorización.
          </li>
          <li>
            No mostrar rostros de personas sin su consentimiento (vecinos,
            inquilinos actuales). Si aparecen niños deben estar pixelados.
          </li>
          <li>
            No usar imágenes sexualmente sugestivas, violentas o
            engañosamente editadas (composiciones con cielo falso,
            jardines pegados, áreas inexistentes).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'contacto',
    title: '5. Información de contacto',
    body: (
      <>
        <p>
          KIOSQUI ofrece un sistema de mensajes interno y notificaciones
          para que compradores y vendedores se comuniquen sin salir de la
          plataforma. Por seguridad, queda{' '}
          <strong>prohibido</strong> en la descripción o las fotos:
        </p>
        <ul>
          <li>
            Pedir transferencias o pagos antes de validar la propiedad.
          </li>
          <li>
            Direccionar el contacto a portales o redes externas con el fin
            de evadir nuestras políticas o sistema de denuncias.
          </li>
          <li>
            Suplantar a otro anunciante o usar nombre/foto de terceros sin
            autorización.
          </li>
        </ul>
        <p>
          Compartir teléfono y correo en la descripción es permitido, pero
          recomendamos mantener la conversación en KIOSQUI para que el
          historial quede registrado en caso de disputa.
        </p>
      </>
    ),
  },
  {
    id: 'manipulacion',
    title: '6. Manipulación de precio o disponibilidad',
    body: (
      <>
        <p>Quedan prohibidas las siguientes prácticas:</p>
        <ul>
          <li>
            Publicar varias veces la misma propiedad bajo distintos perfiles
            o títulos para inflar visibilidad.
          </li>
          <li>
            Marcar como activas propiedades que ya se vendieron o
            arrendaron, para captar contactos.
          </li>
          <li>
            Anunciar un precio mucho menor al real (clickbait) para luego
            informar uno superior al consultar.
          </li>
          <li>
            Manipular fechas o estados de la publicación con automatización.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'suplantacion',
    title: '7. Suplantación de identidad',
    body: (
      <p>
        Está prohibido crear cuentas que se hagan pasar por otra persona,
        empresa o entidad, así como usar nombres, logos o marcas de
        terceros sin autorización. El uso de identidades falsas en la
        verificación es causal de baneo permanente.
      </p>
    ),
  },
  {
    id: 'spam',
    title: '8. Spam y abuso',
    body: (
      <>
        <p>
          Mantenemos la plataforma libre de spam con las siguientes reglas:
        </p>
        <ul>
          <li>
            No enviar mensajes masivos no solicitados a usuarios.
          </li>
          <li>
            No usar comentarios para promocionar servicios externos no
            relacionados con la propiedad.
          </li>
          <li>
            No publicar enlaces a sitios de phishing, descargas
            sospechosas o estafas conocidas.
          </li>
          <li>No usar bots para crear cuentas o publicaciones.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'reportar',
    title: '9. Cómo reportar contenido',
    body: (
      <>
        <p>
          Si encontrás una publicación o un comentario que viola esta
          política, podés denunciarlo desde el botón{' '}
          <strong>"Reportar"</strong> disponible en cada publicación y
          comentario. La denuncia llega al panel de soporte y se revisa por
          orden de gravedad.
        </p>
        <p>
          Las denuncias se manejan en forma confidencial; tu identidad no
          se revela al usuario denunciado.
        </p>
      </>
    ),
  },
  {
    id: 'sanciones',
    title: '10. Sanciones',
    body: (
      <>
        <p>Según la gravedad y reincidencia, podemos aplicar:</p>
        <ul>
          <li>
            <strong>Ocultar la publicación</strong> hasta que la corrijas.
          </li>
          <li>
            <strong>Eliminar la publicación</strong> sin opción a editar.
          </li>
          <li>
            <strong>Suspensión temporal</strong> de la cuenta (7 / 15 / 30
            días o personalizada).
          </li>
          <li>
            <strong>Baneo permanente</strong> en casos graves (fraude,
            suplantación, contenido ilegal).
          </li>
          <li>
            <strong>Reembolso de pauta</strong> como crédito reutilizable
            si la sanción interrumpe una campaña activa.
          </li>
        </ul>
        <p>
          Las condiciones completas de sanciones se detallan en los{' '}
          <Link href="/terminos#sanciones">Términos y Condiciones</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'apelaciones',
    title: '11. Apelaciones',
    body: (
      <p>
        Si considerás que una sanción fue injusta, podés apelarla desde la
        pantalla de login bloqueado. La apelación crea un ticket prioritario
        que será atendido por un agente distinto al que aplicó la sanción.
        Mientras la apelación esté abierta, la sanción se mantiene; si la
        apelación procede, restauraremos tu cuenta y publicaciones cuando
        sea posible.
      </p>
    ),
  },
];

const ContentPolicyMain: React.FC = () => (
  <LegalPageMain
    pageTitle="Política de Contenido"
    breadcrumbSubTitle="Contenido"
    lastUpdated={LAST_UPDATED}
    intro={
      <p>
        Esta política establece las reglas sobre el contenido que circula
        en <strong>KIOSQUI</strong>: qué se puede publicar, qué está
        prohibido y cómo reaccionamos ante el incumplimiento. Está pensada
        para proteger a la comunidad de fraude, contenido engañoso y
        prácticas que afecten la confianza en la plataforma.
      </p>
    }
    sections={sections}
  />
);

export default ContentPolicyMain;
