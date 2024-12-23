import api from '@/utils/api';
import { AgentPersonaData, AgentPersonaResponse } from '@/type/type';

export const createAgentPersona = async (agentData: AgentPersonaData): Promise<AgentPersonaResponse> => {
  try {
    console.log('[createAgentPersona] 시작');
    console.log('[createAgentPersona] 입력 데이터:', agentData);

    const formData = new FormData();
    
    // 기본 데이터 매핑
    formData.append('token_name', agentData.name);
    formData.append('token_ticker', agentData.ticker);
    formData.append('description', agentData.description || '');
    formData.append('personality', agentData.personality || '');
    formData.append('ton&manner', agentData.manner || '');
    formData.append('contract_address', agentData.contract_address || '');
    formData.append('bonding_curve_address', agentData.bonding_curve_address || '');
    formData.append('max_supply', '1000000000');
    formData.append('mainnet', 'Base Testnet');

    // 유틸리티 설정
    formData.append('utility_twitter_access', String(agentData.utilities?.includes('twitter')));
    formData.append('utility_discord_access', String(agentData.utilities?.includes('discord')));
    formData.append('utility_telegram_access', String(agentData.utilities?.includes('telegram')));
    formData.append('utility_overdive_access', String(agentData.utilities?.includes('overdrive')));

    // 프로젝트 링크
    formData.append('twitter_link', agentData.twitter || '');
    formData.append('website_link', agentData.website || '');
    formData.append('discord_link', agentData.discord || '');
    formData.append('telegram_link', agentData.telegram || '');
    formData.append('overdive_link', agentData.overdrive || '');

    // 이미지 파일 처리
    if (agentData.profileImage instanceof File) {
      formData.append('profileimg', agentData.profileImage);
    }
    if (agentData.coverImage instanceof File) {
      formData.append('coverimg', agentData.coverImage);
    }

    // FormData 내용 출력
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`[FormData] ${key}: ${value}`);
    });

    console.log('[createAgentPersona] API 요청 시작');
    const response = await api.post<AgentPersonaResponse>('/api/persona/create-agent-persona/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('[createAgentPersona] API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('[createAgentPersona] 에러 발생:', error);
    throw new Error('에이전트 페르소나 생성에 실패했습니다.');
  }
};


// 본딩커브 주소로 에이전트 정보 조회
export const getAgentPersonaByTokenAddress = async (tokenAddress: string): Promise<AgentPersonaResponse> => {
    try {
      const response = await api.get<AgentPersonaResponse>(
        `/api/persona/agent-persona-by-bonding-curve/`, {
          params: {
            address: tokenAddress
          }
        }
      );
      console.log('[getAgentPersonaByTokenAddress] 응답:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[getAgentPersonaByTokenAddress] 에러 발생:', error);
      if (error.response?.status === 404) {
        throw new Error('해당 토큰 주소의 페르소나를 찾을 수 없습니다.');
      } else if (error.response?.status === 400) {
        throw new Error('토큰 주소가 필요합니다.');
      }
      throw new Error('페르소나 조회 중 오류가 발생했습니다.');
    }
  };

interface AgentPersonaListResponse {
  count: number;
  results: {
    persona: AgentPersonaResponse['persona'];
    agent_token: AgentPersonaResponse['agent_token'];
  }[];
}

export const getAgentPersonaList = async (
  sortBy: string = '-created_at',
  page: number = 1
): Promise<AgentPersonaListResponse> => {
  try {
    const response = await api.get('/api/persona/agent-personas/', {
      params: {
        sort: sortBy,
        page
      }
    });
    console.log('[getAgentPersonaList] 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[getAgentPersonaList] 에러 발생:', error);
    if (error.response?.status === 500) {
      throw new Error('에이전트 페르소나 목록을 가져오는 중 오류가 발생했습니다.');
    }
    throw new Error('에이전트 페르소나 목록 조회에 실패했습니다.');
  }
};




interface TrendingTokensResponse {
  count: number;
  results: {
    persona: AgentPersonaResponse['persona'];
    agent_token: AgentPersonaResponse['agent_token'] & {
      volume_24h: number;
      trades_count: number;
      unique_traders: number;
      holders_count: number;
      price: number;
    };
    detailed_info: any;
  }[];
  has_transactions: boolean;
  timestamp: string;
}

export const getTrendingTokens = async (): Promise<TrendingTokensResponse> => {
  try {
    const response = await api.get('/api/persona/trending-tokens/');
    console.log('[getTrendingTokens] 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[getTrendingTokens] 에러 발생:', error);
    if (error.response?.status === 500) {
      throw new Error('트렌딩 토큰 목록을 가져오는 중 오류가 발생했습니다.');
    }
    throw new Error('트렌딩 토큰 목록 조회에 실패했습니다.');
  }
};


interface SearchAgentTokenResponse {
  count: number;
  results: {
    persona: AgentPersonaResponse['persona'];
    agent_token: AgentPersonaResponse['agent_token'];
  }[];
}


export const searchAgentToken = async (query: string): Promise<SearchAgentTokenResponse> => {
  try {
    if (!query) {
      throw new Error('검색어를 입력해주세요.');
    }

    const response = await api.get('/api/persona/search-agent-token/', {
      params: { query }
    });
    console.log('[searchAgentToken] 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[searchAgentToken] 에러 발생:', error);
    if (error.response?.status === 400) {
      throw new Error('검색어를 입력해주세요.');
    }
    if (error.response?.status === 500) {
      throw new Error('에이전트 토큰 검색 중 오류가 발생했습니다.');
    }
    throw new Error('에이전트 토큰 검색에 실패했습니다.');
  }
};
