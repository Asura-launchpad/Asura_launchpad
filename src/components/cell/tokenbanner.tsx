import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './tokenbanner.module.scss';
import { getTrendingTokens } from '../../api/agent';
import { useRouter } from 'next/router';

interface TokenItem {
  Rank: number;
  profileImg: string;
  name: string;
  change: string;
  contractAddress: string;
}

const TokenBanner: React.FC = () => {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenItem[]>([]);

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const response = await getTrendingTokens();
        const formattedTokens: TokenItem[] = response.results
          .slice(0, 20)
          .map((item: any, index: number) => ({
            Rank: index + 1,
            name: item.persona.name,
            change: `${item.agent_token.volume_24h > 0 ? '+' : ''}${item.agent_token.volume_24h}%`,
            profileImg: item.persona.profile_image || '/default_cover.png',
            contractAddress: item.agent_token.contract_address
          }));
        setTokens(formattedTokens);
      } catch (error) {
        console.error('트렌딩 토큰 조회 실패:', error);
      }
    };

    fetchTrendingTokens();
  }, []);

  const handleTokenClick = (contractAddress: string) => {
    router.push(`/${contractAddress}`);
  };

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.trendAgentTitle}>
        <div className={styles.titleFlex}>
          <Image 
            src="/trendicon.svg" 
            alt="trend icon" 
            width={18} 
            height={18} 
            style={{ marginRight: '4px' }}
          />
          TREND AGENT
        </div>
        <div className={styles.trendleft}>
          <Image src="/tbleft.svg" alt="trend left" width={18} height={18}/>
        </div>
      </div>

      <div className={styles.bannerRotate}>
        {/* 첫 번째 세트 */}
        {tokens.map((token) => (
          <div 
            key={token.Rank} 
            className={styles.tokenItem}
            onClick={() => handleTokenClick(token.contractAddress)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.tokenrank}>#{token.Rank}</span>
            <Image 
              src={token.profileImg} 
              alt={token.name} 
              width={24} 
              height={24} 
              style={{ borderRadius: '50%', marginRight: '8px' }} 
            />
            <span className={styles.tokenName}>{token.name}</span>
            <span className={`${styles.tokenChange} ${token.change.startsWith('-') ? styles.negative : ''}`}>{token.change}</span>
          </div>
        ))}
        {/* 두 번째 세트 (끊김 없는 연결을 위한 복제) */}
        {tokens.map((token) => (
          <div 
            key={`duplicate-${token.Rank}`} 
            className={styles.tokenItem}
            onClick={() => handleTokenClick(token.contractAddress)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.tokenrank}>#{token.Rank}</span>
            <Image 
              src={token.profileImg} 
              alt={token.name} 
              width={24} 
              height={24} 
              style={{ borderRadius: '50%', marginRight: '8px' }} 
            />
            <span className={styles.tokenName}>{token.name}</span>
            <span className={`${styles.tokenChange} ${token.change.startsWith('-') ? styles.negative : ''}`}>{token.change}</span>
          </div>
        ))}
      </div>
      <div className={styles.trendhour}>
        <div className={styles.trendright}>
          <Image src="/tbright.svg" alt="trend left" width={18} height={60}/>
        </div>
        <div className={styles.hourText}>24 HOUR</div>
      </div>
    </div>
  );
};

export default TokenBanner;