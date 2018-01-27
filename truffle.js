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
      gas:   4712388,
      from: "0xab12e6280e1024825f4880268a9c9618a2dca3f5"
    },
    mainnet:  {
      network_id: 1,
      host: "geth.lp",
      port:  8545,
      gas:   4712388,
      from: "0x32D1A6516d0a2174f4cd0D7a30Aa7962d532c98C"
    }
  },
  rpc: {
    host: 'localhost',
    post: 8080
  }
};
