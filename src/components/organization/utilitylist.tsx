import React from 'react';
import UtilityCard from '../cell/utilitycard';
import styles from './utilitylist.module.scss';

// 유틸리티 데이터 인터페이스 정의
export interface UtilityData {
  id: number;
  category: string;
  title: string;
  price: string;
  logoUrl: string;
}

// UtilityList 컴포넌트 Props 인터페이스 정의 
interface UtilityListProps {
  data?: UtilityData[];
  selectedIds?: number[];
  onCardClick?: (id: number) => void;
}

// UtilityList 컴포넌트
export const UtilityList: React.FC<UtilityListProps> = ({
  data = defaultUtilityData,
  selectedIds = [],
  onCardClick
}) => {
  return (
    <>
      <div className={styles.utilityTitle}>
        <h1>Utility</h1>
      </div>
      <div className={styles.cardGrid}>
        {data.map((utility) => (
          <div key={utility.id} className={styles.cardWrapper}>
            <UtilityCard
              category={utility.category}
              title={utility.title}
              price={utility.price}
              logoUrl={utility.logoUrl}
              isSelected={selectedIds.includes(utility.id)}
              onClick={() => onCardClick?.(utility.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

// 기본 데이터
const defaultUtilityData: UtilityData[] = [
  {
    id: 1,
    category: "SNS",
    title: "TWITTER ACCESS", 
    price: "0.3 SOL",
    logoUrl: "/snssvg/twitter_white.svg"
  },
  {
    id: 2,
    category: "SNS",
    title: "TWITTER POST",
    price: "0.3 SOL",
    logoUrl: "/snssvg/twitter_white.svg"
  },
  {
    id: 3,
    category: "SNS", 
    title: "TWITTER REPLIES",
    price: "0.3 SOL",
    logoUrl: "/snssvg/twitter_white.svg"
  },
  {
    id: 4,
    category: "SNS", 
    title: "DISCORD ACCESS",
    price: "0.3 SOL",
    logoUrl: "/snssvg/discord_white.svg"
  },
  {
    id: 5,
    category: "SNS",
    title: "TELEGRAM ACCESS", 
    price: "0.3 SOL",
    logoUrl: "/snssvg/telegram_white.svg"
  },
  {
    id: 6,
    category: "OVERDRIVE",
    title: "OVERDRIVE ACCESS",
    price: "FREE",
    logoUrl: "/snssvg/overdive_white.svg"
  },
  {
    id: 7,
    category: "OVERDRIVE", 
    title: "OVERDRIVE POST",
    price: "FREE",
    logoUrl: "/snssvg/overdive_white.svg"
  },
  {
    id: 8,
    category: "OVERDRIVE",
    title: "OVERDRIVE REPLIES",
    price: "SOON",
    logoUrl: "/snssvg/overdive_white.svg"
  }
];
