"use client";

import Link from 'next/link';
import React from 'react';
import { usePathname } from '@/i18n/navigation';
import { usePublicationCategories } from '@/hooks/api/useCatalogs';
import {
  getCategoryFallbackIcon,
} from '@/components/publications/publicationUtils';
import type { PublicationCategory } from '@/types/api';

interface PublicCategoriesSidebarProps {
  menuOpen2: boolean;
  setMenuOpen2: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Sidebar derecho cuando el usuario NO está logueado.
 * Muestra las categorías de publicaciones (Casa, Apartamento, Terreno, etc.)
 * + CTAs para iniciar sesión / registrarse.
 *
 * Reusa las clases `.sidebar-category-filter-wrapper` del scaffold:
 * en pantallas ≥1400px se queda visible permanentemente (right: 0).
 */
const PublicCategoriesSidebar = ({ menuOpen2, setMenuOpen2 }: PublicCategoriesSidebarProps) => {
  const pathname = usePathname();
  const categoriesQuery = usePublicationCategories();
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="fix">
      <div
        className={
          menuOpen2
            ? 'sidebar-category-filter-wrapper open'
            : 'sidebar-category-filter-wrapper'
        }
      >
        <div className="sidebar-category-filter public-categories-sidebar">
          {/* Botón cerrar (solo se ve en mobile) */}
          <div className="filter-widget-close d-xxl-none mb-15">
            <button
              type="button"
              className="public-close-btn"
              onClick={() => setMenuOpen2(false)}
              aria-label="Cerrar"
            >
              <i className="fal fa-times"></i>
            </button>
          </div>

          {/* CTA: invitar a registrarse */}
          <div className="public-auth-card mb-25">
            <div className="public-auth-icon">
              <i className="fal fa-user-plus"></i>
            </div>
            <div className="public-auth-text">
              ¿Quieres publicar o guardar favoritos?
            </div>
            <div className="public-auth-actions">
              <Link href="/login" className="btn-public-auth btn-public-primary">
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-public-auth btn-public-secondary">
                Registrarse
              </Link>
            </div>
          </div>

          {/* Categorías de propiedades */}
          <div className="filter-widget mb-20">
            <div className="filter-widget-content">
              <h3 className="filter-widget-title">Explorar por categoría</h3>
              <ul className="public-categories-list">
                <li>
                  <Link
                    href="/publications"
                    className={`public-category-link ${pathname === '/publications' ? 'is-active' : ''}`}
                  >
                    <i className="fal fa-th-large"></i>
                    <span>Todas</span>
                  </Link>
                </li>
                {categoriesQuery.isLoading && (
                  <li>
                    <div className="public-category-link is-loading">
                      <i className="fal fa-spinner fa-spin"></i>
                      <span>Cargando categorías...</span>
                    </div>
                  </li>
                )}
                {categories.map((cat: PublicationCategory) => (
                  <li key={cat.pubgen_id}>
                    <Link
                      href={`/publications?category=${encodeURIComponent(cat.pubgen_description)}`}
                      className="public-category-link"
                    >
                      <i className={`fal ${getCategoryFallbackIcon(cat.pubgen_description)}`}></i>
                      <span>{cat.pubgen_description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .public-categories-sidebar :global(.public-close-btn) {
          background: transparent;
          border: 0;
          font-size: 18px;
          cursor: pointer;
          color: inherit;
        }
        .public-categories-sidebar :global(.public-auth-card) {
          padding: 18px 14px;
          background: rgba(108, 92, 231, 0.08);
          border: 1px solid rgba(108, 92, 231, 0.2);
          border-radius: 12px;
          text-align: center;
        }
        .public-categories-sidebar :global(.public-auth-icon) {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(108, 92, 231, 0.18);
          color: var(--tp-theme-1, #6c5ce7);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-size: 22px;
        }
        .public-categories-sidebar :global(.public-auth-text) {
          font-size: 13px;
          opacity: 0.85;
          margin-bottom: 12px;
        }
        .public-categories-sidebar :global(.public-auth-actions) {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .public-categories-sidebar :global(.btn-public-auth) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none !important;
          transition: all 0.18s ease;
        }
        .public-categories-sidebar :global(.btn-public-primary) {
          background: var(--tp-theme-1, #6c5ce7);
          color: #fff !important;
          border: 1px solid var(--tp-theme-1, #6c5ce7);
        }
        .public-categories-sidebar :global(.btn-public-primary:hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
        }
        .public-categories-sidebar :global(.btn-public-secondary) {
          background: transparent;
          color: inherit !important;
          border: 1px solid rgba(128, 128, 128, 0.35);
        }
        .public-categories-sidebar :global(.btn-public-secondary:hover) {
          border-color: var(--tp-theme-1, #6c5ce7);
          color: var(--tp-theme-1, #6c5ce7) !important;
        }

        .public-categories-sidebar :global(.public-categories-list) {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .public-categories-sidebar :global(.public-category-link) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          background: transparent;
          color: inherit;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.18s ease;
        }
        .public-categories-sidebar :global(.public-category-link i) {
          width: 18px;
          font-size: 16px;
          flex-shrink: 0;
        }
        .public-categories-sidebar :global(.public-category-link:hover:not(.is-loading)) {
          background: rgba(108, 92, 231, 0.1);
          color: var(--tp-theme-1, #6c5ce7);
        }
        .public-categories-sidebar :global(.public-category-link.is-active) {
          background: var(--tp-theme-1, #6c5ce7);
          color: #fff !important;
        }
        .public-categories-sidebar :global(.public-category-link.is-loading) {
          opacity: 0.55;
          cursor: default;
        }
      `}</style>
    </div>
  );
};

export default PublicCategoriesSidebar;
