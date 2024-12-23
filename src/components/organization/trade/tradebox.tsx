import { useState } from 'react';
import styles from './tradebox.module.scss';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { pumpDotFun } from '@/contract/pumpdotfun';

interface TokenInfo {
  symbol: string;
  imageUrl: string;
}

interface TradeBoxProps {
  contractAddress: string;
  price?: number;
  volume?: number;
  change?: number;
  mainToken: TokenInfo;
  memeToken: TokenInfo;
}

const TradeBox = ({
  contractAddress,
  price = 0,
  volume = 0,
  change = 0,
  mainToken,
  memeToken
}: TradeBoxProps) => {
  const { publicKey, signTransaction } = useWallet();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('0.0000');
  const [estimatedTCK, setEstimatedTCK] = useState<string>('0.0000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateEstimate = async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setEstimatedTCK('0.0000');
      return;
    }

    try {
      const quote = await pumpDotFun.getTradeQuote(
        contractAddress,
        tradeType,
        parseFloat(inputAmount),
        true
      );
      setEstimatedTCK(quote.estimatedAmount.toFixed(4));
    } catch (error) {
      console.error('Quote error:', error);
      setEstimatedTCK('0.0000');
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(null);
    calculateEstimate(value);
  };

  const handleQuickAmount = async (value: number) => {
    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    if (tradeType === 'buy') {
      const newAmount = value.toFixed(4);
      handleAmountChange(newAmount);
      return;
    }

    try {
      const balance = await pumpDotFun.getTokenBalance(contractAddress, publicKey.toString());
      const sellAmount = (balance * (value / 100)).toFixed(4);
      handleAmountChange(sellAmount);
    } catch (error) {
      console.error('Balance check failed:', error);
      setError('Failed to check balance');
    }
  };

  const handleTrade = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await pumpDotFun.createTradeTransaction(
        publicKey.toString(),
        contractAddress,
        tradeType,
        parseFloat(amount),
        {
          denominatedInSol: true,
          slippage: 5,
          priorityFee: 0.00001,
          pool: 'pump'
        }
      );

      const signedTx = await signTransaction(tx);
      const signature = await pumpDotFun.sendTransaction(signedTx);

      console.log("Transaction successful:", signature);
      setAmount('0.0000');
      setEstimatedTCK('0.0000');
      
      window.dispatchEvent(new Event('updateProgress'));
    } catch (error: any) {
      console.error('Trade error:', error);
      setError(error.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tradeBox}>
      <div className={styles.tradeTypeSelector}>
        <div 
          className={`${styles.typeButton} ${tradeType === 'buy' ? styles.active : ''}`}
          onClick={() => setTradeType('buy')}
        >
          BUY
        </div>
        <div 
          className={`${styles.typeButton} ${tradeType === 'sell' ? styles.active : ''}`}
          onClick={() => setTradeType('sell')}
        >
          SELL
        </div>
      </div>

      <div className={styles.tradeContent}>
        <div className={styles.inputSection}>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={styles.amountInput}
            disabled={loading}
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

        <div className={styles.quickAmountButtons}>
          <button onClick={() => handleAmountChange('0.0000')}>RESET</button>
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

        {!publicKey ? (
          <WalletMultiButton className={styles.tradeButton} />
        ) : (
          <button 
            className={styles.tradeButton}
            onClick={handleTrade}
            disabled={loading || !!error}
            data-type={tradeType}
          >
            {loading ? 'TX Loading...' : 
             tradeType === 'buy' ? 'BUY THE DEEP' : 'SELL THE TOP'}
          </button>
        )}
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