import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './navi.module.scss';

import { CustomConnectButton } from '../cell/walletconnect';
import { useState, useEffect } from 'react';
import SearchResult from './searchresult';

const Navigation = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleBlur = () => {
    // 검색 결과를 클릭할 수 있도록 약간의 지연을 줌
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        setShowResults(true);
      } else if (e.key === 'Escape') {
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={styles.navWrapper}>
        <div className={styles.logo}>
          <Link href="/">
            <Image 
              src="/fundotlogo.svg"
              alt="Fundot Logo"
              width={165}
              height={24}
              priority
            />
          </Link>
        </div>
        <div className={styles.searchBar}>
          <div className={styles.searchWrapper}>
            <Image
              src="/searchicon.svg"
              alt="Search"
              width={14}
              height={14}
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="SEARCH TOKEN"
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearchChange}
              onBlur={handleBlur}
            />
            <div className={styles.shortcut}>/</div>
          </div>
          {showResults && (
            <div className={styles.searchResultWrapper}>
              <SearchResult query={searchQuery} />
            </div>
          )}
        </div>
        <div className={styles.walletConnect}>
          <CustomConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
