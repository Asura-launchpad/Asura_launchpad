import { useState, useEffect } from 'react';
import styles from './progressbar.module.scss';
import { ethers } from 'ethers';
import { BondingCurveContract } from '../../../contract/bondingCurve';
import { BondingCurveState } from '../../../contract/BondingCurveState';
import { useAccount } from 'wagmi';

const ProgressBar = ({ bondingAddress }: { bondingAddress: string }) => {
  const { isConnected } = useAccount();
  const [state, setState] = useState({
    progress: 0,
    total: 800000000
  });

  useEffect(() => {
    if (!bondingAddress || !ethers.utils.isAddress(bondingAddress)) {
      console.error('유효하지 않은 컨트랙트 주소:', bondingAddress);
      return;
    }

    let provider;
    if (typeof window !== 'undefined' && window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } else {
      provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
    }

    const bondingContract = new BondingCurveContract(bondingAddress, provider);
    const bondingState = new BondingCurveState(bondingContract);

    const updateProgress = async () => {
      try {
        const progress = await bondingState.getBondingCurveProgress();
        setState(progress);
      } catch (error) {
        console.error('본딩커브 상태 조회 실패:', error);
      }
    };

    if (isConnected) {
      updateProgress();
    }

    const handleUpdateProgress = () => {
      updateProgress();
    };

    window.addEventListener('updateProgress', handleUpdateProgress);

    if (window.ethereum) {
      bondingContract.onSwap(updateProgress);
    }

    return () => {
      window.removeEventListener('updateProgress', handleUpdateProgress);
      if (window.ethereum) {
        bondingContract.removeSwapListener(updateProgress);
      }
    };
  }, [bondingAddress, isConnected]);

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