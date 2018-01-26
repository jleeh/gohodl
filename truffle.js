module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Default
    },
    ropsten:  {
      network_id: 3,
      host: "geth.ropsten.lp",
      port:  8545,
      gas:   2680000,
      from: "0xab12e6280e1024825f4880268a9c9618a2dca3f5"
    }
  },
  rpc: {
    host: 'localhost',
    post: 8080
  }
};
