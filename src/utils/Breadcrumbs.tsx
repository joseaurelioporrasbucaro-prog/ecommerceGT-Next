import Link from 'next/link';
import React from 'react';

interface breadCrumbType {
   breadcrumbTitle: string;
   breadcrumbSubTitle: string;
}

// ============================================================================
// Fase 24 (Aurelio 2026-06-09) — Experimento: ocultar breadcrumb global.
//
// El breadcrumb ocupa mucho alto vertical (~120-150px) y obliga al usuario a
// hacer scroll para ver el contenido principal en cada página. Lo
// desactivamos con un flag global para evaluar el resultado visual sin tener
// que ir a remover el componente de cada página que lo monta.
//
// Si queremos volver: cambiar SHOW_BREADCRUMBS a `true`. El JSX del
// componente sigue intacto debajo del early-return, así que el revert es
// instantáneo y no requiere rehacer el código.
//
// Si después de la evaluación decidimos quitarlo DEFINITIVAMENTE, conviene
// borrar los `<Breadcrumbs ... />` de cada página que lo monta — actualmente
// son ~30 archivos — para evitar el "ruido" de props que ya no se usan.
// Hacer un commit aparte con ese cleanup para mantener el diff manejable.
// ============================================================================
const SHOW_BREADCRUMBS = false;

const Breadcrumbs = ({ breadcrumbTitle, breadcrumbSubTitle }: breadCrumbType) => {
   if (!SHOW_BREADCRUMBS) return null;
   return (
      <section className="page-title-area">
         <div className="container">
            <div className="row wow fadeInUp">
               <div className="col-lg-12">
                  <div className="page-title">
                     <h2 className="breadcrumb-title mb-10">{breadcrumbTitle}</h2>
                     <div className="breadcrumb-menu">
                        <nav className="breadcrumb-trail breadcrumbs">
                           <ul className="trail-items">
                              <li className="trail-item trail-begin"><Link href="/">Home</Link></li>
                              <li className="trail-item trail-end"><span>{breadcrumbSubTitle}</span></li>
                           </ul>
                        </nav>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default Breadcrumbs;
