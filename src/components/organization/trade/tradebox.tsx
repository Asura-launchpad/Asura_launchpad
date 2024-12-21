import { useState, useEffect } from 'react';
import styles from './tradebox.module.scss';
import Image from 'next/image';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import BONDING_CURVE_ABI from '../../../abi/bonding_curve_abi.json';
import { BondingCurveContract } from '../../../contract/bondingCurve';

// 토큰 정보를 위한 인터페이스 정의
interface TokenInfo {
  symbol: string;    // 토큰 심볼 (예: SOL, KAIA)
  imageUrl: string;  // 토큰 이미지 URL
}

// TradeBox 컴포넌트의 props 인터페이스 정의
interface TradeBoxProps {
  onTrade: (type: 'buy' | 'sell', amount: number) => void;  // 거래 실행 콜백
  contractAddress: string;  // 스마트 컨트랙트 주소
  price?: number;          // 현재 가격
  volume?: number;         // 거래량
  change?: number;         // 가격 변동률
  mainToken: TokenInfo;    // 메인 토큰 정보 (예: SOL)
  memeToken: TokenInfo;    // 밈 토큰 정보 (예: KAIA)
}

// TradeBox 메인 컴포넌트
const TradeBox = ({ 
  onTrade, 
  contractAddress, 
  price = 0, 
  volume = 0, 
  change = 0,
  mainToken,
  memeToken
}: TradeBoxProps) => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // 상태 관리
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');  // 거래 타입 (매수/매도)
  const [amount, setAmount] = useState<string>('0.0000');             // 거래 수량
  const [estimatedTCK, setEstimatedTCK] = useState<string>('0.0000'); // 예상 토큰 수량
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 지갑 연결 상태 변경 감지
  useEffect(() => {
    if (isConnected) {
      initializeContract();
      setError(null); // 에러 메시지 초기화
    } else {
      setContract(null);
      setAmount('0.0000');
      setEstimatedTCK('0.0000');
      setError(null);
    }
  }, [isConnected, contractAddress]);

  const initializeContract = async () => {
    if (typeof window.ethereum !== 'undefined' && contractAddress) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bondingContract = new ethers.Contract(
          contractAddress,
          BONDING_CURVE_ABI,
          signer
        );
        setContract(bondingContract);
        
        // 토큰 정보 및 거래 가능 여부 확인
        const [tokenInfo] = await Promise.all([
          bondingContract.tokenInfo(),
        ]);
      } catch (error) {
        console.error('컨트랙트 초기화 실패:', error);
        setError('컨트랙트 연결에 실패했습니다');
      }
    }
  };

  // 지갑 연결 체크 함수
  const checkWalletConnection = () => {
    if (!isConnected) {
      openConnectModal?.();
      setError(null); // 연결 모달 열 때 에러 메시지 제거
      return false;
    }
    return true;
  };

  // 거래 타입 변경 핸들러
  const handleTypeChange = (type: 'buy' | 'sell') => {
    setTradeType(type);
    setAmount('0.0000');
    setEstimatedTCK('0.0000');
  };

  // 수량 변경 핸들러
  const handleAmountChange = async (value: string) => {
    setAmount(value);
    setError(null);
    
    if (!isConnected) {
      setEstimatedTCK('0.0000');
      return;
    }
    
    if (value !== '' && parseFloat(value) > 0) {
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const bondingCurve = new BondingCurveContract(contractAddress, provider);
        const { estimatedAmount } = await bondingCurve.quoteSwapAmount(value, tradeType === 'buy');
        setEstimatedTCK(estimatedAmount);
      } catch (error) {
        console.error('예상 수량 계산 실패:', error);
        setEstimatedTCK('0.0000');
      } finally {
        setLoading(false);
      }
    } else {
      setEstimatedTCK('0.0000');
    }
  };

  // 빠른 수량 선택 핸들러
  const handleQuickAmount = async (value: number) => {
    if (!checkWalletConnection()) return;

    if (tradeType === 'buy') {
      const newAmount = (parseFloat(amount) + value).toFixed(4);
      handleAmountChange(newAmount);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      const bondingCurve = new BondingCurveContract(contractAddress, provider);
      const tokenInfo = await bondingCurve.getTokenInfo();
      
      const tokenContract = new ethers.Contract(
        tokenInfo.tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        signer
      );
      
      const balance = await tokenContract.balanceOf(address);
      const balanceInEther = ethers.utils.formatEther(balance);
      
      const sellAmount = (parseFloat(balanceInEther) * (value / 100)).toFixed(4);
      handleAmountChange(sellAmount);
      
      console.log('판매 정보:', {
        보유량: balanceInEther,
        판매비율: value + '%',
        판매수량: sellAmount
      });
    } catch (error) {
      console.error('보유량 확인 실패:', error);
      setError('보유량 확인에 실패했습니다');
    }
  };

  // 리셋 핸들러
  const handleReset = () => {
    setAmount('0.0000');
    setEstimatedTCK('0.0000');
  };

  // 거래 실행 핸들러
  const handleTrade = async () => {
    if (!checkWalletConnection()) return;

    try {
      if (!contractAddress || !amount || parseFloat(amount) <= 0) {
        setError('유효한 수량을 입력해주세요');
        return;
      }

      setLoading(true);
      setError(null);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const bondingCurve = new BondingCurveContract(contractAddress, provider);
      
      let receipt;
      if (tradeType === 'buy') {
        receipt = await bondingCurve.buyTokens(amount);
      } else {
        receipt = await bondingCurve.sellTokens(amount);
      }

      setAmount('0.0000');
      setEstimatedTCK('0.0000');
      onTrade(tradeType, parseFloat(amount));

      window.dispatchEvent(new Event('updateProgress'));

    } catch (error: any) {
      if (error.code === 4001) {
        setError(null);
      } else {
        console.error('거래 실패:', error);
        setError(error.message || '거래 처리 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tradeBox}>
      {/* 거래 타입 선택 섹션 */}
      <div className={styles.tradeTypeSelector}>
        <div 
          className={`${styles.typeButton} ${tradeType === 'buy' ? styles.active : ''}`}
          onClick={() => handleTypeChange('buy')}
          data-type="buy"
        >
          BUY
        </div>
        <div 
          className={`${styles.typeButton} ${tradeType === 'sell' ? styles.active : ''}`}
          onClick={() => handleTypeChange('sell')}
          data-type="sell"
        >
          SELL
        </div>
      </div>
      <div className={styles.tradeContent}>
        {/* 수량 입력 섹션 */}
        <div className={styles.inputSection}>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={styles.amountInput}
          />
          <div className={styles.currencyWrapper}>
            <Image 
              src={tradeType === 'buy' ? mainToken.imageUrl : memeToken.imageUrl}
              alt={tradeType === 'buy' ? mainToken.symbol : memeToken.symbol}
              width={20}
              height={20}
            />
            <span className={styles.currency}>
              {tradeType === 'buy' ? mainToken.symbol : memeToken.symbol}
            </span>
          </div>
        </div>

        {/* 빠른 수량 선택 버튼 */}
        <div className={styles.quickAmountButtons}>
          <button onClick={handleReset}>RESET</button>
          {tradeType === 'buy' ? (
            <>
              <button onClick={() => handleQuickAmount(0.1)}>0.1</button>
              <button onClick={() => handleQuickAmount(1)}>1.0</button>
              <button onClick={() => handleQuickAmount(10)}>10</button>
            </>
          ) : (
            <>
              <button onClick={() => handleQuickAmount(25)}>25%</button>
              <button onClick={() => handleQuickAmount(50)}>50%</button>
              <button onClick={() => handleQuickAmount(100)}>100%</button>
            </>
          )}
        </div>
        <div className={styles.crossline}></div>
        {/* 예상 수량 표시 섹션 */}
        <div className={styles.estimatedAmounts}>
          <span>{estimatedTCK}</span>
          <div className={styles.currencyWrapperbottom}>
            <Image 
              src={tradeType === 'buy' ? memeToken.imageUrl : mainToken.imageUrl}
              alt={tradeType === 'buy' ? memeToken.symbol : mainToken.symbol}
              width={20}
              height={20}
            />
            <span className={styles.currency}>
              {tradeType === 'buy' ? memeToken.symbol : mainToken.symbol}
            </span>
          </div>
        </div>

        {/* 거래 실행 버튼 */}
        <button 
          className={styles.tradeButton}
          onClick={handleTrade}
          disabled={loading || !!error}
          data-type={tradeType}
        >
          {loading ? 'TX Loading...' : 
           !isConnected ? 'CONNECT WALLET' :
           tradeType === 'buy' ? 'BUY THE DEEP' : 'SELL THE TOP'}
        </button>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default TradeBox;