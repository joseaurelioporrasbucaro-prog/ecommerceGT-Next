# Prompt para Codex — Campos/endpoints de backend que faltan para el rediseño Kiosqui

**Repo:** `ecommerceGTBackEnd` (Express + node-postgres, `config/connPostgresDB.js`).
**Contexto:** el rediseño del frontend (Kiosqui) dejó elementos de UI que necesitan datos que el
backend **todavía no devuelve**. El frontend ya los maneja "a prueba de faltante" (omite o muestra
fallback), así que **agregar estos campos es aditivo y no rompe nada**. Marcá cada cambio con
`// Codigo Aurelio`. No cambies contratos existentes; solo **agregá** campos/fields a las respuestas.

> Cada ítem dice: dónde, qué agregar, y (si aplica) la **decisión** de producto. Si un dato es
> sensible o ambiguo, dejalo anotado en vez de exponerlo.

---

## 1. Rating de empresa — `GET /company-profile/:id`
La tarjeta del perfil público de empresa quiere un stat **"Calificación" con estrella**, pero
`company` no trae rating. **Agregar** a la respuesta `company`:
- `rating` (número, promedio de reseñas del/los vendedor(es) de la empresa) y
- `reviews` (conteo total de reseñas).
Si la empresa agrupa varios vendedores, definí la agregación (promedio ponderado por # reseñas).
Si no hay reseñas, devolver `rating: 0, reviews: 0` (el front muestra "—").

## 2. Rol "Admin" de empleados — `GET /company-profile/:id` (employees[])
La tab Empleados quiere un badge **"Admin"**. Hoy `CompanyProfileEmployee` expone solo
`cusid/firstname/lastname/handle/imagenu` y el código dice *"por seguridad NO se expone el rol"*.
**DECISIÓN de producto:** ¿el rol admin es público?
- Si **sí** → agregar `isAdmin` (boolean) a cada empleado.
- Si **no** → no hacer nada (el front ya omite el badge). Documentá la decisión.

## 3. Contacto de empresa — `GET /company-profile/:id`
El botón **"Contactar"** del perfil de empresa hoy cae a `/messages` (bandeja) porque la empresa se
identifica por `busid` y la mensajería es por `cusid`. **Agregar** a `company` un
`contactCusId` (el `cus_id` del dueño/admin con quien iniciar el chat) para armar
`/messages?with=<contactCusId>`. Si preferís, exponé una ruta dedicada de contacto de empresa.

## 4. Conteo de publicaciones por usuario — endpoint de Usuarios (soporte/admin)
La tabla **Usuarios** del portal staff quiere una columna **"Pub."** (cuántas publicaciones tiene
el usuario). El row (`SupportUserRow`) no trae el conteo. **Agregar** `pubCount` (int) a cada fila
del endpoint que lista usuarios para soporte/admin (un `COUNT` de `ecom.publications` por `cus_id`).

## 5. Verificado del contacto en mensajes — endpoint de inbox / conversación
La barra de contexto del hilo (`/messages`) quiere un **check ✓** junto al nombre del contacto
("con Carlos Ramírez ✓"). El item del inbox trae `contact_name/contact_image/pub_title` pero **no**
si el contacto está verificado. **Agregar** `contact_verified` (boolean) al item del inbox y/o al
detalle de conversación (de `ecom.customer.verified` o el campo equivalente del contacto).

## 6. (Opcional) Dimensiones recomendadas de site-assets — `/admin/site-assets`
La pantalla **Admin · Imágenes** muestra "{w}×{h} px recomendado", pero usa las dimensiones
**almacenadas** del asset. Si las recomendadas deben **diferir** de las subidas, agregar
`recommendedWidth`/`recommendedHeight` por asset. Si las almacenadas sirven, **no hacer nada**.

---

## 7. (Más grande — feature aparte, NO un simple campo) Adjuntos en mensajería
El composer de `/messages` muestra (en el mockup) un **clip de adjuntar**, pero la mensajería no
soporta adjuntos. Esto **no es un campo**: requiere subir/almacenar archivos por mensaje + devolverlos
en el hilo. Dejarlo como **feature futura** (no lo metas con los anteriores). Si se prioriza, va en
su propio prompt: tabla `message_attachments`, endpoint de upload, y el render en el hilo.

---

## Cómo validar
- `node --watch server.js` levanta y no rompe los endpoints existentes.
- Probar cada endpoint y confirmar que el nuevo campo aparece y los consumidores actuales siguen OK.
- El frontend ya está listo para usarlos: en cuanto el campo exista, la UI lo muestra (rating con
  estrella, badge Admin, Contactar real, columna Pub., check del contacto).
