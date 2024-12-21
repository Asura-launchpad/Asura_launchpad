import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './navi.module.scss';

import { CustomConnectButton } from '../cell/walletconnect';

const Navigation = () => {
  const router = useRouter();

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
            />
          <div className={styles.shortcut}>/</div>
          </div>
        </div>
        <div className={styles.walletConnect}>
          <CustomConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
