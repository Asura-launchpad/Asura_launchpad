import React from 'react';
import styles from './agentcard.module.scss';
import { useRouter } from 'next/router';
import Image from 'next/image';


interface AgentCardProps {
  title: string;
  curve: {
    value: number;
    percentage: number;
  };
  mc: number;
  imageUrl: string;
  onClick?: () => void;
  contractAddress: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  title, 
  curve, 
  mc, 
  imageUrl,
  onClick,
  contractAddress
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    router.push(`/${contractAddress}`);
  };

  return (
    <div className={styles.cardContainer} onClick={handleClick}>
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={title}
          className={styles.cardImage}
          // onError={(e) => {
          //   const target = e.target as HTMLImageElement;
          //   target.src = '/default_cover.png'; // 폴백 이미지
          // }}
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.statsContainer}>
        
        <div className={styles.statItems}>
          <div className={styles.statItem}>
            <span className={styles.label}>CURVE</span>
            <div className={styles.value}>
              ${curve.value.toLocaleString()}
              <span className={styles.percentage}>{curve.percentage}%</span>
            </div>

          </div>
          <div className={styles.statItem}>
            <span className={styles.label}>M.C</span>
            <div className={styles.value}>${mc.toLocaleString()}</div>
          </div>
        </div>

        <button className={styles.diveButton}>
          DIVE
          <Image
            src="/yellowallow.svg"
            alt="dive arrow"
            width={12}
            height={12}
            className={styles.arrowIcon}
          />
        </button>
      </div>

      </div>
    </div>
  );
};

export default AgentCard;