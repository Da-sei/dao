'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, getProvider, getDAOFactory, getMockContract, getMockDAOFactory, MOCK_WALLET } from '@/config/web3';
import Link from 'next/link';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
}

interface DAOInfo {
  name: string;
  symbol: string;
  tokenAddress: string;
  governanceAddress: string;
  creator: string;
  createdAt: number;
}

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [balance, setBalance] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [mintAmount, setMintAmount] = useState<string>('');
  const [mintAddress, setMintAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [daos, setDaos] = useState<DAOInfo[]>([]);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  // デバッグ情報を追加
  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
  };

  // モックウォレット接続
  const connectMockWallet = async () => {
    try {
      addDebugInfo('モックウォレット接続を開始...');
      setError('');
      
      setAccount(MOCK_WALLET.address);
      setIsMockMode(true);
      addDebugInfo(`モックウォレット接続成功: ${MOCK_WALLET.address}`);
      await loadData(MOCK_WALLET.address);
      
    } catch (error) {
      addDebugInfo(`モックウォレット接続エラー: ${error}`);
      setError(`モックウォレット接続エラー: ${error}`);
      console.error('モックウォレット接続エラー:', error);
    }
  };

  // ウォレット接続
  const connectWallet = async () => {
    try {
      addDebugInfo('ウォレット接続を開始...');
      setError('');
      
      if (typeof window !== 'undefined' && window.ethereum) {
        addDebugInfo('MetaMaskが検出されました');
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        addDebugInfo(`アカウント接続成功: ${accounts[0]}`);
        setAccount(accounts[0]);
        setIsMockMode(false);
        await loadData(accounts[0]);
      } else {
        addDebugInfo('MetaMaskが検出されませんでした');
        setError('MetaMaskがインストールされていません。モックウォレットを使用してください。');
      }
    } catch (error) {
      addDebugInfo(`ウォレット接続エラー: ${error}`);
      setError(`ウォレット接続エラー: ${error}`);
      console.error('ウォレット接続エラー:', error);
    }
  };

  // データ読み込み
  const loadData = async (userAccount: string) => {
    try {
      addDebugInfo('データ読み込みを開始...');
      setError('');
      
      const contract = isMockMode ? getMockContract() : getContract();
      addDebugInfo('コントラクトインスタンスを取得しました');
      
      // トークン情報取得
      addDebugInfo('トークン情報を取得中...');
      const [name, symbol, decimals, totalSupply, owner] = await contract.getTokenInfo();
      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        owner
      });
      addDebugInfo(`トークン情報取得成功: ${name} (${symbol})`);

      // 残高取得
      addDebugInfo('残高を取得中...');
      const balance = await contract.balanceOf(userAccount);
      setBalance(ethers.formatEther(balance));
      addDebugInfo(`残高取得成功: ${ethers.formatEther(balance)} ${symbol}`);

      // オーナーかどうかチェック
      setIsOwner(userAccount.toLowerCase() === owner.toLowerCase());
      addDebugInfo(`オーナーチェック: ${userAccount.toLowerCase() === owner.toLowerCase()}`);

      // DAO一覧を取得
      await loadDAOs();
      
    } catch (error) {
      addDebugInfo(`データ読み込みエラー: ${error}`);
      setError(`データ読み込みエラー: ${error}`);
      console.error('データ読み込みエラー:', error);
    }
  };

  // DAO一覧を読み込み
  const loadDAOs = async () => {
    try {
      addDebugInfo('DAO一覧を取得中...');
      const factory = isMockMode ? getMockDAOFactory() : getDAOFactory();
      const daoCount = await factory.getDAOCount();
      
      const daoList: DAOInfo[] = [];
      for (let i = 0; i < Number(daoCount); i++) {
        const daoInfo = await factory.getDAO(i);
        daoList.push({
          name: daoInfo.name,
          symbol: daoInfo.symbol,
          tokenAddress: daoInfo.tokenAddress,
          governanceAddress: daoInfo.governanceAddress,
          creator: daoInfo.creator,
          createdAt: Number(daoInfo.createdAt)
        });
      }
      
      setDaos(daoList);
      addDebugInfo(`${daoList.length}個のDAOを取得しました`);
    } catch (error) {
      addDebugInfo(`DAO一覧取得エラー: ${error}`);
      console.error('DAO一覧取得エラー:', error);
    }
  };

  // トークン発行
  const mintTokens = async () => {
    if (!mintAddress || !mintAmount) {
      setError('発行先アドレスと発行量を入力してください。');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      addDebugInfo('トークン発行を開始...');
      
      const contract = isMockMode ? getMockContract() : getContract();
      
      const amount = ethers.parseEther(mintAmount);
      addDebugInfo(`発行量: ${mintAmount} MDAO (${amount} wei)`);
      
      const tx = await contract.mint(mintAddress, amount);
      addDebugInfo(`トランザクション送信: ${tx.hash}`);
      
      await tx.wait();
      addDebugInfo('トランザクション完了');
      
      alert('トークン発行が完了しました！');
      setMintAmount('');
      setMintAddress('');
      await loadData(account);
    } catch (error) {
      addDebugInfo(`トークン発行エラー: ${error}`);
      setError(`トークン発行エラー: ${error}`);
      console.error('トークン発行エラー:', error);
      alert('トークン発行に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // ネットワーク接続テスト
  const testConnection = async () => {
    try {
      addDebugInfo('ネットワーク接続テストを開始...');
      const provider = getProvider();
      const network = await provider.getNetwork();
      addDebugInfo(`ネットワーク: ${network.name} (Chain ID: ${network.chainId})`);
      
      const contract = isMockMode ? getMockContract() : getContract();
      const name = await contract.name();
      addDebugInfo(`コントラクト接続成功: ${name}`);
      
    } catch (error) {
      addDebugInfo(`接続テストエラー: ${error}`);
      setError(`接続テストエラー: ${error}`);
    }
  };

  useEffect(() => {
    if (account) {
      loadData(account);
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-4">
            DAO The World
          </h1>
          <p className="text-lg text-gray-600">
            分散型自律組織の未来を体験しよう
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">エラー</h3>
            <p>{error}</p>
          </div>
        )}

        {/* デバッグ情報 */}
        <div className="bg-gray-100 border border-gray-200 text-gray-600 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">デバッグ情報</h3>
          <button
            onClick={testConnection}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mb-2"
          >
            接続テスト
          </button>
          <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
            {debugInfo || 'デバッグ情報がありません'}
          </pre>
        </div>

        {/* ウォレット接続 */}
        {!account ? (
          <div className="text-center space-y-4">
            <div className="space-y-4">
              <button
                onClick={connectMockWallet}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition-colors mr-4"
              >
                モックウォレット接続
              </button>
              <button
                onClick={connectWallet}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                MetaMask接続
              </button>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">推奨: モックウォレットを使用してテスト</p>
              <p className="text-sm">モックウォレット: {MOCK_WALLET.address}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 接続状態表示 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">接続状態:</p>
                  <p className="font-medium">
                    {isMockMode ? 'モックウォレット' : 'MetaMask'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">アドレス:</p>
                  <p className="font-mono text-sm">{account}</p>
                </div>
              </div>
            </div>

            {/* DAO作成セクション */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-light text-gray-800">DAO作成</h2>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    href="/create-dao"
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    新しいDAOを作成
                  </Link>
                </div>
              </div>
              <p className="text-gray-600">
                独自のDAOを作成して、分散型ガバナンスを始めましょう
              </p>
            </div>

            {/* DAO一覧 */}
            {daos.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-light text-gray-800 mb-4">作成されたDAO</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daos.map((dao, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 text-lg mb-2">{dao.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">シンボル: {dao.symbol}</p>
                      <p className="text-gray-500 text-xs mb-2">
                        作成者: {dao.creator.slice(0, 6)}...{dao.creator.slice(-4)}
                      </p>
                      <p className="text-gray-500 text-xs mb-3">
                        作成日: {new Date(dao.createdAt * 1000).toLocaleDateString()}
                      </p>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-xs">
                          トークン: {dao.tokenAddress.slice(0, 6)}...{dao.tokenAddress.slice(-4)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          ガバナンス: {dao.governanceAddress.slice(0, 6)}...{dao.governanceAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* アカウント情報 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-light text-gray-800 mb-4">アカウント情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">アドレス:</p>
                  <p className="font-mono text-sm break-all">{account}</p>
                </div>
                <div>
                  <p className="text-gray-600">MDAO残高:</p>
                  <p className="text-2xl font-light">{balance} MDAO</p>
                </div>
              </div>
            </div>

            {/* トークン情報 */}
            {tokenInfo && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-light text-gray-800 mb-4">トークン情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600">名前:</p>
                    <p className="font-medium">{tokenInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">シンボル:</p>
                    <p className="font-medium">{tokenInfo.symbol}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">総供給量:</p>
                    <p className="font-medium">{tokenInfo.totalSupply} MDAO</p>
                  </div>
                  <div>
                    <p className="text-gray-600">小数点:</p>
                    <p className="font-medium">{tokenInfo.decimals}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">オーナー:</p>
                    <p className="font-mono text-sm break-all">{tokenInfo.owner}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">あなたの権限:</p>
                    <p className="font-medium">
                      {isOwner ? 'オーナー' : 'メンバー'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* トークン発行（オーナーのみ） */}
            {isOwner && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-light text-gray-800 mb-4">トークン発行</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600 mb-2">発行先アドレス:</label>
                    <input
                      type="text"
                      value={mintAddress}
                      onChange={(e) => setMintAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-2">発行量 (MDAO):</label>
                    <input
                      type="number"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={mintTokens}
                    disabled={loading || !mintAddress || !mintAmount}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {loading ? '処理中...' : 'トークンを発行'}
                  </button>
                </div>
              </div>
            )}

            {/* 将来の機能 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-light text-gray-800 mb-4">将来の機能</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl mb-2">🗳️</div>
                  <h3 className="font-medium text-gray-800 mb-2">投票システム</h3>
                  <p className="text-gray-600 text-sm">提案作成・投票・実行</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <h3 className="font-medium text-gray-800 mb-2">資金管理</h3>
                  <p className="text-gray-600 text-sm">DAO財庫の管理</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-medium text-gray-800 mb-2">メンバー管理</h3>
                  <p className="text-gray-600 text-sm">参加・退出・権限</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
