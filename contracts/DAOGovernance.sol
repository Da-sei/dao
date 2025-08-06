// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MyDAO.sol";

/**
 * @title DAOGovernance
 * @dev 完全なDAOガバナンスシステム
 * 
 * 機能:
 * - 提案の作成・投票・実行
 * - メンバーシップ管理
 * - クォーラム設定
 * - 投票期間管理
 * 
 * @author DAO The World Team
 */
contract DAOGovernance is Ownable, ReentrancyGuard {
    MyDAOToken public token;
    
    // 提案構造体
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
        mapping(address => bool) votedFor;
    }
    
    // 提案設定
    struct ProposalSettings {
        uint256 minVotingPeriod;
        uint256 maxVotingPeriod;
        uint256 quorumPercentage;
        uint256 minProposalTokens;
    }
    
    // 状態変数
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    ProposalSettings public settings;
    
    // イベント
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event SettingsUpdated(uint256 minVotingPeriod, uint256 maxVotingPeriod, uint256 quorumPercentage, uint256 minProposalTokens);
    
    // 修飾子
    modifier onlyTokenHolder() {
        require(token.balanceOf(msg.sender) > 0, "Must hold tokens to participate");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "Proposal does not exist");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        _;
    }
    
    constructor(address _token) Ownable(msg.sender) {
        token = MyDAOToken(_token);
        
        // デフォルト設定
        settings = ProposalSettings({
            minVotingPeriod: 1 days,
            maxVotingPeriod: 7 days,
            quorumPercentage: 10, // 10%
            minProposalTokens: 1000 * 10**18 // 1000 MDAO
        });
    }
    
    /**
     * @dev 提案を作成
     * @param title 提案タイトル
     * @param description 提案説明
     * @param votingPeriod 投票期間（秒）
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 votingPeriod
    ) external onlyTokenHolder {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(
            votingPeriod >= settings.minVotingPeriod && 
            votingPeriod <= settings.maxVotingPeriod,
            "Invalid voting period"
        );
        
        uint256 tokenBalance = token.balanceOf(msg.sender);
        require(tokenBalance >= settings.minProposalTokens, "Insufficient tokens to create proposal");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        proposal.executed = false;
        proposal.canceled = false;
        
        emit ProposalCreated(
            proposalCount,
            msg.sender,
            title,
            proposal.startTime,
            proposal.endTime
        );
    }
    
    /**
     * @dev 投票
     * @param proposalId 提案ID
     * @param support 賛成か反対か
     */
    function vote(uint256 proposalId, bool support) 
        external 
        onlyTokenHolder 
        proposalExists(proposalId) 
        proposalActive(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votes = token.balanceOf(msg.sender);
        require(votes > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votedFor[msg.sender] = support;
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit Voted(proposalId, msg.sender, support, votes);
    }
    
    /**
     * @dev 提案を実行
     * @param proposalId 提案ID
     */
    function executeProposal(uint256 proposalId) 
        external 
        nonReentrant 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 totalSupply = token.totalSupply();
        uint256 quorum = (totalSupply * settings.quorumPercentage) / 100;
        
        require(totalVotes >= quorum, "Quorum not reached");
        require(proposal.forVotes > proposal.againstVotes, "Proposal not passed");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev 提案をキャンセル（提案者のみ）
     * @param proposalId 提案ID
     */
    function cancelProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer, "Only proposer can cancel");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        require(block.timestamp < proposal.endTime, "Voting ended");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }
    
    /**
     * @dev 投票状況を取得
     * @param proposalId 提案ID
     */
    function getProposalVotes(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            uint256 forVotes,
            uint256 againstVotes,
            uint256 totalVotes,
            bool quorumReached
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        forVotes = proposal.forVotes;
        againstVotes = proposal.againstVotes;
        totalVotes = forVotes + againstVotes;
        
        uint256 totalSupply = token.totalSupply();
        uint256 quorum = (totalSupply * settings.quorumPercentage) / 100;
        quorumReached = totalVotes >= quorum;
    }
    
    /**
     * @dev 提案情報を取得
     * @param proposalId 提案ID
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            address proposer,
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool executed,
            bool canceled
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.canceled
        );
    }
    
    /**
     * @dev ユーザーの投票状況を確認
     * @param proposalId 提案ID
     * @param voter 投票者アドレス
     */
    function hasVoted(uint256 proposalId, address voter) 
        external 
        view 
        proposalExists(proposalId) 
        returns (bool) 
    {
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev 設定を更新（オーナーのみ）
     */
    function updateSettings(
        uint256 _minVotingPeriod,
        uint256 _maxVotingPeriod,
        uint256 _quorumPercentage,
        uint256 _minProposalTokens
    ) external onlyOwner {
        require(_minVotingPeriod < _maxVotingPeriod, "Invalid voting periods");
        require(_quorumPercentage <= 100, "Invalid quorum percentage");
        
        settings.minVotingPeriod = _minVotingPeriod;
        settings.maxVotingPeriod = _maxVotingPeriod;
        settings.quorumPercentage = _quorumPercentage;
        settings.minProposalTokens = _minProposalTokens;
        
        emit SettingsUpdated(_minVotingPeriod, _maxVotingPeriod, _quorumPercentage, _minProposalTokens);
    }
    
    /**
     * @dev 現在の設定を取得
     */
    function getSettings() external view returns (
        uint256 minVotingPeriod,
        uint256 maxVotingPeriod,
        uint256 quorumPercentage,
        uint256 minProposalTokens
    ) {
        return (
            settings.minVotingPeriod,
            settings.maxVotingPeriod,
            settings.quorumPercentage,
            settings.minProposalTokens
        );
    }
} 