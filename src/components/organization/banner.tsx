import TrendCard from '../cell/trendcard';
import styles from './banner.module.scss';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getTrendingTokens } from '../../api/agent';
import { useState, useEffect } from 'react';





const Banner = () => {
  const router = useRouter();
  const [trendItems, setTrendItems] = useState<{
    title: string;
    price: number;
    totalPrice: number;
    percentage: number;
    rank: number;
    imageUrl: string;
    contractAddress: string;
  }[]>([]);

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const response = await getTrendingTokens();
        const mappedItems = response.results.slice(0, 4).map((item, index) => ({
          title: item.persona.name,
          price: item.agent_token.price || 0,
          totalPrice: item.agent_token.market_cap || 0,
          percentage: item.agent_token.volume_24h || 0,
          rank: index + 1,
          imageUrl: item.persona.profile_image || "/default_cover.png",
          contractAddress: item.agent_token.contract_address
        }));
        setTrendItems(mappedItems);
      } catch (error) {
        console.error('Failed to fetch trending tokens:', error);
      }
    };

    fetchTrendingTokens();
  }, []);

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.titleWrapper}>
        <Image 
          src="/trendicon.svg" 
          alt="trend icon" 
          width={18} 
          height={18} 
        />
        TOP DIVERS | BONDING CURVE LIVE
      </div>
      
      <div className={styles.bannerWrapper}>
        {trendItems.map((item, index) => (
          <div 
            key={index} 
            className={styles.bannerItem}
          >
            <TrendCard {...item} />
          </div>
        ))}
      </div>
      <div className={styles.createButton}>
        <div className={styles.buttonWrapper} onClick={() => router.push('/create')}>
          <Image src="/+icon.svg" alt="Create A.I Agent" width={14} height={14} />
          <span>Create A.I Agent</span>
        </div>
      </div>

    </div>
  );
};

export default Banner;
