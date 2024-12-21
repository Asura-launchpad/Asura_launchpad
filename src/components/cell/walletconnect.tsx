import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from './WalletConnect.module.scss';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export const CustomConnectButton = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted: rainbowKitMounted,
      }) => {
        const ready = mounted && rainbowKitMounted;
        const connected = ready && account && chain;

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <div className={styles.connectButtonWrapper}>                   
                    <button onClick={openConnectModal} type="button" className={styles.connectButton}>
                      <span className={styles.walletIcons}>
                        <Image src="/walleticonbg.svg" alt="지갑 아이콘" width={32} height={32}/>
                      </span> 
                      <div className={styles.walletwraper}>
                        <div className={styles.premiumAccess}>READY FOR THE DIVE?</div>
                        <div className={styles.cryptoWallet}> PLEASE CONNECT WALLET </div>
                      </div>
                      <span className={styles.questionIcon}>?</span>
                    </button>
                  </div>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    잘못된 네트워크
                  </button>
                );
              }

              return (
                <div className={styles.walletContainer}>
                  <div className={styles.walletInfo}>
                    <span className={styles.walletIcon}>
                      <Image src="/walleticonbg.svg" alt="지갑 아이콘" width={32} height={32}/>
                    </span>
                    <div className={styles.walletDetails}>
                      <div className={styles.walletwrapers}>
                        <span className={styles.registrationDate}>등록일자 2024.09.05</span>
                        <span className={styles.changeNotice}>7일후 변경가능</span>
                      </div>
                      <div className={styles.walletAddress}>{account.address}</div>
                    </div>
                    <button onClick={openAccountModal} type="button" className={styles.editButton}>
                      <Image src="/reconnect.svg" alt="재연결 아이콘" width={24} height={24}/>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};