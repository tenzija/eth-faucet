const HDWalletProvider = require("@truffle/hdwallet-provider")
const keys =  require("./keys.json")

module.exports = {
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*",
    },
    goerli: {
      provider: function () {
        return new HDWalletProvider(
          keys.MNEMONIC,
          `https://goerli.infura.io/v3/${keys.INFURA_PROJECT_ID}`
        );
      },
      network_id: 5,
      gas: 5500000, // Gas Limit, How much gas we are willing to spent
      gasPrice: 20000000000, // how much we are willing to spent for unit of gas
      confirmations: 2, // number of blocks to wait between deployment
      timeoutBlocks: 200,
      networkCheckTimeout: 10000

      // > transaction hash:    0xef67eb42382828156d16ccc9a74db22351cffbb2c5bf18dd6a2b3b9c313f3e02
      // > contract address:    0x3102D963524f34d025c198BcA53c466b04e82200
      
    },
  },
  compilers: {
    solc: {
      version: "^0.8.4",
    }
  }
}