# Almacenamiento de imágenes en Kiosqui — por qué NO depender del disco de Render

> **Documento para el equipo.** Explica por qué Kiosqui necesita un almacenamiento
> de imágenes dedicado (object storage) en lugar de guardar las fotos en el disco
> del servidor de Render, cuál es la opción más económica y qué tan grande es el
> cambio. Autor: equipo de plataforma · Fecha: 2026-06-28.

---

## TL;DR (resumen ejecutivo)

- **Hoy las fotos del marketplace se guardan en el disco del servidor backend (Render).**
- **El disco de Render es efímero:** se borra en cada *deploy* y en cada reinicio del
  servicio. Es decir, **cada vez que publicamos una nueva versión del backend, las
  imágenes que subieron los usuarios se pierden** y quedan rotas en toda la plataforma.
- En un marketplace **las fotos SON el producto** (propiedades, logos, perfiles,
  documentos de verificación). Perderlas no es un bug cosmético: es pérdida de datos
  del negocio y de confianza del usuario.
- La solución estándar es **separar el almacenamiento del servidor** usando *object
  storage* (un servicio dedicado a guardar archivos).
- **Opción más económica para nuestro caso: Cloudflare R2** — almacenamiento barato y,
  sobre todo, **sin cobro por egress (ancho de banda de salida)**, que es justo el costo
  que más duele al servir muchas fotos. Con el plan gratuito (10 GB + millones de
  lecturas/mes) **arrancamos en US$0/mes**.
- **El cambio es acotado:** la arquitectura ya guarda las imágenes como una URL en la
  base de datos, así que migrar es cambiar *dónde* se sube el archivo, no rediseñar
  el sistema.

---

## 1. Cómo funciona hoy

El backend (Express, `server.js`) recibe las imágenes con **multer** y las escribe en
el **disco local del servidor**:

```
uploads/images/        ← fotos de publicaciones
uploads/site-assets/   ← banners y assets del sitio
uploads/verification/  ← documentos de verificación de identidad (KYC)
```

Luego se sirven con `express.static('/uploads')`, y en la base de datos guardamos solo
la **ruta** del archivo (un texto, ej. `/uploads/images/1700000000-foto.jpg`). El
frontend arma la URL completa con `getBackendUrl(...)`.

Mientras desarrollamos en nuestras máquinas esto funciona perfecto, porque el disco es
permanente. **El problema aparece en producción (Render).**

---

## 2. El problema: el disco de Render es efímero

Render (y casi todas las plataformas de tipo *contenedor*: Heroku, Railway, etc.)
ejecutan el backend en un sistema de archivos **efímero**. Eso significa que el disco
**se reinicia a su estado original** en varios momentos normales del día a día:

- **En cada despliegue** (cada vez que subimos código nuevo del backend).
- **En cada reinicio** del servicio (mantenimiento, caídas, escalado).
- Si algún día tenemos **más de una instancia**, cada una tendría su propio disco y
  verían fotos distintas.

### Qué pasa en la práctica

```
1. Un usuario publica una casa y sube 8 fotos.   ✅ se ven bien
2. La semana siguiente desplegamos una mejora del backend.
3. Render recrea el contenedor → la carpeta uploads/ vuelve a estar vacía.
4. Las 8 fotos ya no existen. La publicación queda con imágenes rotas.  ❌
   Lo mismo para TODOS los logos, avatares y documentos subidos hasta ese momento.
```

No es hipotético: es el comportamiento garantizado de la plataforma. **Cada deploy =
borrón de todas las imágenes subidas por usuarios.**

### Por qué para Kiosqui es crítico (y no opcional)

- **Es un marketplace inmobiliario: las fotos son el corazón del producto.** Una
  propiedad sin fotos no se vende; un perfil sin logo no genera confianza.
- **Afecta también la verificación de identidad (KYC).** Si se pierden los documentos
  subidos, se rompe el flujo de verificación y el soporte.
- **Daña la reputación.** Un usuario que vuelve y ve sus fotos rotas asume que la
  plataforma "no funciona" y se va.
