// File: `truffle-config.js` (edited for 7nodes example)
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 22000, // was 8545
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    },
    node1: {
      host: "127.0.0.1",
      port: 22000, // was 8545
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
      
    },
    node2:  {
      host: "127.0.0.1",
      port: 22001,
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    },
    node3:  {
      host: "127.0.0.1",
      port: 22002,
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    },
    node4:  {
      host: "127.0.0.1",
      port: 22003,
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    },
    node5:  {
      host: "127.0.0.1",
      port: 22004,
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    }
  }
};