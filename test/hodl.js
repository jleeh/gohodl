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

    // Function to always round numbers to 7 stabilise tests
    function toEther(value) {
        return Number(value).toFixed(7);  
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
        accountBalance = web3.fromWei(accountBalance.toNumber(), 'ether');

        await token.approve(Hodl.address, web3.toWei(10000, 'ether'));
        await hodlContract.hodlTokens(Token.address, web3.toWei(10000, 'ether'), timestamp, { from: accounts[0] });
        
        contractTimestamp = await hodlContract.getTimestamp(Token.address);
        updatedBalance = await token.balanceOf(accounts[0]);

        assert.equal(timestamp, contractTimestamp.toNumber(), "Timestamp returned from contract should equal what was generated");
        assert.equal(accountBalance - 10000, web3.fromWei(updatedBalance.toNumber(), 'ether'), "Balance should of reduced after hodl'n");
    });

    /**
     * Shouldn't be able to add tokens of the existing erc20 address
     */
    it("shouldn't be able to add tokens of the existing erc20 address", async() => {
        await token.approve(Hodl.address, web3.toWei(10000, 'ether'));
        try {
            await hodlContract.hodlTokens(Token.address, web3.toWei(10000, 'ether'), timestamp, { from: accounts[0] });
            assert.fail;
        } catch(e) {
            assert.include(e.message, "opcode", "Trying to get the tokens prior to the retrieval date should result in an exception");
        }
        
    });

    /**
     * Ensure tokens can't be retrieved before the retrieval date
     */
    it("shoudn't be able to get the tokens before retrieval date", async() => {
        try {
            await hodlContract.getTokens(Token.address);
            assert.fail;
        } catch (e) {
            assert.include(e.message, "opcode", "Trying to get the tokens prior to the retrieval date should result in an exception");
        }
    });
    
    /**
     * Get the tokens back from the contract
     */
    it("should be able to get the tokens back after the retrival date has passed", async() => {
        await sleep(1000);
        await hodlContract.getTokens(Token.address, { from: accounts[0] });
        updatedBalance = await token.balanceOf(accounts[0]);

        assert.equal(accountBalance, web3.fromWei(updatedBalance.toNumber(), 'ether'), "Balance should of returned to normal");
    });
});