import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from './contractaddress.module.scss';
import ProjectInfo from '../../components/organization/projectinfo';
import { SimpleAgent } from '../../type/type';


import ContractAddress from '../../components/organization/trade/contractaddress';
import TradeBox from '../../components/organization/trade/tradebox';
import ProgressBar from '../../components/organization/trade/progressbar';
import ProjectSNSList from '../../components/organization/trade/projectsnslist';
import DiveProfile from '../../components/organization/trade/diveprofile';
import Board from '../../components/organization/communication/board';
import TokenTrendList from '../../components/organization/trade/tokentrendlist';
import BottomNavi from '../../components/organization/bottomnavi';
import PostList from '../../components/organization/communication/postlist';
import TradingView from '../../components/organization/tradingview';

import { getAgentPersonaByTokenAddress } from '@/api/agent';



interface TabContentProps {
  contractAddress: string | string[] | undefined;
}

const ContractAddressPage = () => {
  const router = useRouter();
  const { contractaddress } = router.query;
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [projectData, setProjectData] = useState<SimpleAgent>({
    persona: {
      id: 0,
      name: "Sample Project", 
      description: "This is a sample NFT project description",
      profile_image: "/default_cover.png",
      cover_image: "/default_cover.png"
    },
    maxSupply: 0,
    tokenTicker: "",
    tokenName: "",
    marketCap: 1000000,
    mainnet: "",
    contractAddress: "",
    bondingCurveAddress: "",
    dexaddress: "",
    holdersCount: 0,
    curveProgressEnabled: false,
    utilityTwitterAccess: false,
    utilityDiscordAccess: false,
    utilityTelegramAccess: false,
    utilityOverdiveAccess: false,
    twitterLink: "",
    discordLink: "",
    telegramLink: "",
    overdiveLink: "",
    createdAt: new Date()
  });

  useEffect(() => {contractaddress
    const handleResize = () => {
      setIsMobile(window.innerWidth < 890);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // ESC 키 이벤트 핸들러 추가
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.push('/');
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [router]);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!contractaddress || typeof contractaddress !== 'string') return;

      try {
        // 토큰 어드레스로 에이전트 정보 조회
        const response = await getAgentPersonaByTokenAddress(contractaddress);
        console.log('API 응답:', response);
        
        // 응답 데이터 구조 분해
        const { persona, agent_token, detailed_info } = response;
        
        // SimpleAgent 형식으로 데이터 포맷팅
        const formattedData: SimpleAgent = {
          persona: {
            id: persona.id,
            name: persona.name,
            description: persona.description || '',
            profile_image: persona.profile_image || '/default_cover.png',
            cover_image: persona.cover_image || '/default_cover.png'
          },
          maxSupply: agent_token.max_supply,
          bondingCurveSupply: agent_token.bonding_curve_supply,
          tokenTicker: agent_token.token_ticker,
          tokenName: agent_token.token_name,
          marketCap: agent_token.market_cap,
          mainnet: agent_token.mainnet,
          contractAddress: agent_token.contract_address,
          bondingCurveAddress: agent_token.bonding_curve_address,
          dexaddress: agent_token.dex_address,
          curveProgressEnabled: agent_token.curve_progress_enabled,
          holdersCount: agent_token.holders_count,
          utilityTwitterAccess: agent_token.utility_twitter_access,
          utilityDiscordAccess: agent_token.utility_discord_access,
          utilityTelegramAccess: agent_token.utility_telegram_access,
          utilityOverdiveAccess: agent_token.utility_overdive_access,
          twitterLink: agent_token.twitter_link,
          discordLink: agent_token.discord_link,
          telegramLink: agent_token.telegram_link || '',
          overdiveLink: agent_token.overdive_link,
          createdAt: new Date(agent_token.created_at)
        };

        console.log('Formatted Data:', formattedData);
        setProjectData(formattedData);
      } catch (error) {
        console.error("프로젝트 데이터 로딩 실패:", error);
      }
    };

    if (contractaddress) {
      fetchProjectData();
    }
  }, [contractaddress]);

  const renderContent = () => {
    switch(activeTab) {
      case 'info':
        return (
          <>
            <ProjectInfo 
              contractAddress={projectData.contractAddress}
              name={projectData.tokenName}
              marketCap={projectData.marketCap.toString()}
              date={projectData.createdAt.toLocaleDateString()}
              agentImg={projectData.persona.profile_image}
              symbol={projectData.tokenTicker}
            />
            {/* <div className={styles.lines}></div> */}
            <ProgressBar 
              bondingAddress={projectData.bondingCurveAddress || ''}
              // tokenAddress={projectData.contractAddress || ''}
            />
            <div className={styles.lines}></div>

            <TradeBox 
              onTrade={(type, amount) => {
                console.log(`${type} ${amount}`);
              }}
              contractAddress={projectData.bondingCurveAddress || ''}
              price={0}
              volume={0} 
              change={0}
              mainToken={{
                symbol: 'SOL',
                imageUrl: '/ticker/Sol.svg'
              }}
              memeToken={{
                symbol: projectData.tokenTicker,
                imageUrl: projectData.persona.profile_image || `/ticker/${projectData.tokenTicker.toLowerCase()}.svg`
              }}
            />
            <div className={styles.lines}></div>

            <ContractAddress contractAddress={projectData.contractAddress} />
            <div className={styles.lines}></div>

            <DiveProfile
              coverImage={projectData.persona.cover_image || ''}
              profileImage={projectData.persona.profile_image || ''}
              name={projectData.persona.name}
              description={projectData.persona.description}
            />
            <div className={styles.lines}></div>

            <ProjectSNSList 
              twitter={projectData.twitterLink ?? ""}
              discord={projectData.discordLink ?? ""}
              telegram={projectData.telegramLink ?? ""}
              overdive={projectData.overdiveLink ?? ""}
            />
            <div className={styles.liners}></div>

          </>
        );
        
      case 'chart':
        return (
          <div className={styles.chartSection}>
            <ProjectInfo 
              contractAddress={projectData.contractAddress}
              name={projectData.tokenName}
              marketCap={projectData.marketCap.toString()}
              date={projectData.createdAt.toLocaleDateString()}
              agentImg={projectData.persona.profile_image}
              symbol={projectData.tokenTicker}
            />
            <TradingView 
              symbol={projectData.tokenTicker}
              containerId="trading-view-chart" 
              theme="dark"
              curve_progress_enabled={projectData.curveProgressEnabled}
              dexaddress={projectData.dexaddress}
              mainnet={projectData.mainnet}
            />
          </div>
        );
      case 'comment':
        return (
          <div className={styles.commentSection}>
            <ProjectInfo 
              contractAddress={projectData.contractAddress}
              name={projectData.tokenName}
              marketCap={projectData.marketCap.toString()}
              date={projectData.createdAt.toLocaleDateString()}
              agentImg={projectData.persona.profile_image}
              symbol={projectData.tokenTicker}
            />
            <PostList posts={[
                  {
                    profileImg: "/default_cover.png",
                    username: "사용자", 
                    clientName: "Comment",
                    post: "첫 번째 댓글입���다.",
                    date: "2024-01-01"
                  },
                  {
                    profileImg: "/default_cover.png",
                    username: "사용자2",
                    clientName: "Comment", 
                    post: "안녕하세요!",
                    date: "2024-01-02"
                  }
            ]} />
          </div>
        );
      case 'chat':
        return <div className={styles.chatSection}>채팅 섹션</div>;
      default:
        return <ProjectInfo 
          contractAddress={projectData.contractAddress}
          name={projectData.tokenName}
          marketCap={projectData.marketCap.toString()}
          date={projectData.createdAt.toLocaleDateString()}
          agentImg={projectData.persona.profile_image}
          symbol={projectData.tokenTicker}
        />;
        
    }
  };

  return (
    <div className={styles.container}>
      {isMobile ? (
        <div className={styles.mobileContainer}>
          <div className={styles.content}>
            {renderContent()}
          </div>
          <BottomNavi activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
      ) : (
        <div className={styles.desktopLayout}>
          <div className={styles.leftSection}>
            <div className={styles.tokenTrendListWrapper}>
              <TokenTrendList
                items={[
                  { rank: 1, name: "Ethereum", ticker: "ETH", price: 2235.50, contractAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", profile_image: "/default_cover.png" },
                  { rank: 2, name: "Bitcoin", ticker: "BTC", price: 42150.80, contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", profile_image: "/default_cover.png" },
                  { rank: 3, name: "BNB", ticker: "BNB", price: 308.25, contractAddress: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", profile_image: "/default_cover.png" },
                  { rank: 4, name: "Solana", ticker: "SOL", price: 98.75, contractAddress: "0x41848d32f281383f214c69b7b248dc7c2e0a7374", profile_image: "/default_cover.png" },
                  { rank: 5, name: "Cardano", ticker: "ADA", price: 0.58, contractAddress: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", profile_image: "/default_cover.png" },
                  { rank: 6, name: "XRP", ticker: "XRP", price: 0.62, contractAddress: "0x1E02E3b3A91B3E1244830A2F417f8F25F431D4D3", profile_image: "/default_cover.png" },
                  { rank: 7, name: "Dogecoin", ticker: "DOGE", price: 0.085, contractAddress: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", profile_image: "/default_cover.png" },
                  { rank: 8, name: "Polkadot", ticker: "DOT", price: 7.25, contractAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", profile_image: "/default_cover.png" },
                  { rank: 9, name: "Polygon", ticker: "MATIC", price: 0.85, contractAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", profile_image: "/default_cover.png" },
                  { rank: 10, name: "Chainlink", ticker: "LINK", price: 14.80, contractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA", profile_image: "/default_cover.png" },
      
                ]}
              />
            </div>
          </div>
          <div className={styles.midSection}>
        
            <div className={styles.chartSection}>
            <div className={styles.projectInfoSection}>
              <ProjectInfo 
                contractAddress={projectData.contractAddress}
                name={projectData.tokenName}
                symbol={projectData.tokenTicker}
                marketCap={projectData.marketCap.toString()}
                date={projectData.createdAt.toString()}
                agentImg={projectData.persona.profile_image}
              />

            </div>
            </div>
            <div className={styles.chartContainer}>
              <TradingView 
                symbol={projectData.tokenTicker}
                containerId="trading-view-chart" 
                theme="dark"
                curve_progress_enabled={projectData.curveProgressEnabled}
                dexaddress={projectData.dexaddress}
                mainnet={projectData.mainnet}
              />
            </div>
            
            <div className={styles.boardSection}>
              <Board
                posts={[
                  {
                    profileImg: "/default_cover.png",
                    username: "사용자", 
                    clientName: "Comment",
                    post: "첫 번째 댓글입니다.",
                    date: "2024-01-01"
                  },
                  {
                    profileImg: "/default_cover.png",
                    username: "사용자2",
                    clientName: "Chat", 
                    post: "안녕하세요!",
                    date: "2024-01-02"
                  }
                ]}
              />
            </div>
            

          </div>
          <div className={styles.rightSection}>
            <div className={styles.tradSection}>
                <div className="progress-section">
                  {/* <ProgressBar 
                    progress={projectData.holdersCount || 0}
                    total={projectData.bondingCurveSupply || 0}
                    title="READY FOR DIVE TO DEX"
                  /> */}
                  <ProgressBar 
                    bondingAddress={projectData.bondingCurveAddress || ''}
                    // tokenAddress={projectData.contractAddress || ''}
                  />
                </div>

                <div className="trade-section">
                  <TradeBox 
                    onTrade={(type, amount) => {
                      // 거래 로직 구현 필요
                      console.log(`${type} ${amount}`);
                    }}
                    contractAddress={projectData.bondingCurveAddress || ''}
                    price={0}
                    volume={0} 
                    change={0}
                    mainToken={{
                      symbol: 'SOL',
                      imageUrl: '/ticker/Sol.svg'
                    }}
                    memeToken={{
                      symbol: projectData.tokenTicker,
                      imageUrl: projectData.persona.profile_image || `/ticker/${projectData.tokenTicker.toLowerCase()}.svg`
                    }}
                  />
                </div>

                <div className="contract-section">
                  <ContractAddress contractAddress={projectData.contractAddress} />
                </div>

                <div className="profile-section">
                  <DiveProfile
                    coverImage={projectData.persona.cover_image || ''}
                    profileImage={projectData.persona.profile_image || ''}
                    name={projectData.persona.name}
                    description={projectData.persona.description}
                  />
                </div>

                <div className="sns-section">
                  <ProjectSNSList 
                    twitter={projectData.twitterLink ?? ""}
                    discord={projectData.discordLink ?? ""}
                    telegram={projectData.telegramLink ?? ""}
                    overdive={projectData.overdiveLink ?? ""}
                  />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractAddressPage;