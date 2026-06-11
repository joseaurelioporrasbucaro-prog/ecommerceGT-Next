import React from 'react';
import Link from 'next/link';
import KiosquiLogo from '@/components/common/KiosquiLogo';

const FooterTwo = () => {
  return (
    <>
      <footer className="footer2-bg">
            <div className="copyright-area copyright2-area">
                <div className="container c-container-1">
                    <div className="copyright2-inner">
                        <div className="row align-items-center">
                            <div className="col-lg-4 col-md-4 order-md-2">
                                {/* Handoff #3 §5 — logo transparente (swap por tema lo hace KiosquiLogo). */}
                                <div className="footer-logo text-center">
                                    <Link href="/"><KiosquiLogo height={52} /></Link>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-4 order-md-1">
                                <div className="copyright-text copyright2-text text-center text-md-start">
                                    © {new Date().getFullYear()} Kiosqui. Todos los derechos reservados.
                                </div>

                            </div>
                            <div className="col-lg-4 col-md-4 order-md-3">
                                <div className="social__links footer__social text-md-end text-center">
                                    <ul>
                                        <li><Link href="#"><i className="fab fa-facebook-f"></i></Link></li>
                                        <li><Link href="#"><i className="fab fa-twitter"></i></Link></li>
                                        <li><Link href="#"><i className="fab fa-instagram"></i></Link></li>
                                        <li><Link href="#"><i className="fab fa-linkedin-in"></i></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </>
  );
};

export default FooterTwo;