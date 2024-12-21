import React from 'react';
import Image from 'next/image';
import styles from './bottomnavi.module.scss';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface BottomNaviProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems: NavItem[] = [
  {
    id: 'info',
    icon: '/navisvg/home.svg',
    label: 'INFO'
  },
  {
    id: 'chart',
    icon: '/navisvg/chart.svg', 
    label: 'CHART'
  },
  {
    id: 'comment',
    icon: '/navisvg/comment.svg',
    label: 'COMMENT'
  },
  {
    id: 'chat',
    icon: '/navisvg/ai.svg',
    label: 'CHAT'
  }
];

const BottomNavi: React.FC<BottomNaviProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <Image 
            src={item.icon}
            alt={item.label}
            width={24}
            height={24}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNavi;
