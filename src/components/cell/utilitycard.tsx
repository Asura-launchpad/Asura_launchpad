import React from 'react';
import styles from './utilitycard.module.scss';
import Image from 'next/image';

interface UtilityCardProps {
  category: string;
  title: string;
  price: string;
  isSelected: boolean;
  logoUrl: string;
  onClick?: () => void;
}

const UtilityCard: React.FC<UtilityCardProps> = ({
  category,
  title,
  price,
  isSelected,
  onClick,
  logoUrl // 로고 URL을 props로 추가
}) => {
  return (
    <div className={`${styles.cardContainer} ${isSelected ? styles.active : ''}`} onClick={onClick}>
      <div className={`${styles.categoryTag} ${isSelected ? styles.active : ''}`}>{category}</div>
      <div className={styles.checkIcon}>
        <Image
          src={isSelected ? "/snssvg/check_active.svg" : "/snssvg/check_default.svg"}
          alt="selection status"
          width={24}
          height={24}
        />
      </div>
      <div className={styles.logoContainer}>
        <Image 
          src={logoUrl} 
          alt={title}
          width={24}
          height={24}
          style={{ borderRadius: '50%' }}
        /> {/* 외부에서 전달받은 로고 URL 사용 */}
      </div>
      <div className={styles.cardContent}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.price}>{price}</p>
      </div>
    </div>
  );
};

export default UtilityCard;
