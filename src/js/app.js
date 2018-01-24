App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Create date time picker
    $('#datepicker').datetimepicker();
    $('#datepicker').data("DateTimePicker").date(new Date());

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      $('#web3-error').text("No web3 provider found! Please install Metamask or use Brave.");
      $('#web3-error').show();
      return;
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

      //Set the contract address
      App.contracts.Hodl.deployed().then(function(instance) {
        $('#contract-address').attr("href", "https://etherscan.io/address/" + instance.address);
      });
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
    $(document).on('click', '#get', App.getTokens);
  },

  checkRetrieval: async() => {
    contract = await App.contracts.Hodl.deployed();
    tokenAddress = $("#check-token-address").val();
    timestamp = await contract.getTimestamp(tokenAddress, { from: web3.eth.accounts[0] });
    if (timestamp.toNumber() == 0) {
      updateText = "You don't have any tokens by that address!"
      $("#check-update-error").show();
      $("#check-update").hide();
      $("#check-update-error").text(updateText);
    } else {
      updateText = "Date of Retrieval: " + new Date(timestamp.toNumber() * 1000);
      $("#check-update-error").hide();
      $("#check-update").show();
      $("#check-update").text(updateText);
    }
  },

  getTokens: async() => {
    $("#get-loading").show();
    $("#get-update").hide();
    $("#get-error").hide();
    tokenAddress = $("#get-token-address").val();
    contract = await App.contracts.Hodl.deployed();
    try {
      receipt = await contract.getTokens(tokenAddress, { from: web3.eth.accounts[0] });
    } catch (e) {
      $("#get-loading").hide();
      $("#get-error").show();
      $("#get-update").hide();
      $("#get-error").text("Get tokens failed. You have no tokens hodl'd or your expiration date must be after now.");
      throw(e);
    }
    $("#get-error").hide();
    $("#get-update").show();
    $("#get-update").html("Successful! TX ID: <a href='https://etherscan.io/tx/" + receipt.tx + "'>Etherscan Transaction Link</a>");
    $("#get-loading").hide();
  },

  hodlTokens: async() => {
    $("#hodl-loading").show();
    $("#hodl-update").hide();
    $("#hodl-error").hide();
    tokenAddress = $("#token-address").val();
    amount = parseInt($("#amount").val());
    date = Math.floor($('#datepicker').data("DateTimePicker").date() / 1000);

    contract = await App.contracts.Hodl.deployed();

    try {
      token = await App.contracts.ERC20.at(tokenAddress);
    } catch (e) {
      $("#hodl-update").hide();
      $("#hodl-loading").hide();
      $("#hodl-error").show();
      $("#hodl-error").text("Invalid Token Address!");
      throw(e);
    }

    try {
      await token.approve(App.contracts.Hodl.address, web3.toWei(amount, 'ether'), { from: web3.eth.accounts[0] });
    } catch (e) {
      $("#hodl-update").hide();
      $("#hodl-loading").hide();
      $("#hodl-error").show();
      $("#hodl-error").text("Amount entered exceeds your token amount.");
      throw(e);
    }

    try {
      receipt = await contract.hodlTokens(token.address, web3.toWei(amount, 'ether'), date, { from: web3.eth.accounts[0] });
    } catch(e) {
      $("#hodl-loading").hide();
      $("#hodl-error").show();
      $("#hodl-update").hide();
      $("#hodl-error").text("Contract error!");
      throw(e);
    }

    $("#hodl-error").hide();
    $("#hodl-update").show();
    $("#hodl-update").html("Successful! TX ID: <a href='https://etherscan.io/tx/" + receipt.tx + "'>Etherscan Transaction Link</a>");
    $("#hodl-loading").hide();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
