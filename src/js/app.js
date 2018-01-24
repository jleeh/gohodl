App = {
  web3Provider: null,
  contracts: {},
  etherscan: { main: "https://etherscan.io/", ropsten: "https://ropsten.etherscan.io/" },
  currentEtherscan: "",

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

      // Switch the etherscan URL and show a notice depending on the network
      networkId = web3.version.network;
      switch (networkId) {
        case "1":
          App.currentEtherscan = App.etherscan.main;
          break;
        
        case "3":
          App.currentEtherscan = App.etherscan.ropsten;
          $('#web3-ropsten').text("You're currently connected to Ropsten, using Ropsten GoHodl contract.");
          $('#web3-ropsten').show();
          break;

        default:
          $('#web3-error').text("Contract isn't deployed to this network. App is disabled.");
          $('#web3-error').show();
          break;
      }
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
        $('#web3-error').hide();
        $('#contract-address').attr("href", App.currentEtherscan + "address/" + instance.address);
        $('#contract-address').text("Contract");
        $("#hodl").prop("disabled", false);
        $("#check").prop("disabled", false);
        $("#get").prop("disabled", false);
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
    $("#get").prop("disabled", true);
    tokenAddress = $("#get-token-address").val();
    contract = await App.contracts.Hodl.deployed();
    try {
      receipt = await contract.getTokens(tokenAddress, { from: web3.eth.accounts[0] });
    } catch (e) {
      $("#get-loading").hide();
      $("#get-error").show();
      $("#get-update").hide();
      $("#get-error").text("Get tokens failed. You have no tokens hodl'd or your expiration date must be after now.");
      $("#get").prop("disabled", false);
      throw(e);
    }
    $("#get-error").hide();
    $("#get-update").show();
    $("#get-update").html("Contract request created. TX ID: <a href='" + App.currentEtherscan + "tx/" + receipt.tx + "'>Etherscan Transaction Link</a>");
    $("#get-loading").hide();
    $("#get").prop("disabled", false);
  },

  hodlTokens: async() => {
    $("#hodl-loading").show();
    $("#hodl-update").hide();
    $("#hodl-error").hide();
    $("#hodl").prop("disabled", true);
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
      $("#hodl").prop("disabled", false);
      throw(e);
    }

    try {
      await token.approve(App.contracts.Hodl.address, web3.toWei(amount, 'ether'), { from: web3.eth.accounts[0] });
    } catch (e) {
      $("#hodl-update").hide();
      $("#hodl-loading").hide();
      $("#hodl-error").show();
      $("#hodl-error").text("Amount entered exceeds your token amount.");
      $("#hodl").prop("disabled", false);
      throw(e);
    }

    try {
      receipt = await contract.hodlTokens(token.address, web3.toWei(amount, 'ether'), date, { from: web3.eth.accounts[0] });
    } catch(e) {
      $("#hodl-loading").hide();
      $("#hodl-error").show();
      $("#hodl-update").hide();
      $("#hodl-error").text("Contract error!");
      $("#hodl").prop("disabled", false);
      throw(e);
    }

    $("#hodl-error").hide();
    $("#hodl-update").show();
    $("#hodl-update").html("Contract request created. TX ID: <a href='" + App.currentEtherscan + "tx/" + receipt.tx + "'>Etherscan Transaction Link</a>");
    $("#hodl-loading").hide();
    $("#hodl").prop("disabled", false);
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
