import React, { useEffect, useState } from 'react';
import AgentCard from '../cell/agentcard';
import styles from './agentcardlist.module.scss';
import { getAgentPersonaList } from '../../api/agent';
import { AgentPersonaResponse } from '@/type/type';

interface AgentPersonaListResponse {
  count: number;
  results: {
    persona: AgentPersonaResponse['persona'];
    agent_token: AgentPersonaResponse['agent_token'];
  }[];
}

export interface AgentData {
  id: number;
  title: string;
  curve: {
    value: number;
    percentage: number;
  };
  mc: number;
  imageUrl: string;
  contractAddress: string;
}

// AgentCardList 컴포넌트 Props 인터페이스 정의
export interface AgentCardListProps {
  data?: AgentData[];
  onCardClick?: (id: number) => void;
}

// AgentCardList 컴포넌트
export const AgentCardList: React.FC<AgentCardListProps> = ({ 
  data = [],
  onCardClick
}) => {
  const [agents, setAgents] = useState<AgentData[]>(data);
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await getAgentPersonaList() as AgentPersonaListResponse;
        console.log('API Response:', response);

        const mappedAgents: AgentData[] = response.results.map(item => ({
          id: item.persona.id,
          title: item.persona.name,
          curve: {
            value: item.agent_token.bonding_curve_supply || 0,
            percentage: (item.agent_token.bonding_curve_supply / item.agent_token.max_supply) * 100 || 0
          },
          mc: item.agent_token.market_cap || 0,
          imageUrl: item.persona.profile_image || '/default_cover.png',
          contractAddress: item.agent_token.contract_address || ''
        }));

        setAgents(mappedAgents);
      } catch (error) {
        console.error('Failed to fetch agent list:', error);
      }
    };

    if (data.length === 0) {
      fetchAgents();
    }
  }, []);

  return (
    <div className={styles.cardGrid}>
      {agents.map((agent: AgentData) => (
        <div key={agent.id} className={styles.cardWrapper}>
          <AgentCard
            title={agent.title}
            curve={agent.curve}
            mc={agent.mc}
            imageUrl={agent.imageUrl}
            onClick={() => onCardClick?.(agent.id)}
            contractAddress={agent.contractAddress}
          />
        </div>
      ))}
    </div>
  );
}
export default AgentCardList;