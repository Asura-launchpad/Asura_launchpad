import styles from './main.module.scss';
import Banner from '../components/organization/banner';
import TokenBanner from '../components/cell/tokenbanner';
import AgentCardList from '../components/organization/agentcardlist';
import Image from 'next/image';
import { GetServerSideProps } from 'next';

const HomePage = () => {
  return (
    <div className={styles.container}>

      <Banner />
      <TokenBanner />
      <div className={styles.agentList}>
        <div className={styles.agentListTitle}>
          <Image src="/agenticon.svg" alt="agent icon" width={18} height={18} />
          <span>AGENT LIVE</span>
        </div>
      </div>

      <AgentCardList />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {}
  }
}

export default HomePage;