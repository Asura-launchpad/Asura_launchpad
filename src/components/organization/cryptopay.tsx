import { Button } from '../cell/button';
import React from 'react';
import styles from './cryptopay.module.scss';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

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
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleClick = () => {
    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }
    onPaymentComplete();
  };

  return (
    <div className={styles.container}>
      <div className={styles.paymentBox}>
        <div className={styles.header}>
          <div>Total Cost</div>
          <div className={styles.amount}>
            {amount.toFixed(2)}
            <span className={styles.symbol}>SYMBOL</span>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <Button 
            variant="primary"
            size="large"
            onClick={handleClick}
            icon={<img src="/snssvg/agenticon32x32.svg" alt="agent" width={32} height={32} />}
            fullWidth
            disabled={disabled}
          >
            {!isConnected ? 'CONNECT WALLET' : 'GENESIS AI AGENT'}
          </Button>
        </div>
      </div>
    </div>
  );
};