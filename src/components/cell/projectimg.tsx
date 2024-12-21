import React from 'react';
import Image from 'next/image';
import styles from './projectimg.module.scss';

interface ProjectImgProps {
  coverImage: string;
  profileImage: string;
  agentName: string;
  description?: string; // 디스크립션 추가
  onCoverImageChange: (file: File) => void;
  onProfileImageChange: (file: File) => void;
}

const ProjectImg: React.FC<ProjectImgProps> = ({
  coverImage,
  profileImage,
  agentName = 'Agent Name', // 기본 이름 설정
  description = 'Agent Description', // 기본 설명 설정
  onCoverImageChange,
  onProfileImageChange
}) => {

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCoverImageChange(file);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onProfileImageChange(file);
    }
  };

  return (
    <div>
    <div className={styles.label}>
    <span>Agent Profile/Cover</span>
    <span className={styles.required}></span>
  </div>
    <div className={styles.container}>
      <div className={styles.coverImageContainer}>
        <label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className={styles.fileInput}
          />
          {coverImage ? (
            <Image 
              src={coverImage}
              alt="Cover Image"
              layout="fill"
              objectFit="cover"
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.placeholderCover}>
              <span>Upload Cover Image</span>
            </div>
          )}
        </label>
      </div>

      <div className={styles.profileSection}>
        <div className={styles.profileContent}>
          <div className={styles.profileImageContainer}>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className={styles.fileInput}
              />
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile Image" 
                  width={106}
                  height={106}
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.placeholderProfile}>
                  <span>+</span>
                </div>
              )}
            </label>
          </div>
          <div className={styles.agentInfo}>
            <div className={styles.agentName}>{agentName}</div>
            {description && <div className={styles.agentDescription}>{description}</div>}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProjectImg;
