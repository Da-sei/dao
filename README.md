# DAO The World

A decentralized autonomous organization (DAO) implementation with ERC20 governance token built on Ethereum.

## 🚀 Features

- **ERC20 Governance Token**: `MyDAOToken` with minting capabilities
- **Access Control**: OpenZeppelin's `Ownable` pattern for secure ownership management
- **Comprehensive Testing**: Full test coverage for all contract functionality
- **Gas Optimization**: Optimized Solidity compiler settings
- **TypeScript Support**: Full TypeScript integration for development

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hardhat

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd DAO_the_World
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional):

```bash
cp .env.example .env
```

## 🔧 Usage

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy Contracts

```bash
# Deploy to local network
npm run deploy:local

# Deploy to specific network
npm run deploy
```

### Start Local Network

```bash
npm run node
```

## 📁 Project Structure

```
DAO_the_World/
├── contracts/
│   ├── MyDAO.sol          # Main DAO token contract
│   └── Lock.sol           # Time-lock contract (example)
├── scripts/
│   └── deploy.ts          # Deployment script
├── test/
│   ├── MyDAOToken.ts      # Token contract tests
│   └── Lock.ts            # Lock contract tests
├── hardhat.config.ts      # Hardhat configuration
└── package.json           # Project dependencies
```

## 🔐 Contract Details

### MyDAOToken

**Features:**

- ERC20 compliant token
- Minting functionality (owner only)
- Access control via OpenZeppelin Ownable
- Event emission for transparency

**Key Functions:**

- `mint(address to, uint256 amount)`: Mint new tokens (owner only)
- Standard ERC20 functions: `transfer`, `approve`, `transferFrom`

**Security Features:**

- Zero address validation
- Amount validation
- Access control checks
- Event logging

## 🧪 Testing

The project includes comprehensive tests covering:

- Contract deployment
- Token minting functionality
- Access control
- ERC20 standard functions
- Error conditions

Run tests with:

```bash
npm test
```

## 🔧 Development

### Adding New Features

1. Create new contracts in `contracts/`
2. Add corresponding tests in `test/`
3. Update deployment scripts if needed
4. Run tests to ensure everything works

### Gas Optimization

The project uses Hardhat's gas reporter to monitor gas usage:

```bash
REPORT_GAS=true npm test
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## ⚠️ Security

This is experimental software. Use at your own risk and always audit contracts before deploying to mainnet.

## 📞 Support

For questions or issues, please open an issue on GitHub.
