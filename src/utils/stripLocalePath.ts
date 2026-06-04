export function stripLocalePath(pathname: string | null | undefined) {
  if (!pathname) return pathname;

  return pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
}
