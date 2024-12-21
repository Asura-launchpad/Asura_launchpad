import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './trendcard.module.scss';



// TrendCard 컴포넌트의 Props 인터페이스 정의
interface TrendCardProps {
  title: string;
  price: number;
  totalPrice: number;
  percentage: number;
  rank?: number;
  imageUrl?: string;
  contractAddress: string; // 컨트랙트 주소 추가
}

// TrendCard 컴포넌트 정의
const TrendCard: React.FC<TrendCardProps> = ({
  title,
  price,
  totalPrice,
  percentage,
  rank,
  imageUrl,
  contractAddress
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${contractAddress}`);
  };

  return (
    // 카드 전체를 감싸는 래퍼
    <div className={styles.cardWrapper} onClick={handleClick}>
      {/* 트렌드 카드의 메인 컨테이너 */}
      <div className={styles.card}>
        {/* 코인/NFT 이미지를 표시하는 컨테이너 */}
        <div className={styles.imageContainer}>
          <img 
            src={imageUrl || '/default-image.png'} 
            alt={title}
            className={styles.image}
          />
        </div>

        {/* 코인/NFT 정보를 표시하는 섹션 */}
        <div className={styles.info}>
          <div className={styles.title}>{title}</div>
          {rank && <div className={styles.rank}>{rank}<span>st</span></div>}

          <div className={styles.priceInfo}>
            <span className={styles.price}>${price.toLocaleString()}</span>
            <span className={styles.totalPrice}>/${totalPrice.toLocaleString()}</span>
            <span className={styles.percentage}>{percentage}%</span>
          </div>
        </div>

        {/* 상세 정보로 이동하는 다이브 버튼 */}
        <button className={styles.diveButton}>
          <div className={styles.diveButtonContent}>
            DIVE
            <Image src="/allowicon.svg" alt="dive" width={9} height={9} style={{ marginLeft: '2px' }} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default TrendCard;
