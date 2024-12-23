import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './WalletConnect.module.scss';
import Image from 'next/image';

require('@solana/wallet-adapter-react-ui/styles.css');

export const CustomConnectButton: FC = () => {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!connected) {
    return (
      <div className={styles.connectButtonWrapper}>
        <WalletMultiButton className={styles.connectButton}>
          <span className={styles.walletIcons}>
            <Image src="/walleticonbg.svg" alt="지갑 아이콘" width={32} height={32}/>
          </span>
          <div className={styles.walletwraper}>
            <div className={styles.premiumAccess}>READY FOR THE DIVE?</div>
            <div className={styles.cryptoWallet}>PLEASE CONNECT WALLET</div>
          </div>
          <span className={styles.questionIcon}>?</span>
        </WalletMultiButton>
      </div>
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
          <div className={styles.walletAddress}>
            {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
          </div>
        </div>
        <WalletMultiButton className={styles.editButton}>
          <Image src="/reconnect.svg" alt="재연결 아이콘" width={24} height={24}/>
        </WalletMultiButton>
      </div>
    </div>
  );
};