module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Default
    },
    ropsten:  {
      network_id: 3,
      host: "",
      port:  8545,
      gas:   2680000,
      from: ""
    }
  },
  rpc: {
    host: 'localhost',
    post: 8080
  }
};
