import { ethers } from 'ethers';
import { 
  getMockDAOFactory, 
  getMockDAOGovernance, 
  getMockContract,
  getDAOFactory,
  getDAOGovernance,
  getContract
} from '@/config/web3';
import { 
  DAO, 
  Proposal, 
  Member, 
  DAOSettings, 
  DAOMetadata,
  DAOStatus,
  ProposalStatus,
  MemberRole,
  DAOCategory
} from '@/types/dao';

export class DAOService {
  private isMockMode: boolean;

  constructor(mockMode: boolean = true) {
    this.isMockMode = mockMode;
  }

  // DAO作成
  async createDAO(
    name: string,
    symbol: string,
    description: string,
    initialSupply: string,
    metadata: Partial<DAOMetadata>,
    settings: Partial<DAOSettings>
  ): Promise<DAO> {
    try {
      const factory = this.isMockMode ? getMockDAOFactory() : getDAOFactory();
      const initialSupplyWei = ethers.parseEther(initialSupply);

      const tx = await factory.createDAO(name, symbol, initialSupplyWei);
      const receipt = await tx.wait();

      // イベントからDAO情報を取得
      const event = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog(log as any)?.name === "DAOCreated";
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('DAO作成イベントが見つかりません');
      }

      const parsedEvent = factory.interface.parseLog(event as any);
      const [daoName, daoSymbol, tokenAddress, governanceAddress, creator, daoId] = parsedEvent?.args || [];

      const dao: DAO = {
        id: daoId.toString(),
        name: daoName,
        symbol: daoSymbol,
        description,
        tokenAddress,
        governanceAddress,
        creator,
        createdAt: Math.floor(Date.now() / 1000),
        memberCount: 1,
        totalSupply: initialSupply,
        treasuryBalance: '0',
        status: DAOStatus.ACTIVE,
        settings: {
          minVotingPeriod: settings.minVotingPeriod || 86400, // 1日
          maxVotingPeriod: settings.maxVotingPeriod || 604800, // 7日
          quorum: settings.quorum || 10,
          minProposalTokens: settings.minProposalTokens || '1000',
          executionDelay: settings.executionDelay || 0,
          votingThreshold: settings.votingThreshold || 50
        },
        metadata: {
          logo: metadata.logo || '',
          website: metadata.website || '',
          twitter: metadata.twitter || '',
          discord: metadata.discord || '',
          github: metadata.github || '',
          description: metadata.description || description,
          tags: metadata.tags || [],
          category: metadata.category || DAOCategory.OTHER
        }
      };

      return dao;
    } catch (error) {
      console.error('DAO作成エラー:', error);
      throw new Error(`DAO作成に失敗しました: ${error}`);
    }
  }

  // DAO一覧取得
  async getDAOs(): Promise<DAO[]> {
    try {
      const factory = this.isMockMode ? getMockDAOFactory() : getDAOFactory();
      const daoCount = await factory.getDAOCount();
      
      const daos: DAO[] = [];
      for (let i = 0; i < Number(daoCount); i++) {
        const daoInfo = await factory.getDAO(i);
        
        // ガバナンスコントラクトから詳細情報を取得
        const governance = this.isMockMode 
          ? getMockDAOGovernance(daoInfo.governanceAddress)
          : getDAOGovernance(daoInfo.governanceAddress);
        
        const settings = await governance.getSettings();
        
        const dao: DAO = {
          id: i.toString(),
          name: daoInfo.name,
          symbol: daoInfo.symbol,
          description: `DAO ${daoInfo.name}の説明`,
          tokenAddress: daoInfo.tokenAddress,
          governanceAddress: daoInfo.governanceAddress,
          creator: daoInfo.creator,
          createdAt: Number(daoInfo.createdAt),
          memberCount: 1, // TODO: 実際のメンバー数を取得
          totalSupply: '1000000', // TODO: 実際の供給量を取得
          treasuryBalance: '0', // TODO: 実際の財庫残高を取得
          status: DAOStatus.ACTIVE,
          settings: {
            minVotingPeriod: Number(settings.minVotingPeriod),
            maxVotingPeriod: Number(settings.maxVotingPeriod),
            quorum: Number(settings.quorum),
            minProposalTokens: ethers.formatEther(settings.minProposalTokens),
            executionDelay: Number(settings.executionDelay),
            votingThreshold: Number(settings.votingThreshold)
          },
          metadata: {
            logo: '',
            website: '',
            twitter: '',
            discord: '',
            github: '',
            description: `DAO ${daoInfo.name}の説明`,
            tags: [],
            category: DAOCategory.OTHER
          }
        };
        
        daos.push(dao);
      }
      
      return daos;
    } catch (error) {
      console.error('DAO一覧取得エラー:', error);
      throw new Error(`DAO一覧の取得に失敗しました: ${error}`);
    }
  }

  // 特定のDAO取得
  async getDAO(daoId: string): Promise<DAO> {
    try {
      const factory = this.isMockMode ? getMockDAOFactory() : getDAOFactory();
      const daoInfo = await factory.getDAO(daoId);
      
      const governance = this.isMockMode 
        ? getMockDAOGovernance(daoInfo.governanceAddress)
        : getDAOGovernance(daoInfo.governanceAddress);
      
      const settings = await governance.getSettings();
      
      return {
        id: daoId,
        name: daoInfo.name,
        symbol: daoInfo.symbol,
        description: `DAO ${daoInfo.name}の詳細説明`,
        tokenAddress: daoInfo.tokenAddress,
        governanceAddress: daoInfo.governanceAddress,
        creator: daoInfo.creator,
        createdAt: Number(daoInfo.createdAt),
        memberCount: 1,
        totalSupply: '1000000',
        treasuryBalance: '0',
        status: DAOStatus.ACTIVE,
        settings: {
          minVotingPeriod: Number(settings.minVotingPeriod),
          maxVotingPeriod: Number(settings.maxVotingPeriod),
          quorum: Number(settings.quorum),
          minProposalTokens: ethers.formatEther(settings.minProposalTokens),
          executionDelay: Number(settings.executionDelay),
          votingThreshold: Number(settings.votingThreshold)
        },
        metadata: {
          logo: '',
          website: '',
          twitter: '',
          discord: '',
          github: '',
          description: `DAO ${daoInfo.name}の詳細説明`,
          tags: [],
          category: DAOCategory.OTHER
        }
      };
    } catch (error) {
      console.error('DAO取得エラー:', error);
      throw new Error(`DAOの取得に失敗しました: ${error}`);
    }
  }

  // 提案作成
  async createProposal(
    daoId: string,
    title: string,
    description: string,
    executionData: string = '0x'
  ): Promise<Proposal> {
    try {
      const daos = await this.getDAOs();
      const dao = daos.find(d => d.id === daoId);
      
      if (!dao) {
        throw new Error('DAOが見つかりません');
      }

      const governance = this.isMockMode 
        ? getMockDAOGovernance(dao.governanceAddress)
        : getDAOGovernance(dao.governanceAddress);

      const tx = await governance.createProposal(title, description, executionData);
      const receipt = await tx.wait();

      // イベントから提案情報を取得
      const event = receipt?.logs.find((log: any) => {
        try {
          return governance.interface.parseLog(log as any)?.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('提案作成イベントが見つかりません');
      }

      const parsedEvent = governance.interface.parseLog(event as any);
      const [proposalId, proposer, title_, description_, startTime, endTime] = parsedEvent?.args || [];

      return {
        id: proposalId.toString(),
        daoId,
        title: title_,
        description: description_,
        proposer,
        createdAt: Math.floor(Date.now() / 1000),
        startTime: Number(startTime),
        endTime: Number(endTime),
        status: ProposalStatus.PENDING,
        votes: [],
        totalVotes: '0',
        forVotes: '0',
        againstVotes: '0',
        executed: false
      };
    } catch (error) {
      console.error('提案作成エラー:', error);
      throw new Error(`提案の作成に失敗しました: ${error}`);
    }
  }

  // 提案一覧取得
  async getProposals(daoId: string): Promise<Proposal[]> {
    try {
      const daos = await this.getDAOs();
      const dao = daos.find(d => d.id === daoId);
      
      if (!dao) {
        throw new Error('DAOが見つかりません');
      }

      const governance = this.isMockMode 
        ? getMockDAOGovernance(dao.governanceAddress)
        : getDAOGovernance(dao.governanceAddress);

      const proposalCount = await governance.proposalCount();
      const proposals: Proposal[] = [];

      for (let i = 1; i <= Number(proposalCount); i++) {
        try {
          const proposal = await governance.getProposal(i);
          const votes = await governance.getProposalVotes(i);
          
          proposals.push({
            id: i.toString(),
            daoId,
            title: proposal.title,
            description: proposal.description,
            proposer: proposal.proposer,
            createdAt: Number(proposal.createdAt),
            startTime: Number(proposal.startTime),
            endTime: Number(proposal.endTime),
            status: this.getProposalStatus(proposal),
            votes: votes.map((vote: any) => ({
              voter: vote.voter,
              support: vote.support,
              weight: ethers.formatEther(vote.weight),
              reason: vote.reason || '',
              timestamp: Number(vote.timestamp)
            })),
            totalVotes: ethers.formatEther(votes.reduce((acc: any, vote: any) => acc + vote.weight, 0n)),
            forVotes: ethers.formatEther(votes.filter((v: any) => v.support).reduce((acc: any, vote: any) => acc + vote.weight, 0n)),
            againstVotes: ethers.formatEther(votes.filter((v: any) => !v.support).reduce((acc: any, vote: any) => acc + vote.weight, 0n)),
            executed: proposal.executed,
            executedAt: proposal.executedAt ? Number(proposal.executedAt) : undefined,
            executionData: proposal.executionData
          });
        } catch (error) {
          console.warn(`提案 ${i} の取得に失敗:`, error);
        }
      }

      return proposals;
    } catch (error) {
      console.error('提案一覧取得エラー:', error);
      throw new Error(`提案一覧の取得に失敗しました: ${error}`);
    }
  }

  // 投票
  async vote(
    daoId: string,
    proposalId: string,
    support: boolean,
    reason: string = ''
  ): Promise<void> {
    try {
      const daos = await this.getDAOs();
      const dao = daos.find(d => d.id === daoId);
      
      if (!dao) {
        throw new Error('DAOが見つかりません');
      }

      const governance = this.isMockMode 
        ? getMockDAOGovernance(dao.governanceAddress)
        : getDAOGovernance(dao.governanceAddress);

      const tx = await governance.vote(proposalId, support, reason);
      await tx.wait();
    } catch (error) {
      console.error('投票エラー:', error);
      throw new Error(`投票に失敗しました: ${error}`);
    }
  }

  // 提案実行
  async executeProposal(daoId: string, proposalId: string): Promise<void> {
    try {
      const daos = await this.getDAOs();
      const dao = daos.find(d => d.id === daoId);
      
      if (!dao) {
        throw new Error('DAOが見つかりません');
      }

      const governance = this.isMockMode 
        ? getMockDAOGovernance(dao.governanceAddress)
        : getDAOGovernance(dao.governanceAddress);

      const tx = await governance.executeProposal(proposalId);
      await tx.wait();
    } catch (error) {
      console.error('提案実行エラー:', error);
      throw new Error(`提案の実行に失敗しました: ${error}`);
    }
  }

  // メンバー一覧取得
  async getMembers(daoId: string): Promise<Member[]> {
    try {
      const daos = await this.getDAOs();
      const dao = daos.find(d => d.id === daoId);
      
      if (!dao) {
        throw new Error('DAOが見つかりません');
      }

      const tokenContract = this.isMockMode 
        ? getMockContract()
        : getContract();

      // TODO: 実際のメンバー一覧を取得する実装
      // 現在は仮のデータを返す
      return [
        {
          address: dao.creator,
          daoId,
          balance: '1000000',
          votingPower: '1000000',
          joinedAt: dao.createdAt,
          role: MemberRole.FOUNDER,
          isActive: true
        }
      ];
    } catch (error) {
      console.error('メンバー一覧取得エラー:', error);
      throw new Error(`メンバー一覧の取得に失敗しました: ${error}`);
    }
  }

  // ヘルパーメソッド
  private getProposalStatus(proposal: any): ProposalStatus {
    const now = Math.floor(Date.now() / 1000);
    
    if (proposal.executed) {
      return ProposalStatus.EXECUTED;
    }
    
    if (now < Number(proposal.startTime)) {
      return ProposalStatus.PENDING;
    }
    
    if (now > Number(proposal.endTime)) {
      return ProposalStatus.EXPIRED;
    }
    
    return ProposalStatus.ACTIVE;
  }
}

// シングルトンインスタンス
export const daoService = new DAOService(true); // デフォルトでモックモード 