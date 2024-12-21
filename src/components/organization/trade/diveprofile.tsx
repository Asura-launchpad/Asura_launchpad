import { FC } from 'react';
import styles from './diveprofile.module.scss';

interface DiveProfileProps {
  coverImage: string;
  profileImage: string;
  name: string;
  description: string;
}

const DiveProfile: FC<DiveProfileProps> = ({
  coverImage,
  profileImage, 
  name,
  description
}) => {
  return (
    <div className={styles.profileContainer}>
      <div 
        className={styles.coverImage}
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      
      <div className={styles.profileContent}>
        <div 
          className={styles.profileImage}
          style={{ backgroundImage: `url(${profileImage})` }}
        />
        
        <div className={styles.info}>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.ipaButton}>
            IPA
          </button>
          <button className={styles.diveButton}>
            GO TO DIVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiveProfile;
