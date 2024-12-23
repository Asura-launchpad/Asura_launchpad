// 필요한 라이브러리 및 컴포넌트 임포트
import { useState, useEffect } from 'react';
import styles from './createagent.module.scss';
import Input from '../../components/cell/input';
import ProjectImg from '../../components/cell/projectimg';
import { UtilityList } from '../../components/organization/utilitylist';
import { CryptoPay } from '@/components/organization/cryptopay';
import { BackButton } from '../../components/cell/button';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { createAgentPersona } from '@/api/agent';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { pumpDotFun } from '@/contract/pumpdotfun';

// 가격 상수 정의
const BASE_PRICE = 0.001;
const UTILITY_PRICES: { [key: number]: number } = {
  1: 0.3,  // TWITTER ACCESS
  2: 0.3,  // TWITTER POST 
  3: 0.3,  // TWITTER REPLIES
  4: 0.3,  // DISCORD ACCESS
  5: 0.3,  // TELEGRAM ACCESS
  6: 0,    // OVERDRIVE ACCESS (FREE)
  7: 0,    // OVERDRIVE POST (FREE)
  8: 0     // OVERDRIVE REPLIES (SOON)
};

// 타입 정의
interface AgentFormData {
  name: string;
  ticker: string;
  personality: string;
  age: number;
  manner: string;
  twitter: string;
  website: string;
  discord: string;
  overdrive: string;
  telegram: string;
  coverImage: File | string | null;
  profileImage: File | string | null;
  coverImageUrl?: string;
  profileImageUrl?: string;
  description?: string;
  selectedUtilities: number[];
  totalSupply: number;
  saleAmount: number;
  initMarketCap: number;
  endMarketCap: number;
}

interface FormErrors {
  name?: string;
  ticker?: string;
  personality?: string;
  manner?: string;
  description?: string;
  profileImage?: string;
  coverImage?: string;
  twitter?: string;
  website?: string;
  discord?: string;
  overdrive?: string;
  telegram?: string;
  age?: string;
}

interface TransactionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  txHash?: string;
}

