import React from "react";
import Link from "next/link";
import Image from "next/image";
import thumbOne from "../../../public/assets/img/wallet/oc-wallet-1.png"
import thumbTwo from "../../../public/assets/img/wallet/oc-wallet-2.png"
import thumbThree from "../../../public/assets/img/wallet/oc-wallet-3.png"
import thumbFour from "../../../public/assets/img/wallet/oc-wallet-4.png"
import thumbFive from "../../../public/assets/img/wallet/oc-wallet-5.png"


const WalletSection = ({ walletSpacing = "pt-110" }) => {
  const walletList = [
    {
      walletTitle: "User Friendly",
      walletImage: thumbOne,
    },
    {
      walletTitle: "Binance",
      walletImage: thumbTwo,
    },
    {
      walletTitle: "Formatic",
      walletImage: thumbThree,
    },
    {
      walletTitle: "Autherum",
      walletImage: thumbFour,
    },
    {
      walletTitle: "Coinbase",
      walletImage: thumbFive,
    },
  ];

  return (
    <section className={`oc-wallet-area ${walletSpacing && walletSpacing}`}>
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-12">
            <div className="section-title1 pos-rel text-center mb-40">
              <h2 className="section-main-title1">Set Your Wallet</h2>
              <p>Here are a few reasons why you should choose Oction</p>
            </div>
          </div>
        </div>
        <div className="row wow fadeInUp justify-content-center">
          <div className="col-xl-10">
            {walletList && (
              <div className="row">
                {walletList.map((WalletSection, num) => (
                  <div key={num} className="col-xl-2 wallet-col-width-20">
                    <Link href="/wallet-connect">
                      <div className="oc-wallet text-center mb-30">
                        <div className="oc-wallet-icon text-center">
                          <Image
                            width={100}
                            height={100}
                            style={{ width: "auto", height: "auto" }}
                            src={WalletSection.walletImage}
                            alt="img not found"
                          />
                        </div>
                        <h5 className="oc-wallet-title">
                          {WalletSection.walletTitle}
                        </h5>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletSection;
