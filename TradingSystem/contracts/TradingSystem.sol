 pragma solidity ^0.5.0;

 import "./Purchase.sol";

contract TradingSystem {
    struct Goods {
        string owner;   //商品发布者
        string name;    //商品名
        string information; //商品信息
        uint price; //商品单价
        uint count; //商品数量
    }   

    struct User {
        string name; //用户名
        string password;    //用户密码
        uint goodsCount;    //用户发布的商品数量
        uint purchaseCount; //用户发出购买的数量
        mapping(string => uint) goodsPos;   //用户发布的物品的名称与其在仓库中位置的映射
        mapping(string => bool) goodsFlag;  //物品名称与是否发布的映射
    }

    User[] users;   //用户仓库
    uint userCount = 0;    //用户数量

    mapping(string => bool) usersFlag;  //用户名称与是否发布的映射
    mapping(string => uint) userPos;    //用户名称与其在仓库位置的映射
    mapping(address => string) addressToUser;   //地址到用户名的映射
    mapping(string => Goods[]) userToGoods; //用户名到其物品仓库的映射
    mapping(string => Purchase[]) userToPurchase;   //用户名到其购买列表的映射
    mapping(string => address payable) userToAddress;   //用户名到其地址的映射

    function registOrLogin(string memory name, string memory password) public {
        //判断该地址是否已经注册，如果存在则为登录模式，检查用户名和密码，否则注册一个新用户
        if(usersFlag[addressToUser[msg.sender]] == true) {
            require(stringsEqual(addressToUser[msg.sender], name) == true, "Please input correct username!");
            require(stringsEqual(users[userPos[addressToUser[msg.sender]]].password, password) == true, "Please input correct password!");
        }      
        else {
            require(usersFlag[name] == false, "The name has been used!");
            users.push(User(name, password, 0, 0));
            userPos[name] = userCount;
            userCount++;
            usersFlag[name] = true;
            addressToUser[msg.sender] = name;
            userToAddress[name] = msg.sender;
        }
    }

    function getNameByAddress() public view returns (string memory){
        return addressToUser[msg.sender];
    }

    function getUserBalance() public view returns(uint) {
        return msg.sender.balance;
    }

    function setPassword(string memory newPassword) public {
        users[userPos[addressToUser[msg.sender]]].password = newPassword;
    }
    
    function getPassword() public view returns (string memory){ 
        return users[userPos[addressToUser[msg.sender]]].password;
    }

    //Goods operation
    function addGoods(string memory name, string memory information, uint price, uint count) public {
        require(users[userPos[addressToUser[msg.sender]]].goodsFlag[name] == false, "The goods exists!");
        users[userPos[addressToUser[msg.sender]]].goodsPos[name] = users[userPos[addressToUser[msg.sender]]].goodsCount;
        users[userPos[addressToUser[msg.sender]]].goodsFlag[name] = true;
        users[userPos[addressToUser[msg.sender]]].goodsCount++;
        userToGoods[addressToUser[msg.sender]].push(Goods(addressToUser[msg.sender], name, information, price, count));
    }

    function deleteGoods(string memory name) public {           
        userToGoods[addressToUser[msg.sender]][users[userPos[addressToUser[msg.sender]]].goodsPos[name]] = userToGoods[addressToUser[msg.sender]][userToGoods[addressToUser[msg.sender]].length - 1];
        users[userPos[addressToUser[msg.sender]]].goodsPos[userToGoods[addressToUser[msg.sender]][(userToGoods[addressToUser[msg.sender]].length - 1)].name] = users[userPos[addressToUser[msg.sender]]].goodsPos[name];
        delete users[userPos[addressToUser[msg.sender]]].goodsPos[name];
        users[userPos[addressToUser[msg.sender]]].goodsFlag[name] = false;
        userToGoods[addressToUser[msg.sender]].length = userToGoods[addressToUser[msg.sender]].length - 1;
        users[userPos[addressToUser[msg.sender]]].goodsCount--;
    }

    function getUserGoodsCount() public view returns (uint) {
        return users[userPos[addressToUser[msg.sender]]].goodsCount;
    }

    function getGoods(uint x) public view returns (string memory, string memory, uint, uint, string memory) {
        return (userToGoods[addressToUser[msg.sender]][x].name, userToGoods[addressToUser[msg.sender]][x].information, 
            userToGoods[addressToUser[msg.sender]][x].price, userToGoods[addressToUser[msg.sender]][x].count, userToGoods[addressToUser[msg.sender]][x].owner);
    }

    function buyGoods(string memory name, uint count, string memory owner) public {
        require(userToGoods[owner][users[userPos[owner]].goodsPos[name]].count >= count, "The count is not enough");
        userToGoods[owner][users[userPos[owner]].goodsPos[name]].count -= count;
        Purchase newPurchase = new Purchase();
        uint price = userToGoods[owner][users[userPos[addressToUser[msg.sender]]].goodsPos[name]].price;
        newPurchase.setPurchase(userToAddress[owner], msg.sender, name, count, price);
        userToPurchase[addressToUser[msg.sender]].push(newPurchase);
        users[userPos[addressToUser[msg.sender]]].purchaseCount++;
    }

    function getUserPurchaseCount() public view returns (uint) {
        return users[userPos[addressToUser[msg.sender]]].purchaseCount;
    }

    function getPurchase(uint x) public view returns (string memory, uint, uint, uint, uint) {
        return (userToPurchase[addressToUser[msg.sender]][x].getName(), userToPurchase[addressToUser[msg.sender]][x].getCount(), 
            userToPurchase[addressToUser[msg.sender]][x].getPrice(), userToPurchase[addressToUser[msg.sender]][x].getValue(), userToPurchase[addressToUser[msg.sender]][x].getState());
    }
    
    function getBuyer(uint x) public view returns(address) {
        return userToPurchase[addressToUser[msg.sender]][x].getBuyer();
    }

    function confirmPurchase(uint x) public payable {
        uint value = msg.value;
        userToPurchase[addressToUser[msg.sender]][x].confirmPurchase(msg.sender, value);  
    }

    function confirmReceived(uint x) public payable {
        userToPurchase[addressToUser[msg.sender]][x].confirmReceived(msg.sender);
        userToPurchase[addressToUser[msg.sender]][x].getSeller().transfer(userToPurchase[addressToUser[msg.sender]][x].getValue());
    }

    function getThisBalance() public view returns(uint) {
        return address(this).balance;
    }
 
    function stringsEqual(string storage _a, string memory _b) internal view returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length)
			return false;
		for (uint i = 0; i < a.length; i ++)
			if (a[i] != b[i])
				return false;
		return true;
	}
}