// 메인 컴포넌트
const CreateAgentPage = () => {
  // 상태 관리
  const router = useRouter();
  const { publicKey } = useWallet();

  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    ticker: '',
    personality: '',
    age: 20,
    manner: '',
    twitter: '',
    website: '', 
    discord: '',
    overdrive: '',
    telegram: '',
    coverImage: null,
    profileImage: null,
    coverImageUrl: '',
    profileImageUrl: '',
    description: '',
    selectedUtilities: [],
    totalSupply: 1000000,
    saleAmount: 700000,
    initMarketCap: 10,
    endMarketCap: 100,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const [errors, setErrors] = useState<FormErrors>({});

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // 필수 필드 검증
    if (!formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    }
    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Token ticker is required';
    } else if (!/^[A-Z0-9]{3,8}$/.test(formData.ticker)) {
      newErrors.ticker = 'Ticker must be 3-8 uppercase letters or numbers';
    }
    if (!formData.personality.trim()) {
      newErrors.personality = 'Personality is required';
    }
    if (!formData.manner.trim()) {
      newErrors.manner = 'Manner is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    // URL 형식 검증
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (formData.twitter && !urlPattern.test(formData.twitter)) {
      newErrors.twitter = 'Invalid Twitter URL';
    }
    if (formData.website && !urlPattern.test(formData.website)) {
      newErrors.website = 'Invalid Website URL';
    }
    if (formData.discord && !urlPattern.test(formData.discord)) {
      newErrors.discord = 'Invalid Discord URL';
    }
    if (formData.overdrive && !urlPattern.test(formData.overdrive)) {
      newErrors.overdrive = 'Invalid Overdrive URL';
    }
    if (formData.telegram && !urlPattern.test(formData.telegram)) {
      newErrors.telegram = 'Invalid Telegram URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async () => {
    if (isSubmitting || !publicKey || !validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setTxState({ status: 'loading' });

      // Pump.fun 토큰 발행
      const result = await pumpDotFun.launchTokenBundle(
        [publicKey.toString()],  // 서명자 공개키 배열
        formData.name,
        formData.ticker.toUpperCase(), // 티커는 대문자로 변환
        formData.description || '',
        formData.profileImageUrl || '',
        {
          twitter: formData.twitter,
          telegram: formData.telegram,
          website: formData.website,
          initialAmount: formData.totalSupply,    // 총 발행량
          buyAmount: formData.saleAmount,         // 판매량
          slippage: 1000,                         // 10% (BPS)
          priorityFee: 0.0001                     // Jito 수수료
        }
      );

      // 에이전트 페르소나 생성
      await createAgentPersona({
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        personality: formData.personality,
        manner: formData.manner,
        twitter: formData.twitter,
        website: formData.website,
        discord: formData.discord,
        telegram: formData.telegram,
        overdrive: formData.overdrive,
        profileImage: formData.profileImage as File,
        coverImage: formData.coverImage as File,
        contract_address: result.mint,
        bonding_curve_address: result.signatures[0],  // 첫 번째 서명 사용
        utilities: formData.selectedUtilities.map(id => {
          switch(id) {
            case 1: case 2: case 3: return 'twitter';
            case 4: return 'discord'; 
            case 5: return 'telegram';
            case 6: case 7: case 8: return 'overdrive';
            default: return '';
          }
        }).filter(Boolean)
      });

      setTxState({ 
        status: 'success',
        txHash: result.signatures[0]
      });
      
      router.push(`/${result.mint}`);
    } catch (error: any) {
      console.error('Token launch error:', error);
      setTxState({ 
        status: 'error', 
        error: error.message || '토큰 발행 중 오류가 발생했습니다'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 이미지 변경 처리
  const handleImageChange = (type: 'cover' | 'profile', file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      [`${type}Image`]: file,
      [`${type}ImageUrl`]: imageUrl
    }));
  };

  // 총액 계산
  const calculateTotalAmount = (): number => {
    const utilityTotal = formData.selectedUtilities.reduce((sum, utilityId) => {
      return sum + (UTILITY_PRICES[utilityId] || 0);
    }, 0);
    
    return BASE_PRICE + utilityTotal;
  };

  // UI 렌더링
  return (
    <div className={styles.container}>
      <div className={styles.createform}>
        
        <div className={styles.headerContainer}>
          <div className={styles.backButtonContainer}>
            <BackButton onClick={() => window.history.back()}>
              BACK
            </BackButton>
          </div>
          <div className={styles.header}>
            <Image src="/agenticon.svg" alt="agent icon" width={24} height={24}/>
            <h1>Create Your Agent</h1>
          </div>
          <div className={styles.description}>
           In order to IP the Agent, it must be issued as an FT on overdive.xyz, independent of the corresponding NFT issuance.
          </div>
        </div>

        <div className={styles.formContainers}>
          <div className={styles.formContent}>
            <ProjectImg
              coverImage={formData.coverImageUrl || '/default_cover.png'}
              profileImage={formData.profileImageUrl || '/default_cover.png'}
              agentName={formData.name}
              description={formData.description}
              onCoverImageChange={(file) => handleImageChange('cover', file)}
              onProfileImageChange={(file) => handleImageChange('profile', file)}
            />
            <Input 
              type="longText"
              label="Description"
              placeholder="Write about your agent" 
              required={true}
              value={formData.description || ''}
              onChange={(value) => setFormData({...formData, description: value})}
              error={errors.description}
            />
            <UtilityList
              selectedIds={formData.selectedUtilities}
              onCardClick={(id) => {
                const currentSelected = formData.selectedUtilities;
                const newSelected = currentSelected.includes(id)
                  ? currentSelected.filter((selectedId: number) => selectedId !== id)
                  : [...currentSelected, id];
                setFormData({...formData, selectedUtilities: newSelected});
              }}
            />
          </div>
          
          <div className={styles.formContent}>
            <Input
              type="text"
              label="Agent name"
              placeholder="Agent name"
              required={true}
              value={formData.name}
              onChange={(value) => setFormData({...formData, name: value})}
              error={errors.name}
            />
            <Input 
              type="text"
              label="Token Ticker"
              placeholder="Agent name" 
              required={true}
              value={formData.ticker}
              onChange={(value) => setFormData({...formData, ticker: value})}
              error={errors.ticker}
            />
            <Input
              type="text" 
              label="Personality"
              placeholder="Kindfull"
              required={true}
              value={formData.personality}
              onChange={(value) => setFormData({...formData, personality: value})}
              error={errors.personality}
            />
            <Input
              type="number"
              label="Age"
              placeholder="20"
              required={true}
              value={formData.age}
              onChange={(value) => setFormData({...formData, age: value})}
              error={errors.age?.toString()}
              min={1}
              max={100}
            />
            <Input
              type="text"
              label="Ton G manner"
              placeholder="Kindfull"
              required={true}
              value={formData.manner}
              onChange={(value) => setFormData({...formData, manner: value})}
              error={errors.manner}
            />
            <Input
              type="iconText"
              label="Twitter Link"
              placeholder="Twitter Link"
              icon="/snssvg/twitter.svg"
              alt="twitter icon"
              value={formData.twitter}
              onChange={(value) => setFormData({...formData, twitter: value})}
              error={errors.twitter}
            />
            <Input
              type="iconText"
              label="Website Link"
              placeholder="Website Link"
              icon="/snssvg/website.svg" 
              alt="website icon"
              value={formData.website}
              onChange={(value) => setFormData({...formData, website: value})}
              error={errors.website}
            />
            <Input
              type="iconText"
              label="Discord Link"
              placeholder="Discord Link"
              icon="/snssvg/discord.svg"
              alt="discord icon" 
              value={formData.discord}
              onChange={(value) => setFormData({...formData, discord: value})}
              error={errors.discord}
            />
            <Input
              type="iconText"
              label="Overdrive Link"
              placeholder="Overdrive Link"
              icon="/snssvg/overdive.svg"
              alt="overdrive icon"
              value={formData.overdrive}
              onChange={(value) => setFormData({...formData, overdrive: value})}
              error={errors.overdrive}
            />
            <Input
              type="iconText"
              label="Telegram Link"
              placeholder="Telegram Link"
              icon="/snssvg/telegram.svg"
              alt="telegram icon"
              value={formData.telegram}
              onChange={(value) => setFormData({...formData, telegram: value})}
              error={errors.telegram}
            />
            
          </div>
          <div className={styles.paymentContainer}>
            {txState.status === 'loading' && (
              <div className={styles.loadingOverlay}>
                <span>Creating token...</span>
              </div>
            )}
            
            {txState.status === 'success' && (
              <div className={styles.successMessage}>
                <h3>Token created successfully!</h3>
                <p>Transaction hash: {txState.txHash}</p>
                <p>Redirecting to agent page...</p>
              </div>
            )}

            {txState.status === 'error' && (
              <div className={styles.errorMessage}>
                <h3>Error occurred</h3>
                <p>{txState.error}</p>
              </div>
            )}

            {!publicKey ? (
              <WalletMultiButton />
            ) : (
              <CryptoPay
                amount={calculateTotalAmount()}
                onPaymentComplete={handleSubmit}
                onPaymentCancel={() => {
                  console.log('결제가 취소되었습니다');
                  setTxState({ status: 'idle' });
                }}
                disabled={isSubmitting || txState.status === 'loading'}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CreateAgentPage;