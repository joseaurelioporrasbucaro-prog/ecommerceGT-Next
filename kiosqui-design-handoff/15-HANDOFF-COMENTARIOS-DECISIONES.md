# Kiosqui — Handoff #15: Corrección de comentarios + decisiones del detalle

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-17 · **APROBADO.**
Rama `design/kiosqui-system`. Referencia: `Batch D - Listado, Detalle y Comentarios.html` (sección
Preguntas, actualizada) · `batch_d/CommentsView.jsx`.

---

## 1. Comentarios / Preguntas — APLANAR a 2 niveles (corrección)

La implementación actual mantiene el **árbol recursivo del foro** (`PublicationComments`) con colores
Kiosqui encima → se ven cajas lavanda dentro de cajas dentro de cajas ("Aurelio responde a Aurelio que
responde a Aurelio"). **Eso rompe el patrón.** Hay que aplanar:

### Regla
- **Máximo 2 niveles**: pregunta (nivel 0) → respuestas (nivel 1). **Nada más profundo.**
- Una **respuesta-a-respuesta NO se indenta más**: se renderiza en el **mismo nivel 1** (como
  Instagram / portales inmobiliarios), opcionalmente con `@mención` en lavanda al inicio del texto
  para indicar a quién responde. No crear un tercer contenedor anidado.
- Todas las respuestas de una pregunta van en **una sola sangría** (`margin-left:56px`), apiladas con
  `gap`. No anidar cajas.

### Estilo por tipo de respuesta
- **Respuesta del vendedor** = franja destacada: fondo `--accent-soft`, `border-left:3px solid
  --lav-500`, radius `--r-md`, chip "Vendedor" (`fa-home`) lavanda. Compacta — NO un contenedor que
  envuelve sub-respuestas.
- **Respuesta de comunidad** = normal (avatar navy + texto), sin fondo, con `@mención` lavanda si aplica.
- Acciones por ítem: Me gusta (`fa-thumbs-up`) + Responder + overflow (`fa-ellipsis-h`). Mantener
  menciones/likes/reportes que ya existen.

### Resto
- Composer pill verde "Preguntar" (ya está bien). Mantener el `@` para mención (es funcional), pero
  el placeholder puede quedar "Escribí tu pregunta sobre esta propiedad…".
- Subtítulo: **"Preguntá lo que necesites saber sobre esta propiedad. El vendedor o la comunidad te
  responde."** (el "o la comunidad" de CC queda, está bien.)
- "Ver N respuestas más" colapsa el nivel 1 cuando hay muchas. Estado vacío: "Sé el primero en preguntar".
- Avatares: usar la foto real del usuario; placeholder solo si no hay (no el recuadro gris "146X146").

> En código: aplanar el render recursivo de `PublicationComments` a `pregunta → replies[]` (un solo
> nivel). Si el backend devuelve árbol, colapsar todos los descendientes a `replies` del comentario
> raíz y resolver el "a quién responde" con `@mención`. `TODO(backend)` si hace falta exponerlo plano.

---

## 2. Decisiones del detalle (confirmadas)

1. **Galería = visor único + miniaturas (la de CC), NO el mosaico.** Para N fotos verticales/horizontales
   es lo correcto: foto grande + tira de miniaturas + lightbox. El mosaico del mock era solo ilustrativo.
   Mantener sobre el visor el botón **3D Premium** (lavanda + corona, si `hasGlb`) y el contador "+N".
2. **Barra sticky inferior = solo móvil (como CC).** En desktop la card sticky del vendedor ya cumple
   esa función. No duplicar en desktop.
3. **Precio dual = OK, sin tipo de cambio.** Cada monto (Q y/o US$) lo escribe el dueño al publicar; si
   solo hay uno, se muestra ese. Nota "tipo de cambio referencial" eliminada.

---

## 3. Pantallas que faltan vestir (roadmap acordado)

Confirmo el mapa de Claude Code. Orden por impacto al usuario (cara al cliente primero):

| Prioridad | Pantalla | Estado | Quién diseña |
|---|---|---|---|
| **1** | **Configuración de cuenta** (`Creator-Profile-info/*`): datos personales, métodos de pago, verificar cuenta, zona de peligro | skin viejo | **Claude Design — próximo batch** |
| **2** | **Perfil de empresa** (`company/*`): tabs, equipo, publicaciones | skin viejo | **Claude Design — próximo batch** |
| 3 | **Portal de soporte (staff)** (`support/*`): tickets, reportes, usuarios, verificaciones | skin viejo (interno) | Claude Design — después |
| 4 | **Admin** (`admin/*`) | skin viejo (interno) | Claude Design — después |

**No bloqueante de diseño (producto/backend):** pasarela de pago (Fase 11.2), i18n restante,
y decisión de **legacy** (`art-*`, `forum`, `wallet-connect`, `survey`, `home-two/three`) → mi
recomendación: **retirar** lo del template NFT que no aplica a inmobiliaria.

**Próximo entregable de Claude Design:** Batch E = **Configuración de cuenta** + **Perfil de empresa**.
Soporte y admin (internos) los dejo al final, como sugirió Claude Code.

## Checklist
- [ ] Comentarios aplanados a 2 niveles (sin cajas anidadas; respuesta-a-respuesta al mismo nivel con @mención).
- [ ] Vendedor destacado = franja lavanda compacta; comunidad = normal.
- [ ] Galería visor+miniaturas; barra sticky solo móvil; precio dual del dueño.
- [ ] Avatares con foto real (no placeholder gris).
- [ ] Light/dark. `npx tsc --noEmit && npx next build`. Gaps → feedback §2.
