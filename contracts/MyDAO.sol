// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MyDAOToken
 * @dev DAO The World プロジェクトのガバナンストークン
 * 
 * このコントラクトは以下の機能を提供します：
 * - ERC20標準に準拠したトークン機能（ERC20とは、Ethereumブロックチェーン上でトークンを標準化するための規格のこと）
 * - オーナーによる新規トークン発行機能
 * - アクセス制御によるセキュリティ
 * - イベント駆動による透明性
 * 
 * @author DAO The World Team
 * @version 1.0.0
 */
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyDAOToken is ERC20, Ownable {
    /**
     * @dev 初期供給量の定数
     * 1,000,000 MDAOトークン（18桁の小数点を考慮）
     * この値は変更不可で、コントラクトデプロイ時に設定される
     */
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18;
    
    /**
     * @dev トークン発行時のイベント
     * @param to トークンを受け取るアドレス（インデックス付きで検索可能）
     * @param amount 発行されるトークン量
     * 
     * このイベントにより、フロントエンドやオフチェーンアプリケーションで
     * トークン発行を追跡できます
     */
    event TokensMinted(address indexed to, uint256 amount);

    /**
     * @dev コントラクトのコンストラクタ
     * 
     * 初期設定を行います：
     * - ERC20トークンの基本情報を設定（名前: "MyDAO Token", シンボル: "MDAO"）
     * - Ownableコントラクトを初期化（デプロイヤーをオーナーに設定）
     * - 初期供給量をデプロイヤーに発行
     * 
     * @notice デプロイ時に1,000,000 MDAOがデプロイヤーに発行されます
     */
    constructor() ERC20("MyDAO Token", "MDAO") Ownable(msg.sender) {
        // デプロイヤーに初期供給量を発行
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev 新しいトークンを発行する関数
     * 
     * この関数は以下のセキュリティチェックを行います：
     * - 呼び出し者がオーナーであることの確認
     * - 発行先アドレスがゼロアドレスでないことの確認
     * - 発行量が0より大きいことの確認
     * 
     * @param to トークンを受け取るアドレス
     * @param amount 発行するトークン量（wei単位）
     * 
     * @notice この関数はオーナーのみが呼び出せます
     * @notice 発行時にTokensMintedイベントが発行されます
     * 
     * @custom:security オーナーのみが呼び出し可能
     * @custom:security ゼロアドレスへの発行は拒否
     * @custom:security ゼロ金額の発行は拒否
     */
    function mint(address to, uint256 amount) public onlyOwner {
        // セキュリティチェック：ゼロアドレスへの発行を防ぐ
        require(to != address(0), "Cannot mint to zero address");
        
        // セキュリティチェック：ゼロ金額の発行を防ぐ
        require(amount > 0, "Amount must be greater than 0");
        
        // トークンを発行
        _mint(to, amount);
        
        // イベントを発行して透明性を確保
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev コントラクトの基本情報を取得する関数
     * 
     * @return tokenName トークン名
     * @return tokenSymbol トークンシンボル
     * @return tokenDecimals 小数点桁数
     * @return tokenTotalSupply 総供給量
     * @return tokenOwner オーナーアドレス
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply,
        address tokenOwner
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            owner()
        );
    }
}