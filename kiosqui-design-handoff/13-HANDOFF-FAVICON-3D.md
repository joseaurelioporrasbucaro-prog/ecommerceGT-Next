# Kiosqui — Handoff #13: Favicon + ajuste botón 3D

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-14 · **APROBADO.**
Rama `design/kiosqui-system`.

## 1. Favicon de Kiosqui (faltaba)
Assets en `kiosqui-design-handoff/assets/` (copiar a `public/`):
- `favicon.png` (512×512) · `favicon-32x32.png` · `apple-touch-icon.png` (180×180)
Diseño: lente "Q" lavanda + apertura verde sobre navy redondeado (fiel al wordmark, evoca búsqueda).

En Next 13 (`src/app/layout.tsx`), exportar `metadata.icons`:
```ts
export const metadata = {
  // …
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};
```
(O colocar `icon.png`/`apple-icon.png` en `src/app/` y dejar que Next los detecte por convención.)

## 2. Ajuste del botón "Ver modelo 3D" (detalle)
- **Quitar** el botón 3D que estaba sobre la foto de la galería (no va en la galería).
- **Mantenerlo en la card del vendedor**, debajo de "Enviar mensaje": estilo lavanda
  (`lav-100` bg, `lav-500` borde, `lav-700` texto), full-width, con chip "Premium" + `fa-crown`.
- En la **barra sticky móvil**, el botón "3D" lleva una `fa-crown` pequeña al lado.
- Sigue condicionado a `hasGlb` (solo si la pub tiene modelo).
Referencia: `Batch D - Listado, Detalle y Comentarios.html` (sección Detalle) · `batch_d/DetailScreen.jsx`.
