export interface AgentToken {
  persona: PersonaType & DetailedPersonaInfo;
  maxSupply: number;
  tokenTicker: string;
  tokenName: string;
  marketCap: number;

  // 커브 프로그레스
  curveProgressEnabled: boolean;
  curveProgressPercent: number;

  // 스토리 프로토콜
  storyProtocolIpa?: string;
  storyProtocolTokenId?: number;
  storyProtocolProductOwner?: string;

  // 컨트랙트 정보 
  mainnet: string;
  contractAddress: string;
  holdersCount: number;

  // 유틸리티
  utilityTwitterAccess: boolean;
  utilityTwitterPost: boolean;
  utilityTwitterReplies: boolean;
  utilityDiscordAccess: boolean;
  utilityTelegramAccess: boolean;
  utilityOverdiveAccess: boolean;
  utilityOverdivePost: boolean;
  utilityOverdiveReplies: boolean;

  // 프로젝트 링크
  twitterLink?: string;
  websiteLink?: string;
  discordLink?: string;
  overdiveLink?: string;
  telegramLink?: string;

  createdAt: Date;
  updatedAt: Date;

  price?: number;
  volume_24h?: number;
}

export interface DetailedPersonaInfo {
  income: string;
  technicalSkillsDesktop: string;
  technicalSkillsMobile: string;
  dailySocialMedia: string;
  painPoints: string;
  goals: string;
  motivation: string;
  behaviorHabits: string;
  consumptionHabits: string;
  familyBackground: string;
  speakingHabits: string;
  frequentActions: string;
  interpersonalSkills: string;
  psychologicalWeaknesses: string;
  psychologicalWeaknessesReasons: string;
  appearanceTraits: string;
  education: string;
  language: string;
  negativeprompt: string;
}

export interface PersonaType {
  id?: number;
  user?: {
    id: number;
  };
  name: string;
  personaname: string; 
  bio?: string;
  description: string;
  age: number;
  gender: string;
  mbti: string;
  occupation: string;
  location: string;
  created_at: Date;
  is_nft: boolean;
  profile_image?: string;
  cover_image?: string;
  recommendation: boolean;
  chat_data?: string;
  auto_post: boolean;
  post_schedule?: {
    id: number;
  };
  last_auto_post?: Date;
}

export interface AgentPersonaData {
  name: string;
  ticker: string;
  description?: string;
  personality?: string;
  manner?: string;
  contract_address?: string;
  bonding_curve_address?: string;
  utilities?: string[];
  twitter?: string;
  website?: string;
  discord?: string;
  telegram?: string;
  overdrive?: string;
  profileImage?: File;
  coverImage?: File;
}

export interface AgentPersonaInfo {
  id: number;
  name: string;
  personaname: string;
  description: string;
  age: number;
  gender: string;
  mbti: string;
  occupation: string;
  location: string;
  profile_image: string;
  cover_image: string;
  is_nft: boolean;
}

export interface AgentDetailedPersonaInfo {
  persona: number;
  income: string;
  technical_skills_desktop: string;
  technical_skills_mobile: string;
  daily_social_media: string;
  pain_points: string;
  goals: string;
  motivation: string;
  behavior_habits: string;
  consumption_habits: string;
  family_background: string;
  speaking_habits: string;
  frequent_actions: string;
  interpersonal_skills: string;
  psychological_weaknesses: string;
  psychological_weaknesses_reasons: string;
  appearance_traits: string;
  education: string;
  language: string;
  negativeprompt: string;
}

export interface AgentTokenInfo {
  persona: number;
  token_name: string;
  token_ticker: string;
  max_supply: number;
  mainnet: string;
  contract_address: string;
  bonding_curve_address: string;
  dex_address: string;
  curve_progress_enabled: boolean;
  utility_twitter_access: boolean;
  utility_discord_access: boolean;
  utility_telegram_access: boolean;
  utility_overdive_access: boolean;
  twitter_link: string;
  website_link: string;
  discord_link: string;
  telegram_link: string;
  overdive_link: string;
  created_at: string;
}

export interface AgentPersonaResponse {
  persona: {
    id: number;
    name: string;
    description: string;
    profile_image: string;
    cover_image?: string;
  };
  agent_token: {
    token_name: string;
    token_ticker: string;
    curve_progress_enabled: boolean;
    max_supply: number;
    bonding_curve_supply: number;
    market_cap: number;
    mainnet: string;
    contract_address: string;
    bonding_curve_address: string;
    holders_count: number;
    dex_address: string;
    created_at: string;
    utility_twitter_access: boolean;
    utility_discord_access: boolean;
    utility_telegram_access: boolean;
    utility_overdive_access: boolean;
    twitter_link: string;
    discord_link: string;
    telegram_link: string;
    overdive_link: string;
  };
  detailed_info: any;
}


interface SimplePersona {
  id: number;
  name: string;
  description: string;
  profile_image: string;
  cover_image: string;
}

export interface SimpleAgent {
  persona: SimplePersona;
  bondingCurveSupply?: number;
  bondingCurveAddress?: string;
  maxSupply: number;
  tokenTicker: string;
  tokenName: string;
  curveProgressEnabled: boolean;
  marketCap: number;
  mainnet: string;
  contractAddress: string;
  holdersCount: number;
  dexaddress: string;
  utilityTwitterAccess: boolean;
  utilityDiscordAccess: boolean;
  utilityTelegramAccess: boolean;
  utilityOverdiveAccess: boolean;
  twitterLink?: string;
  discordLink?: string;
  telegramLink?: string;
  overdiveLink?: string;
  createdAt: Date;
}