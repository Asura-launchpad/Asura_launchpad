import { FC } from 'react';
import styles from './projectsnslist.module.scss';
import Image from 'next/image';

interface SNSLink {
  type: string;
  url: string;
}

interface ProjectSNSListProps {
  twitter?: string;
  telegram?: string;
  overdive?: string;
  discord?: string;
  website?: string;
}

const ProjectSNSList: FC<ProjectSNSListProps> = ({ 
  twitter,
  telegram,
  overdive, 
  discord,
  website
}) => {
  const renderSNSIcon = (type: string) => {
    switch (type) {
      case 'twitter':
        return (
          <Image 
            src="/snssvg/twitter.svg" 
            alt="Twitter"
            width={24}
            height={24}
          />
        );
      case 'telegram':
        return (
          <Image 
            src="/snssvg/telegram.svg"
            alt="Telegram" 
            width={24}
            height={24}
          />
        );
      case 'overdive':
        return (
          <Image 
            src="/snssvg/overdive.svg"
            alt="Overdive"
            width={24}
            height={24}
          />
        );
      case 'discord':
        return (
          <Image 
            src="/snssvg/discord.svg"
            alt="Discord"
            width={24}
            height={24}
          />
        );
      case 'website':
        return (
          <Image 
            src="/snssvg/website.svg"
            alt="Website"
            width={24}
            height={24}
          />
        );
    }
  };

  const links: SNSLink[] = [
    twitter && { type: 'twitter', url: twitter },
    telegram && { type: 'telegram', url: telegram },
    overdive && { type: 'overdive', url: overdive },
    discord && { type: 'discord', url: discord }, 
    website && { type: 'website', url: website }
  ].filter((link): link is SNSLink => !!link);

  return (
    <div className={styles.snsList}>
      {links.map((link: SNSLink, index: number) => (
        <a 
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.snsLink}
        >
          {renderSNSIcon(link.type)}
        </a>
      ))}
    </div>
  );
}

export default ProjectSNSList;
