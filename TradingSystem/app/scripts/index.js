// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import TradingSystemArtifact from '../../build/contracts/TradingSystem.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const TradingSystem = contract(TradingSystemArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let userAccount
let userId
let token = false

const App = {
  start: function () {
    TradingSystem.setProvider(web3.currentProvider)
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }
      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }
      accounts = accs
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  getUserBalance: function (message) {
    TradingSystem.deployed().then(function (instance) {
      return instance.getUserBalance({ from: userAccount})
    }).then(function (balance) {
      document.getElementById('Lbalance').innerHTML = Number(balance) / 1000000000000000000
    })
  },

  SigninOrup: function () {
    const self = this
    let name = document.getElementById('username').value
    let password = document.getElementById('password').value
    let account = document.getElementById('account').value

    TradingSystem.deployed().then(function (instance) {
      return instance.registOrLogin(name, password, { from: accounts[account], gas:300000 })
    }).then(function (str) {
      document.getElementById('userRegist').className = 'hide'
      document.getElementById('userInformation').className = 'show'
      const Lusername = document.getElementById('Lusername')
      Lusername.innerHTML = name
      const Laccount = document.getElementById('Laccount')
      Laccount.innerHTML = accounts[account]
      userAccount = accounts[account]
      //刷新用户余额
      self.getUserBalance()
      userId = account
      token = true
      document.getElementById('merchants').value = userId
      //刷新物品列表
      self.showOwnGoods();      
    }).catch(function (e) {
      console.log(accounts[0])
      self.setStatus(e)
    })
  },

  addGoods: function () {
    const self = this
    const goodsname = document.getElementById('goodsName').value
    const information = document.getElementById('addGoodsInformation').value
    const ethPrice = web3.toWei(parseInt(document.getElementById('goodsPrice').value), 'ether')
    console.log(ethPrice)
    const count = parseInt(document.getElementById('goodsCount').value)
    document.getElementById('goodsName').value = ""
    document.getElementById('addGoodsInformation').value = ""
    document.getElementById('goodsPrice').value = ""
    document.getElementById('goodsCount').value = ""

    TradingSystem.deployed().then(function (instance) {
      return instance.addGoods(goodsname, information, ethPrice, count, { from: userAccount, gas:300000 })
    }).then(function (str) {
      document.getElementById('merchants').value = userId
      self.showOwnGoods();  
      console.log(str)
    }).catch(function (e) {
      alert(e)
      console.log(e)
    })
  },

  deleteGoods: function (goodsPos) {
    let confirm
    confirm = prompt("Please input DELETE to delete goods!")
    const self = this
    if(confirm === 'DELETE') {
      TradingSystem.deployed().then(function (instance) {
        instance.getGoods(goodsPos, { from: userAccount }).then(function(result) {
          const goodsname = result[0]
          TradingSystem.deployed().then(function (instance) {
            return instance.deleteGoods(goodsname, { from: userAccount, gas:300000 })
          }).then(function (str) {
            self.showOwnGoods();
          }).catch(function (e) {
            alert(e)
          })
        })
      })
    } 
    else {
      alert("Confirm delete error! Please try again!")
    } 
  },

  showOwnGoods: function() {
    let goodsCount = 0;
    document.getElementById('showGoods').innerHTML = ''
    TradingSystem.deployed().then(function (instance) {
      instance.getUserGoodsCount({ from: userAccount }).then(function (goodsCount) {
        for (var i = 0; i < goodsCount; i++) {
					let realNum = Number(i);
          TradingSystem.deployed().then(function (instance) {
            instance.getGoods(realNum, { from: userAccount }).then(function(result) {
              const goodsname = result[0]
              const information = result[1]
              const price = Number(result[2]) / 1000000000000000000
              const count = Number(result[3])

              let goodsHtml = '<div class="sellgoods"> \
                  <div class="showagoods"> \
                    <img class="goodsphoto" src="http://img4.imgtn.bdimg.com/it/u=2285000493,311282701&fm=26&gp=0.jpg" alt="Pictures of products"/> \
                    <label><span class="goodsInformation">Name:</span><p>' + goodsname + '</p></label><br> \
                    <label><span class="goodsInformation">Information:</span><p>' + information + '</p></label><br> \
                    <label><span class="goodsInformation">Price:</span><p>' + price + '</p></label><br> \
                    <label><span class="goodsInformation">Count:</span><p>' + count + '</p></label><br> \
                  </div> \
                  <button class="deleteGoods" onclick="App.deleteGoods(' + realNum + ')">Delete Goods</button>\
                </div> '
              document.getElementById('showGoods').innerHTML += goodsHtml
            })
          })
        }
      })
    })
  },

  showOthersGoods: function(x) {
    let thisAccount = accounts[x];
    document.getElementById('showGoods').innerHTML = ''
    TradingSystem.deployed().then(function (instance) {
      instance.getUserGoodsCount({ from: thisAccount }).then(function (goodsCount) {
        for (var i = 0; i < goodsCount; i++) {
					let realNum = Number(i);
          TradingSystem.deployed().then(function (instance) {
            instance.getGoods(realNum, { from: thisAccount }).then(function(result) {
              const goodsname = result[0]
              const information = result[1]
              const price = Number(result[2]) / 1000000000000000000
              const count = Number(result[3])
              let goodsHtml = '<div class="sellgoods"> \
                  <div class="showagoods"> \
                    <img class="goodsphoto" src="http://img4.imgtn.bdimg.com/it/u=2285000493,311282701&fm=26&gp=0.jpg" alt="Pictures of products"/> \
                    <label><span class="goodsInformation">Name:</span><p>' + goodsname + '</p></label><br> \
                    <label><span class="goodsInformation">Information:</span><p>' + information + '</p></label><br> \
                    <label><span class="goodsInformation">Price:</span><p>' + price + '</p></label><br> \
                    <label><span class="goodsInformation">Count:</span><p>' + count + '</p></label><br> \
                  </div> \
                  <label> \
                    <button class="buyGoods" onclick="App.buyGoods(' + realNum + ')">Buy It Now!</button> \
                    <span class="countSpan">Count:</span><input type="text" class="count" value="1"> \
                  </label>\
                </div> '
              document.getElementById('showGoods').innerHTML += goodsHtml
            })
          })
        }
      })
    })
  },

  showPurchaseList: function() {
    let purchaseCount = 0;
    document.getElementById('showGoods').innerHTML = ''
    TradingSystem.deployed().then(function (instance) {
      instance.getUserPurchaseCount({ from: userAccount }).then(function (purchaseCount) {
        for (var i = 0; i < purchaseCount; i++) {
					let realNum = Number(i);
          TradingSystem.deployed().then(function (instance) {
            instance.getPurchase(realNum, { from: userAccount }).then(function(result) {
              let UPrice = Number(result[2]) / 1000000000000000000
              let TPrice = Number(result[3]) / 1000000000000000000
              let goodsHtml
              if(Number(result[4]) == 0) {
                goodsHtml = 
                '<div class="sellgoods"> \
                  <div class="showPurchase0"> \
                    <img class="goodsphoto" src="http://img4.imgtn.bdimg.com/it/u=2285000493,311282701&fm=26&gp=0.jpg" alt="Pictures of products"/> \
                    <label><span class="goodsInformation">State:</span><p>Waiting for confirmation of purchase</p></label><br> \
                    <label><span class="goodsInformation">Name:</span><p>' + result[0] + '</p></label><br> \
                    <label><span class="goodsInformation">Count:</span><p>' + Number(result[1]) + '</p></label><br> \
                    <label><span class="goodsInformation">Unit price:</span><p>' + UPrice + '</p></label><br> \
                    <label><span class="goodsInformation">Total price:</span><p>' + TPrice + '</p></label><br> \
                  </div> \
                  <button class="confirmPurchase" onclick="App.confirmPurchase(' + realNum + ',' + TPrice +')">Confirm Purchase</button>\
                </div> '
              } else if(Number(result[4]) == 1) {
                goodsHtml = 
                '<div class="sellgoods"> \
                  <div class="showPurchase1"> \
                    <img class="goodsphoto" src="http://img4.imgtn.bdimg.com/it/u=2285000493,311282701&fm=26&gp=0.jpg" alt="Pictures of products"/> \
                    <label><span class="goodsInformation">State:</span><p>You have paid successfully! Please confirm receipt after delivery of the goods!</p></label><br> \
                    <label><span class="goodsInformation">Name:</span><p>' + result[0] + '</p></label><br> \
                    <label><span class="goodsInformation">Count:</span><p>' + Number(result[1]) + '</p></label><br> \
                    <label><span class="goodsInformation">Unit price:</span><p>' + UPrice + '</p></label><br> \
                    <label><span class="goodsInformation">Total price:</span><p>' + TPrice + '</p></label><br> \
                  </div> \
                  <button class="confirmReceive" onclick="App.confirmReceived(' + realNum + ')">Confirm Received</button>\
                </div> '
              } else if(Number(result[4]) == 2) {
                 goodsHtml = 
                '<div class="sellgoods"> \
                  <div class="showPurchase2"> \
                    <img class="goodsphoto" src="http://img4.imgtn.bdimg.com/it/u=2285000493,311282701&fm=26&gp=0.jpg" alt="Pictures of products"/> \
                    <label><span class="goodsInformation">State:</span><p>Transaction completed successfully!</p></label><br> \
                    <label><span class="goodsInformation">Name:</span><p>' + result[0] + '</p></label><br> \
                    <label><span class="goodsInformation">Count:</span><p>' + Number(result[1]) + '</p></label><br> \
                    <label><span class="goodsInformation">Unit price:</span><p>' + UPrice + '</p></label><br> \
                    <label><span class="goodsInformation">Total price:</span><p>' + TPrice + '</p></label><br> \
                  </div> \
                </div> '
              }
              document.getElementById('showGoods').innerHTML += goodsHtml
            })
          })
        }
      })
    })
  },

  changeGoodsList: function() {
    const self = this
    let account = document.getElementById('merchants').value
    let flag = document.getElementById('BuyOrSell').value
    if(flag == 0) {
      if (accounts[account] == userAccount && token == true)  {
        self.showOwnGoods()
      }  
      else {
        self.showOthersGoods(account)
      }
    }
    else {
      if(token == true){
        alert("You may not view other users' purchase lists")
      }       
      else {
        alert("You have to sign in or sign up to view your purchase list")
      }        
    }
  },

  goToPurchaseList: function() {
    const self = this
    let flag = document.getElementById('BuyOrSell').value
    if(token == true && flag == 1) {
      if (flag == 1)  {
        self.showPurchaseList()
        document.getElementById('merchants').value = userId
      }
      else {
        self.changeGoodsList()
      } 
    }
    else if (flag == 0) {
      self.changeGoodsList()
    } 
    else {
      alert("You have to sign in or sign up to view your purchase list")
    }
  },

  buyGoods: function(goodsPos) {
    if(token == false) {
      alert('You have to sign in or sign up to buy goods!')
      return
    }
    if (confirm('Please press confirm to place the order') == false) {
      return
    }
    const self = this
    let counts = document.getElementsByClassName('count')
    const count = parseInt(counts[goodsPos].value)
    const account = document.getElementById('merchants').value
    const sellerAccount = accounts[account]
    TradingSystem.deployed().then(function (instance) {
      instance.getGoods(goodsPos, { from: sellerAccount }).then(function(result) {
        const goodsname = result[0]
        const owner = result[4]
        TradingSystem.deployed().then(function (instance) {
          return instance.buyGoods(goodsname, count, owner, { from: userAccount, gas:3000000 })
        }).then(function (str) {
          self.showPurchaseList()
        }).catch(function (e) {
          alert(e)
        })
      }).catch(function (e) {
        alert(e)
      })
    })
  },

  confirmPurchase: function(purchasePos, myValue) {   
    if (confirm('Confirm purchase?') == false) {
      return
    }
    const self = this
    let ethTPrice = web3.toWei(myValue, 'ether')
    console.log(ethTPrice)
    TradingSystem.deployed().then(function (instance) {
      instance.confirmPurchase(purchasePos, { from: userAccount, value: ethTPrice, gas:300000}).then(function(result) {
        self.showPurchaseList()
        TradingSystem.deployed().then(function (instance) {
          instance.getThisBalance({ from: userAccount }).then(function(result) {
            console.log(Number(result))
          }).catch(function (e) {
            alert(e)
          })
        })
      }).catch(function (e) {
        alert(e)
      })
    })
  },

  confirmReceived: function(purchasePos) {
    if (confirm('Confirm receive?') == false) {
      return
    }
    const self = this
    TradingSystem.deployed().then(function (instance) {
      instance.confirmReceived(purchasePos, { from: userAccount, gas: 300000}).then(function(result) {
        self.showPurchaseList()
      }).catch(function (e) {
        alert(e)
      })
    })
  }
}

window.App = App

window.addEventListener('load', function () {
  console.warn(
    'No web3 detected. Falling back to http://127.0.0.1:9545.' +
    ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
    ' Consider switching to Metamask for development.' +
    ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
  )
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  App.start()
})
