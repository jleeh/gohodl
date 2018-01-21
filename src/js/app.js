App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Create date time picker
    $('#date').datetimepicker();

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Hodl.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var HodlArtifact = data;
      App.contracts.Hodl = TruffleContract(HodlArtifact);
    
      // Set the provider for our contract
      App.contracts.Hodl.setProvider(App.web3Provider);
    });
    $.getJSON('ERC20.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ERC20Artifact = data;
      App.contracts.ERC20 = TruffleContract(ERC20Artifact);
    
      // Set the provider for our contract
      App.contracts.ERC20.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#check', App.checkRetrieval);
    $(document).on('click', '#hodl', App.hodlTokens);
  },

  checkRetrieval: async(accounts) => {
    contract = await App.contracts.Hodl.deployed();
    tokenAddress = $("#check-token-address").val();
    timestamp = await contract.getTimestamp(tokenAddress, { from: accounts[0] });
    
    if (timestamp.toNumber() == 0) {
      updateText = "You don't have any tokens with that address hodl'd!"
      $("#check-update-error").show();
      $("#check-update").hide();
      $("#check-update-error").text(updateText);
    } else {
      updateText = "<strong>Date of Retrieval:</strong> " + new Date(timestamp.toNumber() * 1000);
      $("#check-update-error").hide();
      $("#check-update").show();
      $("#check-update").text(updateText);
    }
  },

  hodlTokens: async(accounts) => {
    tokenAddress = $("#token-address").val();
    amount = parseInt($("#amount").val());
    date = Math.floor($('#date').data("DateTimePicker").date() / 1000);

    contract = await App.contracts.Hodl.deployed();
    try {
      token = await App.contracts.ERC20.at(tokenAddress);
    } catch (e) {
      updateText = "Invalid Token Address!";
      $("#hodl-update").hide();
      $("#hodl-error").show();
      $("#hodl-error").text(updateText);
      return;
    }
    try {
      await token.approve(App.contracts.Hodl.address, amount, { from: accounts[0] });
    } catch (e) {
      updateText = "Amount entered exceeds your token amount.";
      $("#hodl-update").hide();
      $("#hodl-error").show();
      $("#hodl-error").text(updateText);
      return;
    }
    tx = await contract.hodlTokens(tokenAddress, amount, timestamp, { from: accounts[0] });
    console.log(tx);
    
    if (tx.id !== "undefined") {
      updateText = "Successful! TX ID: " + tx.id;
      $("#hodl-error").hide();
      $("#hodl-update").show();
      $("#hodl-update").text(updateText);
    } else {
      updateText = "Contract error! Do you have enough of that token?";
      $("#hodl-error").show();
      $("#hodl-update").hide();
      $("#hodl-error").text(updateText);
    }
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
