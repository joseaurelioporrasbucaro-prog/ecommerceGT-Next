'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

const LOCALES: Array<{ locale: AppLocale; label: string; title: string }> = [
  { locale: 'es', label: 'ES', title: 'Cambiar a español' },
  { locale: 'en', label: 'EN', title: 'Cambiar a inglés' },
];

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({
  className = '',
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const activeLocale: AppLocale = locale === 'en' ? 'en' : 'es';

  const changeLocale = (nextLocale: AppLocale) => {
    if (nextLocale === activeLocale || isPending) return;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div
      className={`i18n-language-switcher ${className}`.trim()}
      aria-label="Selector de idioma"
    >
      {LOCALES.map((item, index) => (
        <span className="i18n-language-option" key={item.locale}>
          {index > 0 && <span className="i18n-language-separator">|</span>}
          <button
            type="button"
            className={activeLocale === item.locale ? 'is-active' : ''}
            onClick={() => changeLocale(item.locale)}
            disabled={isPending}
            title={item.title}
            aria-pressed={activeLocale === item.locale}
          >
            {item.label}
          </button>
        </span>
      ))}

      <style jsx>{`
        .i18n-language-switcher {
          align-items: center;
          font-size: 15px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }

        .i18n-language-option {
          align-items: center;
          display: inline-flex;
        }

        .i18n-language-switcher :global(button) {
          background: transparent;
          border: 0;
          color: inherit;
          cursor: pointer;
          font: inherit;
          padding: 0;
          transition: color 0.2s ease, opacity 0.2s ease;
        }

        .i18n-language-switcher :global(button:hover),
        .i18n-language-switcher :global(button.is-active) {
          color: var(--tp-theme-1, #5a5af2);
        }

        .i18n-language-switcher :global(button:disabled) {
          cursor: wait;
          opacity: 0.72;
        }

        .i18n-language-separator {
          color: rgba(128, 128, 128, 0.55);
          display: inline-block;
          margin: 0 8px;
        }
      `}</style>
    </div>
  );
}