- **Nos ata las manos:** no podríamos desplegar mejoras del backend sin arriesgar los
  datos, lo cual frena todo el desarrollo.

---

## 3. Otros límites de depender del disco del servidor (más allá del borrado)

Aunque Render ofrece un *disco persistente* opcional (ver §5), guardar imágenes en el
servidor tiene desventajas estructurales:

| Limitación | Por qué importa |
|---|---|
| **No escala horizontalmente** | Si crece el tráfico y necesitamos 2+ servidores, cada uno tendría fotos distintas. El disco fuerza a una sola instancia. |
| **Acopla almacenamiento con cómputo** | Pagamos un servidor más grande solo para tener más espacio de fotos, en vez de pagar almacenamiento barato por separado. |
| **Sin CDN** | Las fotos se sirven desde un solo lugar (EE.UU.), más lentas para usuarios en Guatemala. Object storage trae red de distribución global (CDN) incluida. |
| **Backups manuales** | Respaldar un disco es trabajo manual y frágil. Los servicios de object storage tienen durabilidad y redundancia de fábrica. |

---

## 4. La solución: object storage

*Object storage* es un servicio cuyo único trabajo es **guardar y servir archivos** de
forma duradera, barata y rápida (con CDN). En vez de escribir la foto en el disco del
servidor, el backend la **sube al servicio de almacenamiento** y guarda en la base de
datos la **URL pública** que ese servicio devuelve.

```
ANTES:  navegador → backend → disco del servidor (se borra en cada deploy)
DESPUÉS: navegador → backend → bucket de object storage (permanente + CDN)
                                      ↑
                       el backend guarda la URL en la BD
```

Ejemplos: **Cloudflare R2, Amazon S3, Backblaze B2, DigitalOcean Spaces** (almacenamiento
crudo, compatibles con la API de S3) o **Cloudinary / ImageKit** (especializados en
imágenes, con optimización y miniaturas automáticas).

---

## 5. Comparación de opciones y costos

> Precios vigentes a **junio 2026** (verificar en la página oficial antes de contratar).
> El costo que más pesa al servir un marketplace de fotos es el **egress** (ancho de
> banda de salida: lo que se cobra por *entregar* las imágenes a los visitantes).

| Opción | Almacenamiento | **Egress (servir fotos)** | Plan gratis | Notas |
|---|---|---|---|---|
| **Cloudflare R2** ⭐ | US$0.015 / GB-mes | **GRATIS (siempre)** | 10 GB + 1M escrituras + 10M lecturas / mes | API compatible con S3, CDN de Cloudflare incluida |
| **Backblaze B2** | US$0.006 / GB-mes (el más barato en storage) | Gratis hasta 3× lo almacenado, luego US$0.01/GB | 10 GB | API compatible con S3; egress gratis vía Cloudflare |
| **Amazon S3** | ~US$0.023 / GB-mes | **US$0.09 / GB** (primeros 100 GB/mes gratis) | Solo créditos temporales (US$200, 6 meses) | El egress lo hace caro para servir muchas fotos |
| **Render — Disco persistente** | ~US$0.25 / GB-mes | (se sirve desde el servidor, sin CDN) | — | Parche rápido, pero NO escala y sigue atado a una instancia |
| **Cloudinary** | Plan gratis generoso (modelo de "créditos") | incluido en el plan | sí (free tier amplio) | Trae optimización/miniaturas/CDN; ideal si queremos auto-resize |

### Recomendación: Cloudflare R2 (la más económica para nuestro uso)

Para un marketplace, **el costo dominante es el egress**, no el almacenamiento. R2
**no cobra egress nunca**, y su plan gratuito (10 GB y millones de lecturas al mes) muy
probablemente **cubre a Kiosqui en su lanzamiento sin costo**. Backblaze B2 es más barato
en almacenamiento puro, pero R2 gana en costo total al servir + trae CDN + API de S3
(herramientas estándar). Amazon S3, aunque es el estándar de industria, sale caro
justamente por el egress.

