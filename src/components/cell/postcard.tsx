import React from 'react';
import styles from './postcard.module.scss';
import Image from 'next/image';

interface PostCardProps {
  profileImg: string;
  username: string;
  clientName: string;
  post: string;
  date: string;
}

const PostCard: React.FC<PostCardProps> = ({
  profileImg,
  username,
  clientName,
  post,
  date
}) => {
  return (
    <div className={styles.postCard}>
      <div className={styles.userInfo}>
        <Image 
          src={profileImg}
          alt="profile"
          width={40}
          height={40}
          className={styles.profileImg}
        />
        <div className={styles.infoWrapper}>
          <div className={styles.nameInfo}>
            <span className={styles.username}>{username}</span>
            <span className={styles.clientName}>@ {clientName}</span>
          </div>
          <span className={styles.date}>{date}</span>
        </div>

      </div>
      <p className={styles.postContent}>{post}</p>
    </div>
  );
};

export default PostCard;
