import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './tokentrendlist.module.scss';
import { useRouter } from 'next/router';
import { getTrendingTokens } from '../../../api/agent';

interface TrendItem {
  rank: number;
  name: string;
  ticker: string;
  price: number;
  contractAddress: string;
  profile_image: string;
}

interface TokenTrendListProps {
  items: TrendItem[];
}

const TokenTrendList: React.FC<TokenTrendListProps> = ({ items }) => {
  const router = useRouter();
  const [trendingTokens, setTrendingTokens] = useState<TrendItem[]>(items);

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const response = await getTrendingTokens();
        const formattedTokens: TrendItem[] = response.results
          .slice(0, 10) // 상위 10개만 가져오기
          .map((item: any, index: number) => ({
            rank: index + 1, // 맵 순서대로 1~10 순위 부여
            name: item.persona.name,
            ticker: item.agent_token.token_ticker,
            price: item.agent_token.price || 0,
            contractAddress: item.agent_token.contract_address,
            profile_image: item.persona.profile_image || '/default_cover.png'
          }));
        setTrendingTokens(formattedTokens);
      } catch (error) {
        console.error('트렌딩 토큰 조회 실패:', error);
      }
    };

    fetchTrendingTokens();
  }, []);

  const handleItemClick = (contractAddress: string) => {
    router.push(`/${contractAddress}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.trendListContainer}>
        <div className={styles.trendHeader}>
          <Image 
            src="/trendicon_yellow.svg"
            alt="Trend Icon"
            width={16}
            height={16}
          />
          <span className={styles.trendTitle}>TREND</span>
        </div>
        {trendingTokens.map((item, index) => (
          <div 
            key={index} 
            className={styles.trendItem}
            onClick={() => handleItemClick(item.contractAddress)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.rank}>{item.rank}</div>
            <div className={styles.nameContainer}>
              <Image
                src={item.profile_image}
                alt={`${item.name} profile`}
                width={24}
                height={24}
                className={styles.circle}
              />
              <div className={styles.nameInfo}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.ticker}>/{item.ticker}</span>
              </div>
            </div>
            <div className={styles.price}>${item.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenTrendList;
