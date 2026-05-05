import { NextRequest, NextResponse } from 'next/server';

/**
 * Rutas que requieren sesión activa.
 * El middleware verifica la existencia de la cookie `token` (seteada por el backend
 * en `POST /login`). Si falta, redirige a /login con el parámetro `from` para que
 * el login pueda devolver al usuario a donde quería ir.
 *
 * Nota: esta verificación es solo de presencia de cookie, no de validez del JWT.
 * La validez real la verifica el backend en cada llamada autenticada. Si el token
 * expiró (1h), el backend devuelve 401 → ApiError lo captura → componente muestra
 * toast + redirige a /login. No necesitamos verificar el JWT aquí.
 */

const PROTECTED_ROUTES = [
  '/my-publications',
  '/favorites',
  '/messages',
  '/creator-profile-info-personal', // Se renombrará a /profile en una fase futura.
  '/publications/new',
];

// Rutas cuyo path dinámico requiere sesión, ej. /publications/[id]/edit.
const PROTECTED_PATTERNS = [/^\/publications\/[^/]+\/edit/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname));

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Excluye assets estáticos y el directorio de uploads del backend
  // para que el middleware no se ejecute en cada imagen/fuente.
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|uploads).*)'],
};
