'use client';

import { useState, useEffect } from 'react';
import { daoService } from '@/services/daoService';
import { DAO, DAOCategory, DAOStatus } from '@/types/dao';
import Link from 'next/link';

export default function Dashboard() {
  const [daos, setDaos] = useState<DAO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadDAOs();
  }, []);

  const loadDAOs = async () => {
    try {
      setLoading(true);
      const daoList = await daoService.getDAOs();
      setDaos(daoList);
    } catch (error) {
      setError(`DAO一覧の読み込みに失敗しました: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredDAOs = daos.filter(dao => {
    const matchesFilter = filter === 'all' || dao.metadata.category === filter;
    const matchesSearch = dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dao.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category: DAOCategory) => {
    const icons = {
      [DAOCategory.DEFI]: '💰',
      [DAOCategory.NFT]: '🖼️',
      [DAOCategory.GAMING]: '🎮',
      [DAOCategory.SOCIAL]: '👥',
      [DAOCategory.GOVERNANCE]: '🏛️',
      [DAOCategory.INVESTMENT]: '📈',
      [DAOCategory.EDUCATION]: '📚',
      [DAOCategory.OTHER]: '🔧'
    };
    return icons[category] || '🔧';
  };

  const getStatusColor = (status: DAOStatus) => {
    const colors = {
      [DAOStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [DAOStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
      [DAOStatus.DISSOLVED]: 'bg-red-100 text-red-800',
      [DAOStatus.PENDING]: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: DAOStatus) => {
    const texts = {
      [DAOStatus.ACTIVE]: 'アクティブ',
      [DAOStatus.PAUSED]: '一時停止',
      [DAOStatus.DISSOLVED]: '解散済み',
      [DAOStatus.PENDING]: '保留中'
    };
    return texts[status] || '不明';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-4">
            DAO管理プラットフォーム
          </h1>
          <p className="text-lg text-gray-600">
            分散型自律組織の包括的管理システム
          </p>
          <Link 
            href="/"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">エラー</h3>
            <p>{error}</p>
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-4">🏛️</div>
              <div>
                <p className="text-gray-600 text-sm">総DAO数</p>
                <p className="text-2xl font-light">{daos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-4">👥</div>
              <div>
                <p className="text-gray-600 text-sm">総メンバー数</p>
                <p className="text-2xl font-light">
                  {daos.reduce((sum, dao) => sum + dao.memberCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-4">💰</div>
              <div>
                <p className="text-gray-600 text-sm">総財庫残高</p>
                <p className="text-2xl font-light">
                  {daos.reduce((sum, dao) => sum + parseFloat(dao.treasuryBalance), 0).toFixed(2)} ETH
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-4">📊</div>
              <div>
                <p className="text-gray-600 text-sm">アクティブDAO</p>
                <p className="text-2xl font-light">
                  {daos.filter(dao => dao.status === DAOStatus.ACTIVE).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="DAO名または説明で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">すべてのカテゴリ</option>
                <option value={DAOCategory.DEFI}>DeFi</option>
                <option value={DAOCategory.NFT}>NFT</option>
                <option value={DAOCategory.GAMING}>ゲーミング</option>
                <option value={DAOCategory.SOCIAL}>ソーシャル</option>
                <option value={DAOCategory.GOVERNANCE}>ガバナンス</option>
                <option value={DAOCategory.INVESTMENT}>投資</option>
                <option value={DAOCategory.EDUCATION}>教育</option>
                <option value={DAOCategory.OTHER}>その他</option>
              </select>
              <button
                onClick={loadDAOs}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                更新
              </button>
            </div>
          </div>
        </div>

        {/* DAO一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-600">DAO一覧を読み込み中...</p>
          </div>
        ) : filteredDAOs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏛️</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">DAOが見つかりません</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' ? '検索条件を変更してください' : '最初のDAOを作成しましょう'}
            </p>
            <Link
              href="/create-dao"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              新しいDAOを作成
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDAOs.map((dao) => (
              <div key={dao.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* DAOヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-xl mr-3">{getCategoryIcon(dao.metadata.category)}</div>
                    <div>
                      <h3 className="font-medium text-gray-800 text-lg">{dao.name}</h3>
                      <p className="text-gray-600 text-sm">{dao.symbol}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dao.status)}`}>
                    {getStatusText(dao.status)}
                  </span>
                </div>

                {/* DAO説明 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {dao.description}
                </p>

                {/* DAO統計 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">メンバー数</p>
                    <p className="font-medium">{dao.memberCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">財庫残高</p>
                    <p className="font-medium">{dao.treasuryBalance} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">総供給量</p>
                    <p className="font-medium">{dao.totalSupply}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">作成日</p>
                    <p className="font-medium text-xs">
                      {new Date(dao.createdAt * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* タグ */}
                {dao.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {dao.metadata.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {dao.metadata.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{dao.metadata.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Link
                    href={`/dao/${dao.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center text-sm"
                  >
                    詳細
                  </Link>
                  <Link
                    href={`/dao/${dao.id}/proposals`}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center text-sm"
                  >
                    提案
                  </Link>
                  <Link
                    href={`/dao/${dao.id}/members`}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center text-sm"
                  >
                    メンバー
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 新規DAO作成ボタン */}
        <div className="text-center mt-12">
          <Link
            href="/create-dao"
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-8 rounded-lg transition-colors inline-flex items-center"
          >
            <span className="text-xl mr-2">🚀</span>
            新しいDAOを作成
          </Link>
        </div>
      </div>
    </div>
  );
} 