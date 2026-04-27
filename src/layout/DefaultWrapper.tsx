//@refresh
"use client";
import React, { useEffect } from "react";
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}
import { usePathname } from "next/navigation";
import HeaderOne from "./header/HeaderOne";
import Footer from "./footer/Footer";
import FooterTwo from "../layout/footer/footerTwo";
import HeaderTwo from "./header/HeaderTwo";
import { ThemeProvider } from "next-themes";
import BacktoTop from "@/utils/BacktoTop";
import useLoading from "@/hooks/useLoading";
import { animationCreate } from "@/utils/utils";
import Preloader from "@/utils/Preloader";
interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const pathName = usePathname();
  const getHeaderStatic = (pathname: string) => {
    switch (pathname) {
      case "/":
        return "oc-transparent-header";
      case "/home-two":
        return "oc-transparent-header";
      default:
        return "";
    }
  };
  const HeaderStatic = getHeaderStatic(pathName);
  const isLoading = useLoading(true, 100);
  useEffect(() => {
    setTimeout(() => {
      animationCreate();
    }, 2000);
  }, []);

  return (
    <>
     
     {
      isLoading ?
      <>
      <Preloader/>
      </>
      :
      <>
       <ThemeProvider defaultTheme="dark">
        <BacktoTop/>
        {(() => {
          switch (pathName) {
            case "/home-three":
              return <HeaderTwo />;

            default:
              return <HeaderOne HeaderStatic={HeaderStatic} />;
          }
        })()}
        {children}

        {(() => {
          switch (pathName) {
            case "/home-three":
              return <FooterTwo />;

            default:
              return <Footer />;
          }
        })()}
      </ThemeProvider>
      </>
     }
    </>
  );
};

export default Wrapper;
