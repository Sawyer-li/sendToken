import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import OschContract from '../build/contracts/OpenSourceChainToken3.json'
import getWeb3 from './utils/getWeb3'
import Tx from 'ethereumjs-tx'
import {updateWeb3} from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './css/style.css'
import './App.css'

function Page(props){
    return <FirstPage/>
}

function FirstPage(props) {
  return <h1></h1>
}
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storageValue: 0,
      web3: null,
      sendAddress: '',
      sendPrivate: '',
      contactAddress: '',
      recAddress: '',
      drecAddress: [],           //多个收地址
      tx: '',
      blockNumber: 1,
      host: '',
      messTimer: '',
      waitTimer: '',
      waitTime: 0,
      successMess: [],
      errorMess: [],
      errorArr: [],
      errorMes: '',
      errorNum: 0,
      totalTran: 0,
      web3GasNum: 1
    }
    this.sendAddressChange = this.sendAddressChange.bind(this)
    this.sendPrivateChange = this.sendPrivateChange.bind(this)
    this.recAddressChange = this.recAddressChange.bind(this)
    this.contactChange =  this.contactChange.bind(this)
    this.drecAddressChange =  this.drecAddressChange.bind(this)
    this.sendAllTransation = this.sendAllTransation.bind(this);
    this.web3TypeChange = this.web3TypeChange.bind(this);
    this.web3GasNum = this.web3GasNumChange.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
     this.instantiateContract();
    })
    .catch((e) => {
      console.log(e);
      console.log('Error finding web3.')
    })
  }
  //web3远程地址改变则更新
  web3TypeChange(event){
    var _this = this;
    var uWeb3 = updateWeb3(event.target.value);
    this.setState({
      web3: uWeb3   
    },()=>{
      _this.instantiateContract();
    })
  }
  instantiateContract() {
    //_web3.eth.defaultAccount =  '0xe06e4c820c1bc1f36a17bfdfdf0fea0b6992267b';
    var _web3 = this.state.web3;
    var _this = this;
    this.setState({host: _web3.currentProvider.host})
    _web3.eth.getBlockNumber()
        .then(function(res){
            _this.setState({blockNumber: res})
        })
    //get now block nowNumber
    nowNumber();
    function nowNumber(){
      clearInterval(_this.state.messTimer);
      _this.setState({messTimer: setInterval(function(){
        _web3.eth.getBlockNumber()
        .then(function(res){
            _this.setState({blockNumber: res})
        })
      },10000)})
    }
    /*
    var contract_address =  '0x3fd892427916ef254dd31d5775f4959ffe1101cd'
    var address1 = '0xe06e4c820c1bc1f36a17bfdfdf0fea0b6992267b';
    var address2 = '0xb8771cbe344e13f9316c94078f34d724ceb99ab3';
    var privKey = '062ef8d6738a9a3d5119a8c46f20c7d617e945f7e1ae401ae190c9dc17bee6c8';
    */
  }
  sendAllTransation(){
      var _web3 = this.state.web3;
      var _this = this;
      var sendAddress = this.state.sendAddress;
      var sendPrivate= this.state.sendPrivate;
      var contactAddress= this.state.contactAddress;
      var drecAddress = this.state.drecAddress;

      if(sendAddress==''||sendPrivate==''||contactAddress==''||drecAddress==''){
        alert('有字段为空');
        return;
      }
      try{
        var recAddressArr =  JSON.parse(drecAddress)
      }catch(e){
        alert('请输入严格格式的json字符串'); 
      }
      _this.setState({totalTran: recAddressArr.length})
      var nonce;   //只使用一次，但大于当前获取的nonce将不会立即执行，前面的小号补齐才会执行
      _web3.eth.getTransactionCount(sendAddress).then(function(res){
        var i = 0;
        var sendInterval = setInterval(function(){
            if(i>=recAddressArr.length){
                clearInterval(sendInterval);
                return;
            }
            nonce = parseInt(res)+parseInt(i);
            _this.sendSingleTransation(contactAddress,sendAddress,recAddressArr[i],sendPrivate,nonce);
            i++;
        },500)
        /*
        for(var i in recAddressArr){
           nonce = parseInt(res)+parseInt(i);
           _this.sendSingleTransation(contactAddress,sendAddress,recAddressArr[i],sendPrivate,nonce);
        }       
        */
    })
    //开始计算等待时间
    _this.state.waitTimer = setInterval(function(){
        var newTime = _this.state.waitTime+1;
        _this.setState({waitTime: newTime});
    },1000)
  }
  sendSingleTransation(contract_address,address1,recJson,privKey,nonce){
    console.log(nonce);
    //在一个十六进制前面加0
    function addPreZero(num){
        var t = (num+'').length,
        s = '';
        for(var i=0; i<64-t; i++){
            s += '0';
        }
        return s+num;
    }
    var _web3 = this.state.web3;
    var _this = this;
    var address2 = recJson.address;
    var num = recJson.num+"1000000000000000000";
    try{
        var hexNum = _web3.utils.toHex(num); 
    }catch(e){
        console.log(num);
    }
    hexNum = hexNum.slice(2, hexNum.length);
    hexNum = addPreZero(hexNum);
    var rec = address2.slice(2,address2.length);
    address2 = rec;
    //交易数据
    const txData = {
        nonce: _web3.utils.toHex(nonce),
        gasLimit: _web3.utils.toHex(99000),   //
        gasPrice: _web3.utils.toHex(3e9),    // 10 Gwei
        to: contract_address,
        from: address1,
        value: '0x00',         //web3.utils.toHex(web3.utils.toWei('1000000000000', 'wei'))
        data: '0x'+'a9059cbb'+'000000000000000000000000'+address2+hexNum
    }
    const privateKey = new Buffer(privKey, 'hex')
    const transaction = new Tx(txData)
    //私钥签名交易
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    //发送签名交易，不要以太坊节点签名
    var tran = _web3.eth.sendSignedTransaction('0x' + serializedTx)
    tran.on('confirmation', (confirmationNumber, receipt) => {
      //console.log('confirmation: ' + confirmationNumber);
    });
    tran.on('transactionHash', hash => {
        console.log('hash');
        console.log(hash);
    });
    tran.on('receipt', receipt => {
        clearInterval(_this.state.waitTimer);
        var asuccessMess = { address: recJson.address, hash:receipt.transactionHash }
        _this.state.successMess.push(asuccessMess);
        var sBox = document.getElementById('successBox');
        sBox.scrollTop = sBox.scrollHeight;
    });
    tran.on('error', (err)=>{
        console.log('出现错误请查看控制台');
        console.log(err);        
        _this.state.errorArr.push(recJson);
        var errorStr =  JSON.stringify(_this.state.errorArr);
        _this.setState({errorMes: errorStr})
        var errorNum = _this.state.errorNum+1;
        _this.setState({errorNum: errorNum})
    });
  } 
  contactChange(event){
    this.setState({contactAddress: event.target.value })
  }
  sendAddressChange(event){
    this.setState({sendAddress: event.target.value }) 
  }
  recAddressChange(event){
    var recStr = event.target.value;
    this.setState({
      recAddress: event.target.value, 
    }) 
  } 
  sendPrivateChange(event){
    this.setState({sendPrivate: event.target.value }) 
  }
  drecAddressChange(event){
    this.setState({drecAddress: event.target.value }) 
  }
  web3GasNumChange(event){
    this.setState({web3GasNum: event.target.value })
  }
  render() {
    let successMess =  this.state.successMess.map((value,key)=>{
        return(
            <div  key={key}>
               <div>address: {value.address}</div><div>hash: {value.hash}</div>
           </div>
        )
    }) 
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">OSCH SendToken Tool</a>
        </nav>
        <main className="container">
            <div className="fl" >
                <div className="pure-u-1-1">
                    <h3>当前本地区块高度为:{this.state.blockNumber}</h3>
                    <h3>当前服务提供地址：{this.state.host}</h3>
                    <div className="inputBox">
                        <strong>选择服务类型：</strong>
                        <select onChange={this.web3TypeChange}>
                            <option value="main">main</option>
                            <option value="ropsten">ropsten</option>
                            <option value="rinkeby">rinkeby</option>
                            <option value="kovan">kovan</option>
                        </select>
                    </div>
                    <div>
                       <strong>输入gas出价,默认为1Gwei：</strong>
                       <select onChange={this.web3GasNum}>
                            <option value={1}>1Gwei</option>
                            <option value={2}>2Gwei</option>
                            <option value={3}>3Gwei</option>
                            <option value={4}>4Gwei</option>
                        </select>
                    </div>
                    <div className="inputBox">
                      <strong>发送方公钥：</strong>
                      <input type="text" defaultValue={this.state.sendAddress} onChange={this.sendAddressChange}/>
                    </div>
                    <div className="inputBox">
                      <strong>发送方私钥：</strong>
                      <input type="password" defaultValue={this.state.sendPrivate} onChange={this.sendPrivateChange} />
                    </div>
                    <div className="inputBox">
                      <strong>合约地址：&nbsp;&nbsp;&nbsp;&nbsp;</strong>
                      <input type="text" defaultValue={this.state.contactAddress} onChange={this.contactChange} />
                    </div>
                    <div className="inputBox">
                        <h4>收币:</h4>
                        <textarea className="reclist"  type="text"  defaultValue={this.state.drecAddressChange}  onChange={this.drecAddressChange}/>
                    </div>
                    <button onClick={this.sendAllTransation}>确认</button>
                </div>
            </div>
            <div className="fr logBox">
              <h3>你发起的交易总数为<em>{this.state.totalTran}</em></h3>
              <h3>已经等待时间<em>{this.state.waitTime}</em>秒</h3> 
              <h3>已经完成<em>{this.state.successMess.length}</em>个</h3>
              <h3>已完成的交易好</h3>
              <div className="successBox" id="successBox">
                {successMess}
              </div>
              <h3>失败数量<em>{this.state.errorNum}</em></h3>
              <h3>失败的地址</h3>
              <div className="failBox">{this.state.errorMes}</div>
            </div>
        </main>
      </div>
    );
  }
}

export default App
