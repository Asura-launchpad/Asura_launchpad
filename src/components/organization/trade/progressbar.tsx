import { useState, useEffect } from 'react';
import styles from './progressbar.module.scss';
import { useWallet } from '@solana/wallet-adapter-react';
import { pumpDotFun } from '@/contract/pumpdotfun';

const ProgressBar = ({ bondingAddress }: { bondingAddress: string }) => {
  const { publicKey } = useWallet();
  const [state, setState] = useState({
    progress: 0,
    total: 800000000
  });

  useEffect(() => {
    if (!bondingAddress) {
      console.error('유효하지 않은 컨트랙트 주소:', bondingAddress);
      return;
    }

    const updateProgress = async () => {
      try {
        const tokenInfo = await pumpDotFun.getTokenInfo(bondingAddress);
        setState({
          progress: tokenInfo.currentSupply || 0,
          total: tokenInfo.maxSupply || 800000000
        });
      } catch (error) {
        console.error('본딩커브 상태 조회 실패:', error);
      }
    };

    updateProgress();

    const handleUpdateProgress = () => {
      updateProgress();
    };

    window.addEventListener('updateProgress', handleUpdateProgress);

    // 10초마다 업데이트
    const interval = setInterval(updateProgress, 10000);

    return () => {
      window.removeEventListener('updateProgress', handleUpdateProgress);
      clearInterval(interval);
    };
  }, [bondingAddress]);

  const percentage = (state.progress / state.total) * 100;

  return (
    <div className={styles.progressBarContainer}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>READY FOR DIVE TO DEX</span>
          <span className={styles.subtitle}>BONDING CURVE PROCESS</span>
        </div>
        <div className={styles.info}>?</div>
      </div>
      
      <div className={styles.barWrapper}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progress}
            style={{ width: `${percentage}%` }}
          >
            <div className={styles.highlight} />
          </div>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.amount}>
            <span>{state.progress.toLocaleString()}</span>
            <span> / </span>
            <span className={styles.totalamount}>{state.total.toLocaleString()}</span>
          </div>
          <span className={styles.percentage}>{percentage.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;