'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { getDAOFactory, getMockDAOFactory } from '@/config/web3';
import Link from 'next/link';

interface DAOCreationForm {
  name: string;
  symbol: string;
  initialSupply: string;
}

export default function CreateDAO() {
  const [form, setForm] = useState<DAOCreationForm>({
    name: '',
    symbol: '',
    initialSupply: '1000000'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isMockMode, setIsMockMode] = useState<boolean>(true); // デフォルトでモックモード

  const handleInputChange = (field: keyof DAOCreationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const createDAO = async () => {
    if (!form.name || !form.symbol || !form.initialSupply) {
      setError('すべてのフィールドを入力してください。');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const factory = isMockMode ? getMockDAOFactory() : getDAOFactory();
      const initialSupply = ethers.parseEther(form.initialSupply);
      
      console.log('DAO作成を開始...', {
        name: form.name,
        symbol: form.symbol,
        initialSupply: form.initialSupply,
        mode: isMockMode ? 'Mock' : 'MetaMask'
      });

      const tx = await factory.createDAO(
        form.name,
        form.symbol,
        initialSupply
      );

      console.log('トランザクション送信:', tx.hash);
      setSuccess('DAO作成中... トランザクションを確認してください。');

      const receipt = await tx.wait();
      console.log('DAO作成完了:', receipt);

      // イベントからDAO情報を取得
      const event = receipt?.logs.find((log: any) => {
        try {
          return factory.interface.parseLog(log as any)?.name === "DAOCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = factory.interface.parseLog(event as any);
        const [name, symbol, tokenAddress, governanceAddress, creator, daoId] = parsedEvent?.args || [];

        setSuccess(`DAO作成完了！\nDAO名: ${name}\nシンボル: ${symbol}\nトークンアドレス: ${tokenAddress}\nガバナンスアドレス: ${governanceAddress}`);
      } else {
        setSuccess('DAO作成が完了しました！');
      }

      // フォームをリセット
      setForm({
        name: '',
        symbol: '',
        initialSupply: '1000000'
      });

    } catch (error) {
      console.error('DAO作成エラー:', error);
      setError(`DAO作成エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-4">
            DAO作成
          </h1>
          <p className="text-lg text-gray-600">
            新しい分散型自律組織を作成しましょう
          </p>
          <Link 
            href="/"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>

        {/* モード切り替え */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">接続モード</h3>
                <p className="text-gray-600 text-sm">
                  {isMockMode ? 'モックウォレット（推奨）' : 'MetaMask'}
                </p>
              </div>
              <button
                onClick={() => setIsMockMode(!isMockMode)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isMockMode ? 'MetaMaskに切り替え' : 'モックに切り替え'}
              </button>
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">エラー</h3>
            <p>{error}</p>
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">成功</h3>
            <pre className="whitespace-pre-wrap text-sm">{success}</pre>
          </div>
        )}

        {/* DAO作成フォーム */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-light text-gray-800 mb-6">新しいDAOを作成</h2>
            
            <div className="space-y-6">
              {/* DAO名 */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  DAO名
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="例: My Awesome DAO"
                  className="w-full p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-lg"
                />
                <p className="text-gray-600 text-sm mt-1">
                  あなたのDAOの名前を入力してください
                </p>
              </div>

              {/* トークンシンボル */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  トークンシンボル
                </label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  placeholder="例: MAD"
                  maxLength={10}
                  className="w-full p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-lg uppercase"
                />
                <p className="text-gray-600 text-sm mt-1">
                  ガバナンストークンのシンボル（最大10文字）
                </p>
              </div>

              {/* 初期供給量 */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  初期供給量
                </label>
                <input
                  type="number"
                  value={form.initialSupply}
                  onChange={(e) => handleInputChange('initialSupply', e.target.value)}
                  placeholder="1000000"
                  min="1"
                  className="w-full p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-lg"
                />
                <p className="text-gray-600 text-sm mt-1">
                  作成時に発行されるトークン数（小数点なし）
                </p>
              </div>

              {/* 作成ボタン */}
              <button
                onClick={createDAO}
                disabled={loading || !form.name || !form.symbol || !form.initialSupply}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-4 px-8 rounded-lg text-xl transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    DAO作成中...
                  </div>
                ) : (
                  `DAOを作成 (${isMockMode ? 'モック' : 'MetaMask'})`
                )}
              </button>
            </div>

            {/* 情報カード */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">作成されるDAOの機能</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">投票システム</h4>
                  <ul className="text-sm space-y-1">
                    <li>• トークン保有量に基づく投票権</li>
                    <li>• 提案作成・投票・実行</li>
                    <li>• クォーラム設定（10%）</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">ガバナンス設定</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 投票期間: 1日〜7日</li>
                    <li>• 最小提案トークン: 1000</li>
                    <li>• 透明な投票記録</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 