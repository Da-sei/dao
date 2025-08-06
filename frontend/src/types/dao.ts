// DAO管理プラットフォーム用の型定義

export interface DAO {
  id: string;
  name: string;
  symbol: string;
  description: string;
  tokenAddress: string;
  governanceAddress: string;
  creator: string;
  createdAt: number;
  memberCount: number;
  totalSupply: string;
  treasuryBalance: string;
  status: DAOStatus;
  settings: DAOSettings;
  metadata: DAOMetadata;
}

export interface DAOSettings {
  minVotingPeriod: number;
  maxVotingPeriod: number;
  quorum: number;
  minProposalTokens: string;
  executionDelay: number;
  votingThreshold: number;
}

export interface DAOMetadata {
  logo?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  description: string;
  tags: string[];
  category: DAOCategory;
}

export interface Proposal {
  id: string;
  daoId: string;
  title: string;
  description: string;
  proposer: string;
  createdAt: number;
  startTime: number;
  endTime: number;
  status: ProposalStatus;
  votes: Vote[];
  totalVotes: string;
  forVotes: string;
  againstVotes: string;
  executed: boolean;
  executedAt?: number;
  executionData?: string;
}

export interface Vote {
  voter: string;
  support: boolean;
  weight: string;
  reason?: string;
  timestamp: number;
}

export interface Member {
  address: string;
  daoId: string;
  balance: string;
  votingPower: string;
  joinedAt: number;
  role: MemberRole;
  isActive: boolean;
}

export interface Treasury {
  daoId: string;
  balance: string;
  transactions: TreasuryTransaction[];
}

export interface TreasuryTransaction {
  id: string;
  daoId: string;
  type: TransactionType;
  amount: string;
  recipient: string;
  description: string;
  executedBy: string;
  executedAt: number;
  proposalId?: string;
}

export interface DAOStats {
  daoId: string;
  totalProposals: number;
  activeProposals: number;
  totalMembers: number;
  totalVotes: number;
  averageParticipation: number;
  treasuryValue: string;
  lastActivity: number;
}

// 列挙型
export enum DAOStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISSOLVED = 'dissolved',
  PENDING = 'pending'
}

export enum ProposalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUCCEEDED = 'succeeded',
  DEFEATED = 'defeated',
  EXECUTED = 'executed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum MemberRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  FOUNDER = 'founder'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REWARD = 'reward'
}

export enum DAOCategory {
  DEFI = 'defi',
  NFT = 'nft',
  GAMING = 'gaming',
  SOCIAL = 'social',
  GOVERNANCE = 'governance',
  INVESTMENT = 'investment',
  EDUCATION = 'education',
  OTHER = 'other'
}

// プラットフォーム設定
export interface PlatformSettings {
  maxDAOsPerUser: number;
  minDAOInitialSupply: string;
  maxDAOInitialSupply: string;
  platformFee: number;
  platformFeeRecipient: string;
  supportedNetworks: NetworkConfig[];
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isActive: boolean;
}

// API レスポンス型
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// フィルター・ソート用
export interface DAOFilter {
  category?: DAOCategory;
  status?: DAOStatus;
  minMembers?: number;
  maxMembers?: number;
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'memberCount' | 'treasuryBalance' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ProposalFilter {
  status?: ProposalStatus;
  proposer?: string;
  startDate?: number;
  endDate?: number;
  sortBy?: 'createdAt' | 'endTime' | 'totalVotes';
  sortOrder?: 'asc' | 'desc';
} 