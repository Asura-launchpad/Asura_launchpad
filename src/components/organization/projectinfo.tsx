import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './projectinfo.module.scss';

// 프로젝트 정보를 표시하기 위한 Props 인터페이스
interface ProjectInfoProps {
  name: string; 
  symbol: string;  // 프로젝트 심볼
  marketCap: string;         // 시가총액
  contractAddress: string;   // 컨트랙트 주소
  date: string;             // 생성일자
  agentImg?: string;        // 프로젝트 아이콘 이미지 (선택사항)
}

/**
 * 숫자를 K 단위로 포맷팅하는 함수
 * @param value - 포맷팅할 문자열 또는 숫자
 * @returns 포맷팅된 문자열
 */
const formatNumberWithK = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'; 
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * 프로젝트 정보를 표시하는 컴포넌트
 * 프로젝트의 기본 정보와 통계를 보여주며, 날짜에 호버 시 상세 시간을 툴팁으로 표시
 */
const ProjectInfo: FC<ProjectInfoProps> = ({
  name,
  symbol,
  marketCap,
  contractAddress,
  date,
  agentImg = '/default_cover.png'  // 기본 이미지 설정
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMobile(window.innerWidth <= 890);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 890);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * 주어진 날짜를 '~전' 형식으로 변환하는 함수
   * @param dateString - 변환할 날짜 문자열
   * @returns 상대적 시간 문자열
   */
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = now.getTime() - past.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return `${seconds}초 전`;
  };

  /**
   * 마우스 호버 시 툴팁 위치를 설정하는 핸들러
   * @param e - 마우스 이벤트 객체
   */
  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    setShowTooltip(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoWrapper}>
        {/* 프로젝트 아이콘 */}

        {/* 프로젝트 정보 컨텐츠 */}
        <div className={styles.infoContent}>
          {/* 프로젝트 이름 섹션 */}
          <div className={styles.projectInfoContainer}>
            <div className={styles.projectIcon}>
              <Image src={agentImg} alt="Project Icon" width={32} height={32} />
            </div>
            <div className={styles.nameSection}>
              <div className={styles.nameSections}>
                <h2>{name}</h2>
                <span className={styles.tag}>/ {symbol}</span>
              </div>
              <div className={styles.tagimg}>{isMobile ? 'LIVE' : 'LIVE ON STORY PROTOCOL'}</div>
            </div>
          </div>
          {/* 통계 정보 섹션 */}
          <div className={styles.statsSection}>
            <div className={styles.stat}>
              <span>{isMobile ? 'M.C' : 'Market Cap'}</span>
              <p>{formatNumberWithK(marketCap)}</p>
            </div>
            <div className={styles.stat}>
              <span>Contract</span>
              <p className={styles.contractAddress}>{contractAddress}</p>
            </div>
            <div className={styles.stat}>
              <span>Date</span>
              <p 
                className={styles.dateHover}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {getTimeAgo(date)}
              </p>
              {/* 날짜 툴팁 */}
              {showTooltip && (
                <div 
                  className={styles.tooltip}
                  style={{
                    position: 'absolute',
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`
                  }}
                >
                  {new Date(date).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
