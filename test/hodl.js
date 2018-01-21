/**
 * Hodl Unit Tests
 */

// Contract Artifacts from Truffle
const Hodl = artifacts.require("Hodl");
const Token = artifacts.require("LinkToken");

contract('Hodl', accounts => {

    // Get timestamp in seconds
    function getTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    // Sleep the test, just to make sure
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Account balance for tests
    var accountBalance;

    /**
     * Gets the contract instances and transfers LINK to the stakers prior to test execution
     */
    before(async() => {
        // Get the contracts
        hodlContract = await Hodl.deployed();
        token = await Token.deployed();
    });

    /**
     * Transfer some fake LINK to the Hodl contract
     */
    it("should transfer tokens to the contract to hodl", async() => {
        timestamp = getTimestamp() + 1; // Add 1 second to now
        
        accountBalance = await token.balanceOf(accounts[0]);

        await token.approve(Hodl.address, 10000);
        await hodlContract.hodlTokens(Token.address, 10000, timestamp, { from: accounts[0] });
        
        contractTimestamp = await hodlContract.getTimestamp(Token.address);
        updatedBalance = await token.balanceOf(accounts[0]);

        assert.equal(timestamp, contractTimestamp.toNumber(), "Timestamp returned from contract should equal what was generated");
        assert.equal(accountBalance - 10000, updatedBalance, "Balance should of reduced after hodl'n");
    });

    /**
     * Ensure tokens can't be retrieved before the retrieval date
     */
    it("shoudn't be able to get the tokens before retrieval date", async() => {
        try {
            await hodlContract.getTokens(Token.address);
            assert.fail;
        } catch (e) {
            assert.include(e.message, "revert", "Trying to get the tokens prior to the retrieval date should result in an exception");
        }
    });
    
    /**
     * Get the tokens back from the contract
     */
    it("should be able to get the tokens back after the retrival date has passed", async() => {
        await sleep(1000);
        await hodlContract.getTokens(Token.address);
        updatedBalance = await token.balanceOf(accounts[0]);

        assert.equal(accountBalance.toNumber(), updatedBalance.toNumber(), "Balance should of returned to normal");
    });
});