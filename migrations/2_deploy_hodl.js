const config = require('../truffle.js');

var Hodl = artifacts.require("./Hodl.sol");
var LinkToken = artifacts.require("./LinkToken.sol");

module.exports = function(deployer, network) {
  return deployer.deploy(Hodl).then(function() {
      if (network.includes("develop") || network.includes("ropsten")) {
        return deployer.deploy(LinkToken);
      }
  });
};
