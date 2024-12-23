import { Button } from '@/components/cell/button';
import React from 'react';
import styles from './cryptopay.module.scss';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';

interface PaymentProps {
  amount: number;
  onPaymentComplete: () => void;
  onPaymentCancel: () => void;
  disabled?: boolean;
}

export const CryptoPay: React.FC<PaymentProps> = ({
  amount,
  onPaymentComplete,
  onPaymentCancel,
  disabled
}) => {
  const { connected } = useWallet();

  return (
    <div className={styles.container}>
      <div className={styles.paymentBox}>
        <div className={styles.header}>
          <div>Total Cost</div>
          <div className={styles.amount}>
            {amount.toFixed(2)}
            <span className={styles.symbol}>SOL</span>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          {!connected ? (
            <WalletMultiButton className={styles.connectButton}>
              <span className={styles.walletIcons}>
                <Image src="/snssvg/agenticon32x32.svg" alt="agent" width={32} height={32} />
              </span>
              <div>CONNECT WALLET</div>
            </WalletMultiButton>
          ) : (
            <Button 
              variant="primary"
              size="large"
              onClick={onPaymentComplete}
              icon={<img src="/snssvg/agenticon32x32.svg" alt="agent" width={32} height={32} />}
              fullWidth
              disabled={disabled}
            >
              GENESIS AI AGENT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};