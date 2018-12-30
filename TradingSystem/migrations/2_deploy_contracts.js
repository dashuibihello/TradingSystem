var TradingSystem = artifacts.require("./TradingSystem.sol");
var Purchase = artifacts.require("./Purchase.sol");

module.exports = function(deployer) {
  deployer.deploy(TradingSystem);
  deployer.deploy(Purchase);
};