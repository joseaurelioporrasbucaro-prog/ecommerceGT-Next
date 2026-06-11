'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Handoff #4 §1.5 — selector de idioma con el mismo lenguaje visual del theme
 * toggle: botón circular con el código del locale ACTIVO; al clickearlo cambia
 * al otro (solo hay es/en). La lógica de routing (next-intl) queda intacta.
 */
export default function LanguageSwitcher({
  className = '',
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeLocale: AppLocale = locale === 'en' ? 'en' : 'es';
  const nextLocale: AppLocale = activeLocale === 'es' ? 'en' : 'es';

  const toggleLocale = () => {
    if (isPending) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      type="button"
      className={`kq-lang-switch ${className}`.trim()}
      onClick={toggleLocale}
      disabled={isPending}
      title={nextLocale === 'en' ? 'Switch to English' : 'Cambiar a español'}
      aria-label="Cambiar idioma"
    >
      {activeLocale.toUpperCase()}

      <style jsx>{`
        .kq-lang-switch {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1.5px solid var(--border-strong, #d4c8b6);
          background: var(--surface, #fff);
          color: var(--fg-strong);
          cursor: pointer;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: all 0.15s;
        }
        .kq-lang-switch:hover {
          border-color: var(--lav-500);
          color: var(--lav-700);
        }
        :global([data-theme='dark']) .kq-lang-switch:hover {
          color: var(--lav-400);
        }
        .kq-lang-switch:disabled {
          opacity: 0.5;
          cursor: wait;
        }
      `}</style>
    </button>
  );
}
