import { useState } from 'react';
import styles from './contractaddress.module.scss';
import Image from 'next/image';

interface ContractAddressProps {
  contractAddress: string;
}

const ContractAddress = ({
  contractAddress
}: ContractAddressProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.addressInfo}>
        <div className={styles.addressWrapper}>
          <h2>CA | </h2>
          <p>{contractAddress}</p>
          <button 
            className={styles.copyButton}
            onClick={handleCopy}
            aria-label="주소 복사"
          >
            <Image
              src="/copybutton.svg"
              alt="복사"
              width={12}
              height={12}
              priority
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractAddress;
