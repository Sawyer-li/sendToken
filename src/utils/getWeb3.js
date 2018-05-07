import Web3 from 'web3'
function updateWeb3(type){
  var mainAddress = 'https://mainnet.infura.io/yaPMQARpCtJkzrz3vIo0';
  var ropstenAddress = 'https://ropsten.infura.io/yaPMQARpCtJkzrz3vIo0';
  var rinkebyAddress = 'https://rinkeby.infura.io/yaPMQARpCtJkzrz3vIo0';
  var kovanAddress = 'https://kovan.infura.io/yaPMQARpCtJkzrz3vIo0';
  var updateAddress;
  switch(type){
    case 'main':
      updateAddress = mainAddress;
      break;
    case 'ropsten':
      updateAddress = ropstenAddress;
      break;
    case 'rinkeby':
      updateAddress = rinkebyAddress;
      break;
    case 'kovan':
      updateAddress = kovanAddress;
      break;
    default:
      alert('error');
  }
  var web3 = window.web3;  
  web3 = new Web3(updateAddress);
  return web3;
}
export {updateWeb3} 
let getWeb3 = new Promise(function(resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function() {
    var results
    var web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    // typeof web3 !== 'undefined'
    if (false) {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)

      results = {
        web3: web3
      }

      console.log('Injected web3 detected.');

      resolve(results)
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      // https://ropsten.infura.io/yaPMQARpCtJkzrz3vIo0
      // http://127.0.0.1:9545
      // https://192.168.1.25:8545
      var provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/yaPMQARpCtJkzrz3vIo0')

      web3 = new Web3(provider)

      results = {
        web3: web3
      }

      console.log('No web3 instance injected, using Local web3.');

      resolve(results)
    }
  })
})
export default getWeb3