> Si más adelante queremos **optimización automática de imágenes** (servir la card en
> 3:2 y el detalle en alta sin generar versiones a mano), **Cloudinary** es la mejor
> opción funcional. Pero como prioridad #1 (no perder datos al menor costo), **R2 es la
> recomendación.**

---

## 6. Ejemplo de costo para Kiosqui

**Escenario de lanzamiento** (estimación conservadora):
- ~2,000 publicaciones × 6 fotos × ~400 KB ≈ **5 GB almacenados** → dentro del plan gratis de R2.
- ~50,000 visitas/mes × ~8 imágenes ≈ 400,000 lecturas/mes → dentro de los 10M gratis.
- ~150 GB/mes de imágenes servidas (egress).

| | Cloudflare R2 | Amazon S3 |
|---|---|---|
| Almacenamiento (5 GB) | US$0 (plan gratis) | ~US$0.12 |
| Egress (150 GB/mes) | **US$0** | ~US$13.5 |
| **Total / mes** | **~US$0** | **~US$13.6** |

**Escenario con crecimiento** (100 GB almacenados, 1 TB de egress/mes):

| | Cloudflare R2 | Amazon S3 |
|---|---|---|
| Almacenamiento (100 GB) | ~US$1.50 | ~US$2.30 |
| Egress (1 TB/mes) | **US$0** | ~US$90 |
| **Total / mes** | **~US$1.50** | **~US$92** |

El egress es lo que dispara el costo en S3 y lo que R2 elimina. Por eso R2 es la opción
más económica para servir un marketplace de fotos.

---

## 7. ¿Qué tan grande es el cambio? (impacto técnico)

**Bajo.** La arquitectura actual ya está preparada, porque:

1. La subida está **centralizada** en el backend (`server.js`, la configuración de multer
   está en pocos puntos).
2. La base de datos **ya guarda la imagen como un texto (URL/ruta)**, no como un archivo.
3. El frontend **ya resuelve la URL** con `getBackendUrl(...)`.

Migrar consiste en:

- Cambiar el *storage engine* de multer para que **suba al bucket** (R2/S3) en lugar del
  disco, y guardar en la BD la **URL devuelta** por el servicio.
- Un ajuste menor: que `getBackendUrl(...)` **deje pasar las URLs absolutas** (las del
  bucket) sin modificarlas.
- (Opcional) Migrar las imágenes existentes al bucket una sola vez.

No requiere rediseñar la base de datos ni el frontend. Es un cambio **aditivo y acotado**,
del lado del backend.

> Nota de proceso: este cambio es de **backend** y se implementará marcando el código con
> `// Codigo Aurelio`, previa autorización, con su propio plan/PR.

---

## 8. Riesgos de NO hacerlo (urgencia)

- **Pérdida de datos en cada deploy** del backend: fotos, logos y documentos de
  verificación rotos para todos los usuarios.
- **No podemos desplegar mejoras del backend con tranquilidad** mientras esto siga así.
- El problema **crece con el tiempo**: mientras más usuarios suban fotos, mayor el daño
  cuando se borren.

Es un riesgo de **integridad de datos en producción**, no una mejora estética. Conviene
resolverlo **antes de abrir la plataforma a usuarios reales** (o de inmediato si ya hay
usuarios subiendo contenido).

---

## 9. Próximos pasos propuestos

1. **Decidir el proveedor** (recomendado: **Cloudflare R2**; alternativa con optimización
   de imágenes: Cloudinary).
2. Crear la cuenta y el *bucket*, generar credenciales (API keys) y guardarlas como
   variables de entorno (nunca en el código).
3. Implementar el cambio en el backend (storage engine de multer → bucket) + ajuste de
   `getBackendUrl`.
4. Migrar las imágenes ya existentes al bucket (script de una sola vez).
5. Desplegar y verificar que subir/ver imágenes funciona y **sobrevive a un nuevo deploy**.

---

### Fuentes (precios, junio 2026)

- Cloudflare R2 — https://developers.cloudflare.com/r2/pricing/
- Amazon S3 — https://aws.amazon.com/s3/pricing/
- Backblaze B2 — https://www.backblaze.com/cloud-storage/pricing
