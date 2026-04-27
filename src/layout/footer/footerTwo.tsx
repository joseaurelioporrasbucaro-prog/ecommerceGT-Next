import React from 'react';
import logoOne from "../../../public/assets/img/logo/oction-logo.png"
import logoTwo from "../../../public/assets/img/logo/oction-logo-bw.png"
import Link from 'next/link';
import Image from 'next/image';

const FooterTwo = () => {
  return (
    <>
      <footer className="footer2-bg">
            <div className="copyright-area copyright2-area">
                <div className="container c-container-1">
                    <div className="copyright2-inner">
                        <div className="row align-items-center">
                            <div className="col-lg-4 col-md-4 order-md-2">
                                <div className="footer-logo text-center">
                                    <Link className="logo-bb" href="/"><Image src={logoOne} alt="logo-img" /></Link>
                                    <Link className="logo-bw" href="/"><Image src={logoTwo} alt="logo-img" /></Link>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-4 order-md-1">
                                <div className="copyright-text copyright2-text text-center text-md-start">
                                    © Copyrighted & Designed by <Link href="https://themeforest.net/user/bdevs">BDevs</Link>
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