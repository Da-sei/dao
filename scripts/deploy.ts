import { ethers } from "hardhat";

async function main() {
  console.log("🚀 DAO The World デプロイ開始...");

  try {
    // 1. DAOファクトリーをデプロイ
    console.log("📦 DAOファクトリーをデプロイ中...");
    const DAOFactory = await ethers.getContractFactory("DAOFactory");
    const daoFactory = await DAOFactory.deploy();
    await daoFactory.waitForDeployment();

    const factoryAddress = await daoFactory.getAddress();
    console.log("✅ DAOファクトリー デプロイ完了:", factoryAddress);

    // 2. サンプルDAOを作成
    console.log("🏛️ サンプルDAOを作成中...");
    const daoName = "DAO The World";
    const daoSymbol = "DTW";
    const initialSupply = ethers.parseEther("1000000"); // 1,000,000 DTW

    const createDAOTx = await daoFactory.createDAO(daoName, daoSymbol, initialSupply);
    const receipt = await createDAOTx.wait();

    // イベントからDAO情報を取得
    const event = receipt?.logs.find(log => {
      try {
        return daoFactory.interface.parseLog(log as any)?.name === "DAOCreated";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsedEvent = daoFactory.interface.parseLog(event as any);
      const [name, symbol, tokenAddress, governanceAddress, creator, daoId] = parsedEvent?.args || [];

      console.log("✅ サンプルDAO作成完了!");
      console.log("📊 DAO情報:");
      console.log(`   DAO名: ${name}`);
      console.log(`   シンボル: ${symbol}`);
      console.log(`   トークンアドレス: ${tokenAddress}`);
      console.log(`   ガバナンスアドレス: ${governanceAddress}`);
      console.log(`   作成者: ${creator}`);
      console.log(`   DAO ID: ${daoId}`);
    }

    // 3. 作成されたDAOの情報を取得
    const daoCount = await daoFactory.getDAOCount();
    console.log(`📈 作成されたDAO数: ${daoCount}`);

    // 4. 最初のDAOの詳細情報を取得
    const daoInfo = await daoFactory.getDAO(0);
    console.log("🔍 DAO詳細情報:");
    console.log(`   名前: ${daoInfo.name}`);
    console.log(`   シンボル: ${daoInfo.symbol}`);
    console.log(`   トークンアドレス: ${daoInfo.tokenAddress}`);
    console.log(`   ガバナンスアドレス: ${daoInfo.governanceAddress}`);
    console.log(`   作成者: ${daoInfo.creator}`);
    console.log(`   作成日時: ${new Date(Number(daoInfo.createdAt) * 1000).toLocaleString()}`);

    // 5. トークンコントラクトの情報を取得
    const tokenContract = await ethers.getContractAt("MyDAOToken", daoInfo.tokenAddress);
    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();
    const totalSupply = await tokenContract.totalSupply();
    const owner = await tokenContract.owner();

    console.log("🪙 トークン情報:");
    console.log(`   名前: ${tokenName}`);
    console.log(`   シンボル: ${tokenSymbol}`);
    console.log(`   総供給量: ${ethers.formatEther(totalSupply)} ${tokenSymbol}`);
    console.log(`   オーナー: ${owner}`);

    // 6. ガバナンスコントラクトの設定を取得
    const governanceContract = await ethers.getContractAt("DAOGovernance", daoInfo.governanceAddress);
    const settings = await governanceContract.getSettings();

    console.log("⚙️ ガバナンス設定:");
    console.log(`   最小投票期間: ${settings.minVotingPeriod} 秒 (${Number(settings.minVotingPeriod) / 86400} 日)`);
    console.log(`   最大投票期間: ${settings.maxVotingPeriod} 秒 (${Number(settings.maxVotingPeriod) / 86400} 日)`);
    console.log(`   クォーラム: ${settings.quorumPercentage}%`);
    console.log(`   最小提案トークン数: ${ethers.formatEther(settings.minProposalTokens)} ${tokenSymbol}`);

    console.log("\n🎉 DAO The World デプロイ完了!");
    console.log("\n📋 次のステップ:");
    console.log("1. フロントエンドでDAOファクトリーアドレスを更新");
    console.log("2. 提案を作成して投票システムをテスト");
    console.log("3. メンバーにトークンを配布してDAOを開始");

  } catch (error) {
    console.error("❌ デプロイ失敗:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 予期しないエラー:", error);
    process.exit(1);
  });