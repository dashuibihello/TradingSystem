pragma solidity ^0.5.0;

contract Purchase {
    address payable public seller;  //卖家地址
    address payable public buyer; //买家地址
    uint public value;  //总价
    uint public count;  //商品数量
    uint public price;  //单价
    string public name; //商品名字
    enum State { Created, Locked, Inactive }    
    State public state; //订单状态

    modifier inState(State _state) {
        require(
            state == _state,
            "Invalid state."
        );
        _;
    }

    function setPurchase (address payable seller_, address payable buyer_, string memory name_, uint count_, uint price_) public {
        seller = seller_;
        buyer = buyer_;
        name = name_;
        count = count_;
        price = price_;
        value = count * price;
        state = State.Created;
    }

    function confirmPurchase(address payable buyer_, uint value_) public inState(State.Created) payable {
        require(buyer_ == buyer, "Only buyer can call this");
        require(value_ == value, "You give wrong money");
        state = State.Locked;
    }

    function confirmReceived(address payable buyer_) public inState(State.Locked) {
        require(buyer_ == buyer, "Only buyer can call this");
        state = State.Inactive;
    }

    function getSeller() public view returns(address payable) {
        return seller;
    }

    function getBuyer() public view returns(address) {
        return buyer;
    }

    function getName() public view returns(string memory) {
        return name;
    }
    
    function getCount() public view returns(uint) {
        return count;
    }

    function getPrice() public view returns(uint) {
        return price;
    }

    function getValue() public view returns(uint) {
        return value;
    }

    function getState() public view returns(uint) {
        return uint(state);
    }
}