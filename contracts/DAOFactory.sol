// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MyDAO.sol";
import "./DAOGovernance.sol";

/**
 * @title DAOFactory
 * @dev DAOを作成するためのファクトリーコントラクト
 * 
 * 機能:
 * - 新しいDAOの作成
 * - トークンとガバナンスの統合
 * - DAOの初期設定
 * 
 * @author DAO The World Team
 */
contract DAOFactory {
    // DAO情報構造体
    struct DAOInfo {
        string name;
        string symbol;
        address tokenAddress;
        address governanceAddress;
        address creator;
        uint256 createdAt;
    }
    
    // 作成されたDAOのリスト
    DAOInfo[] public daos;
    mapping(address => uint256) public daoIndexByToken;
    mapping(address => uint256) public daoIndexByGovernance;
    
    // イベント
    event DAOCreated(
        string name,
        string symbol,
        address indexed tokenAddress,
        address indexed governanceAddress,
        address indexed creator,
        uint256 daoId
    );
    
    /**
     * @dev 新しいDAOを作成
     * @param name DAO名
     * @param symbol トークンシンボル
     * @param initialSupply 初期供給量
     */
    function createDAO(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address tokenAddress, address governanceAddress) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than 0");
        
        // トークンコントラクトをデプロイ
        MyDAOToken token = new MyDAOToken();
        
        // ガバナンスコントラクトをデプロイ
        DAOGovernance governance = new DAOGovernance(address(token));
        
        // 初期供給量をデプロイヤーに発行
        token.mint(msg.sender, initialSupply);
        
        // DAO情報を保存
        DAOInfo memory daoInfo = DAOInfo({
            name: name,
            symbol: symbol,
            tokenAddress: address(token),
            governanceAddress: address(governance),
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        daos.push(daoInfo);
        uint256 daoId = daos.length - 1;
        
        daoIndexByToken[address(token)] = daoId;
        daoIndexByGovernance[address(governance)] = daoId;
        
        emit DAOCreated(
            name,
            symbol,
            address(token),
            address(governance),
            msg.sender,
            daoId
        );
        
        return (address(token), address(governance));
    }
    
    /**
     * @dev 作成されたDAOの数を取得
     */
    function getDAOCount() external view returns (uint256) {
        return daos.length;
    }
    
    /**
     * @dev DAO情報を取得
     * @param daoId DAO ID
     */
    function getDAO(uint256 daoId) external view returns (DAOInfo memory) {
        require(daoId < daos.length, "DAO does not exist");
        return daos[daoId];
    }
    
    /**
     * @dev トークンアドレスからDAO情報を取得
     * @param tokenAddress トークンアドレス
     */
    function getDAOByToken(address tokenAddress) external view returns (DAOInfo memory) {
        uint256 daoId = daoIndexByToken[tokenAddress];
        require(daoId < daos.length, "DAO not found");
        return daos[daoId];
    }
    
    /**
     * @dev ガバナンスアドレスからDAO情報を取得
     * @param governanceAddress ガバナンスアドレス
     */
    function getDAOByGovernance(address governanceAddress) external view returns (DAOInfo memory) {
        uint256 daoId = daoIndexByGovernance[governanceAddress];
        require(daoId < daos.length, "DAO not found");
        return daos[daoId];
    }
    
    /**
     * @dev すべてのDAOを取得
     */
    function getAllDAOs() external view returns (DAOInfo[] memory) {
        return daos;
    }
} 