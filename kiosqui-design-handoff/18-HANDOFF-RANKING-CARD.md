# Kiosqui — Handoff #18: Tarjeta de ranking de vendedores (SIN portada)

**Para:** Claude Code · **De:** Claude Design · **Fecha:** 2026-06-24 · **APROBADO (Opción B).**
Rama `design/kiosqui-system`. Referencia visual: `concepts/Ranking de vendedores.html` (Opción B).

## Problema
La pantalla `/ranking` reusó la card de **empresa**, que tiene portada (banner 1920×560).
Los **vendedores NO tienen portada** → salía el placeholder gris "1920x560". Hay que quitar el banner.

## Solución — Opción B: podio con cinta de rango (sin portada)
Card vertical, **sin banner de portada**. De arriba a abajo:
1. **Cinta superior** de 6px de color:
   - **Top 3** = medalla: #1 oro `#e8b923`, #2 plata `#b8c0cc`, #3 bronce `#cd8b5e`.
   - #4 en adelante = lavanda `--lav-300`.
2. **Avatar** circular centrado (gradiente navy `navy-700→navy-900`, iniciales cream, 88px). El top 3
   lleva **borde del color de su medalla**; del #4 en adelante sin borde.
3. **Badge de rango** sobre el avatar (abajo-derecha, borde blanco 3px):
   - Top 3 = círculo del color de medalla con ícono `fa-medal` (texto `#3a2e00`).
   - #4+ = círculo navy con `#N` (texto cream).
4. **Nombre** (display bold) + **@handle** en lavanda `--lav-700`.
5. **Stats** en 3 columnas con divisores (`border-top` + `border-left`): Publicaciones / Seguidores /
   Rating. Rating con estrella **verde** (`--green-600`); si no tiene reseñas, mostrar `—` en gris.
6. **CTA "Ver perfil"**: top 3 = botón verde `.kq-btn--action`; #4+ = `.kq-btn--outline`. Full-width.

Markup de referencia: bloque `#gridB` en `concepts/Ranking de vendedores.html` (copiar estilos `.av`,
`.stats`, `.stat`). Dark mode por tokens.

## Notas
- Es la misma card para ambos tabs (**Vendedores destacados** y **Mejor calificados**); solo cambia
  el orden de los datos que envía el backend.
- Cuando el vendedor tenga **foto de perfil real**, reemplaza las iniciales del avatar (mantener el
  borde de medalla en top 3).
- **Cero portada / cero banner** en esta card. El placeholder "1920x560" debe desaparecer.

## Checklist
- [ ] `/ranking`: card sin portada (Opción B), cinta + medalla top 3, badge de rango, stats con rating verde.
- [ ] CTA verde (top 3) / outline (resto). Tabs Destacados / Mejor calificados reusan la card.
- [ ] Light/dark. `npx tsc --noEmit && npx next build`.
