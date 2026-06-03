"use client";
import React from 'react';
import Link from 'next/link';
import LegalPageMain, { LegalSection } from './LegalPageMain';

const LAST_UPDATED = '2 de junio de 2026';

const sections: LegalSection[] = [
  {
    id: 'alcance',
    title: '1. Alcance de esta política',
    body: (
      <p>
        Esta Política de Privacidad describe qué información recolecta
        KIOSQUI, cómo la usamos, con quién la compartimos y los derechos
        que tenés sobre ella. Aplica a todas las personas que usan la
        plataforma, ya sea como visitantes, anunciantes, agentes o
        empresas. Al usar KIOSQUI aceptás esta política, que debe leerse
        junto con nuestros{' '}
        <Link href="/terminos">Términos y Condiciones</Link>.
      </p>
    ),
  },
  {
    id: 'datos-recolectados',
    title: '2. Datos que recolectamos',
    body: (
      <>
        <h4>2.1 Datos de cuenta</h4>
        <p>
          Cuando creás una cuenta nos brindás: nombre completo, dirección de
          correo electrónico, contraseña (almacenada como hash) y, de forma
          opcional, número de teléfono.
        </p>

        <h4>2.2 Datos de perfil</h4>
        <p>
          Foto de avatar, foto de portada, biografía, ubicación general,
          enlaces a redes sociales — todos opcionales y modificables desde
          tu perfil.
        </p>

        <h4>2.3 Datos sensibles de verificación</h4>
        <p>
          Para verificar identidad: número de DPI o pasaporte (personas
          naturales), NIT y RTU vigente (empresas), y una fotografía con el
          documento. Estos datos:
        </p>
        <ul>
          <li>
            Se almacenan <strong>encriptados</strong> con AES-256-GCM en
            nuestra base de datos.
          </li>
          <li>
            Solo se exponen al equipo de soporte autorizado durante la
            revisión de la solicitud.
          </li>
          <li>
            <strong>Nunca</strong> se muestran en perfiles públicos ni en
            endpoints abiertos.
          </li>
        </ul>

        <h4>2.4 Publicaciones</h4>
        <p>
          Contenido que subís voluntariamente: fotos del inmueble, archivos
          3D (GLB), descripción, dirección, precio, características y
          ubicación geográfica.
        </p>

        <h4>2.5 Datos de pago</h4>
        <p>
          Cuando contratás un plan o pauta procesamos el pago mediante
          proveedores autorizados. KIOSQUI <strong>no almacena</strong>{' '}
          números completos de tarjeta ni CVV — solo guardamos referencias
          tokenizadas e información de facturación necesaria por ley.
        </p>

        <h4>2.6 Datos técnicos y de uso</h4>
        <p>
          Dirección IP, agente de usuario (navegador y sistema operativo),
          páginas visitadas, búsquedas realizadas y eventos de interacción.
          Estos datos se usan en forma agregada para mejorar la plataforma.
        </p>

        <h4>2.7 Comunicaciones</h4>
        <p>
          Mensajes que envías a otros usuarios desde la plataforma,
          comentarios en publicaciones y tickets de soporte. Estos contenidos
          se almacenan para entregar el servicio y resolver disputas.
        </p>
      </>
    ),
  },
  {
    id: 'como-usamos',
    title: '3. Cómo usamos tus datos',
    body: (
      <>
        <p>Tratamos tus datos para:</p>
        <ul>
          <li>Operar la plataforma y permitirte usar sus funcionalidades.</li>
          <li>
            Verificar identidad de anunciantes y reducir riesgo de fraude.
          </li>
          <li>
            Procesar pagos de planes y pautas a través de proveedores
            autorizados.
          </li>
          <li>
            Enviar notificaciones operativas (comentarios, mensajes,
            cambios de estado de tus publicaciones).
          </li>
          <li>
            Atender solicitudes de soporte y resolver disputas entre
            usuarios.
          </li>
          <li>
            Cumplir con obligaciones legales (facturación, lavado de
            dinero, requerimientos judiciales).
          </li>
          <li>
            Mejorar el producto en forma agregada (analítica, métricas de
            uso).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'compartimos',
    title: '4. Con quién compartimos tus datos',
    body: (
      <>
        <p>
          Tus datos <strong>no se venden</strong> a terceros. Compartimos
          información únicamente en estos escenarios:
        </p>
        <ul>
          <li>
            <strong>Proveedores de infraestructura</strong> (hosting, correo
            transaccional, almacenamiento) que actúan como
            procesadores bajo contrato.
          </li>
          <li>
            <strong>Proveedores de pago autorizados</strong> para procesar
            transacciones.
          </li>
          <li>
            <strong>Autoridades</strong> cuando exista requerimiento
            judicial o legal válido.
          </li>
          <li>
            <strong>Otros usuarios</strong> únicamente la información que
            elegiste exponer (nombre, avatar, publicaciones, comentarios).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies y tecnologías similares',
    body: (
      <>
        <p>
          Usamos cookies y almacenamiento local del navegador para:
        </p>
        <ul>
          <li>
            <strong>Mantener tu sesión iniciada</strong> (cookie de
            autenticación).
          </li>
          <li>
            Recordar tus preferencias (idioma, modo oscuro/claro).
          </li>
          <li>
            Recordar tu aceptación del banner de cookies.
          </li>
          <li>
            Medir el uso de la plataforma en forma agregada (analítica).
          </li>
        </ul>
        <p>
          Podés borrar cookies desde la configuración de tu navegador, pero
          ciertas funciones (mantener sesión, preferencias) podrían dejar
          de funcionar.
        </p>
      </>
    ),
  },
  {
    id: 'derechos',
    title: '6. Tus derechos sobre tus datos',
    body: (
      <>
        <p>Tenés derecho a:</p>
        <ul>
          <li>
            <strong>Acceso:</strong> ver qué datos tuyos tenemos. Tu perfil
            ya muestra los principales; para datos sensibles podés solicitar
            un reporte por soporte.
          </li>
          <li>
            <strong>Rectificación:</strong> corregir datos inexactos desde tu
            perfil o pidiéndolo a soporte.
          </li>
          <li>
            <strong>Desactivar cuenta (recuperable):</strong> desde{' '}
            <Link href="/creator-profile-info-personal">tu perfil</Link>,
            sección "Zona sensible" → "Desactivar". Tu cuenta queda pausada
            pero conservamos tus datos intactos. Cuando iniciás sesión
            nuevamente la cuenta se reactiva automáticamente. Sin límite
            de tiempo para regresar.
          </li>
          <li>
            <strong>Eliminar cuenta (definitivo):</strong> desde{' '}
            <Link href="/creator-profile-info-personal">tu perfil</Link>,
            sección "Zona sensible" → "Eliminar". Inicia un{' '}
            <strong>período de gracia de 30 días</strong>. Durante ese
            plazo podés cancelar la eliminación iniciando sesión. Pasados
            los 30 días anonimizamos tus datos personales (nombre, correo,
            teléfono, DPI, fotos) de forma definitiva; el registro mínimo
            necesario para integridad referencial (FKs en mensajes,
            tickets, transacciones) se conserva pero queda imposible de
            asociar a vos.
          </li>
          <li>
            <strong>Oposición:</strong> rechazar comunicaciones de marketing
            o ciertos tratamientos no esenciales.
          </li>
          <li>
            <strong>Portabilidad:</strong> recibir tus datos en un formato
            común y estructurado.
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos creá un{' '}
          <Link href="/soporte/tickets">ticket de soporte</Link> o escribí
          a <a href="mailto:privacidad@kiosqui.gt">privacidad@kiosqui.gt</a>.
        </p>
      </>
    ),
  },
  {
    id: 'retencion',
    title: '7. Retención de datos',
    body: (
      <>
        <p>Conservamos tus datos por el tiempo necesario para:</p>
        <ul>
          <li>Operar tu cuenta mientras esté activa.</li>
          <li>
            Cumplir obligaciones contables y tributarias (mínimo 4 años para
            facturación según legislación guatemalteca).
          </li>
          <li>
            Atender posibles reclamos o disputas (3 años desde la última
            interacción).
          </li>
        </ul>
        <p>
          Tras eliminar tu cuenta, los datos personales se anonimizan
          (nombre, correo, foto) mientras se preservan datos agregados
          necesarios para la integridad del sistema.
        </p>

        <h4>7.1 Registro de auditoría (prevención de fraude)</h4>
        <p>
          Como base legal de <strong>interés legítimo en la prevención
          de fraude</strong>, mantenemos un registro de auditoría que
          conserva, de manera <strong>indefinida</strong>, hashes
          criptográficos irreversibles (SHA-256) de los siguientes
          identificadores de cuentas eliminadas o sancionadas:
        </p>
        <ul>
          <li>Hash del correo electrónico utilizado.</li>
          <li>Hash del DPI / documento de identidad (si fue verificado).</li>
          <li>Hash del número de teléfono (si lo proporcionaste).</li>
          <li>Motivo de la baja y fecha en que ocurrió.</li>
        </ul>
        <p>
          Estos hashes <strong>no son datos personales legibles</strong> —
          no se pueden revertir al valor original. Sirven exclusivamente
          para detectar cuando un usuario previamente baneado por fraude
          intenta volver con datos distintos, en cuyo caso bloqueamos el
          nuevo registro. No los compartimos con terceros y no los
          utilizamos para perfilado ni marketing.
        </p>
      </>
    ),
  },
  {
    id: 'seguridad',
    title: '8. Seguridad',
    body: (
      <>
        <p>Aplicamos medidas razonables para proteger tus datos:</p>
        <ul>
          <li>Cifrado en tránsito (HTTPS) y en reposo para datos sensibles.</li>
          <li>Contraseñas almacenadas como hash con sal por usuario.</li>
          <li>
            DPI, NIT y RTU encriptados con AES-256-GCM con clave secreta de
            servidor.
          </li>
          <li>
            Control de acceso por roles: solo personal autorizado de soporte
            puede ver datos de verificación.
          </li>
          <li>
            Monitoreo de actividad y rotación de claves cuando se detectan
            incidentes.
          </li>
        </ul>
        <p>
          Ninguna medida es infalible. Si detectás un incidente de seguridad,
          reportalo de inmediato a{' '}
          <a href="mailto:seguridad@kiosqui.gt">seguridad@kiosqui.gt</a>.
        </p>
      </>
    ),
  },
  {
    id: 'menores',
    title: '9. Menores de edad',
    body: (
      <p>
        KIOSQUI no está dirigido a menores de 18 años y no recolectamos
        datos a sabiendas de personas menores de esa edad. Si detectamos
        una cuenta perteneciente a un menor procederemos a eliminarla.
      </p>
    ),
  },
  {
    id: 'cambios',
    title: '10. Cambios a esta política',
    body: (
      <p>
        Podemos actualizar esta política para reflejar cambios en la
        plataforma o en la legislación. Notificaremos cambios significativos
        por correo o aviso en la plataforma con al menos 15 días de
        anticipación. La versión vigente siempre estará disponible en esta
        página, con la fecha de última actualización al inicio.
      </p>
    ),
  },
  {
    id: 'contacto',
    title: '11. Contacto',
    body: (
      <p>
        Para cualquier consulta sobre esta Política de Privacidad o sobre
        tus datos personales:
        <br />
        Email: <a href="mailto:privacidad@kiosqui.gt">privacidad@kiosqui.gt</a>
        <br />
        Soporte: <Link href="/soporte/tickets">portal de tickets</Link>
      </p>
    ),
  },
];

const PrivacyMain: React.FC = () => (
  <LegalPageMain
    pageTitle="Política de Privacidad"
    breadcrumbSubTitle="Privacidad"
    lastUpdated={LAST_UPDATED}
    intro={
      <p>
        En <strong>KIOSQUI</strong> tu privacidad nos importa. Este
        documento explica con claridad qué datos personales recolectamos,
        cómo los usamos, con quién los compartimos y los derechos que
        tenés para gestionarlos. Si tenés dudas, contactanos por los
        canales que encontrarás al final.
      </p>
    }
    sections={sections}
  />
);

export default PrivacyMain;
