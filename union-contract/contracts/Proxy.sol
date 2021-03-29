// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.8.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Proxy {
    event reqEvent(string dataOwner, string reqID);
    event resEvent(string proxy, string reqID);

    struct reqDetails {
        string reqID;
        string dataOwner;
        string proxy;
        string reqValidtime;
        string nonce;
    }
    
    struct resDetails {
        string shareID;
        string reqID;
        string dataOwner;
        string dataHash;
        string proxy;
        string shareValidtime;
        string nonce;
        string ipfsHash;
    }

    uint constant UNION_NUM = 2;
    address public auditor;
    mapping (string => reqDetails) req; // reqID -> reqDetails
    mapping (string => resDetails) res; // shareID -> resDetails
    mapping (string => string[]) resList; // reqID -> shareIDs
    mapping (string => address[]) resRecord; // reqID -> unions account address
    mapping (string => bool) resOpen; // reqID -> open response or not
    

    modifier onlyUnion {
      require(msg.sender != auditor);
      _;
   }

   modifier resIsOpen(string memory _reqID) {
       require(resOpen[_reqID] == true);
       _;
   }
   
    constructor () public {
        auditor = msg.sender;
    }

    function proxyRequest(
        string memory _reqID,
        string memory _dataOwner,
        string memory _proxy,
        string memory _reqValidtime,
        string memory _nonce
    ) 
        public onlyUnion
    {
        req[_reqID] = reqDetails({
            reqID: _reqID,
            dataOwner: _dataOwner,
            proxy: _proxy,
            reqValidtime: _reqValidtime,
            nonce: _nonce
        });
        resOpen[_reqID] = true;
        emit reqEvent(_dataOwner, _reqID);
    }

    function proxyResponseEnd(
        string memory _reqID
    ) 
        public resIsOpen(_reqID)
    {
        for (uint i=0; i < resRecord[_reqID].length; i++ ) {
            if (resRecord[_reqID][i] == msg.sender) {
                return;
            }
        }
        resRecord[_reqID].push(msg.sender);
        if (resRecord[_reqID].length == UNION_NUM || msg.sender == auditor) {
            resOpen[_reqID] = false;
            emit resEvent(req[_reqID].proxy, _reqID);
        }
    }

    function proxyResponse (
        string memory _shareID,
        string memory _reqID,
        string memory _dataOwner,
        string memory _dataHash,
        string memory _proxy,
        string memory _shareValidtime,
        string memory _nonce,
        string memory _ipfsHash
    ) 
        public onlyUnion resIsOpen(_reqID)
    {
        res[_shareID] = resDetails({
            shareID: _shareID,
            reqID: _reqID,
            dataOwner: _dataOwner,
            dataHash: _dataHash,
            proxy: _proxy,
            shareValidtime: _shareValidtime,
            nonce: _nonce,
            ipfsHash: _ipfsHash
        });
        resList[_reqID].push(_shareID);
    }
    
    function retrieveReq(string memory _reqID) public view returns (
        string memory reqID,
        string memory dataOwner,
        string memory proxy,
        string memory reqValidtime,
        string memory nonce
    )
    {
        reqDetails memory tempReq = req[_reqID];
        return (
            tempReq.reqID,
            tempReq.dataOwner,
            tempReq.proxy,
            tempReq.reqValidtime,
            tempReq.nonce
        );
    }
    
    function retreiveShareIDList(string memory _reqID) public view returns (
        string[] memory shareIDList
    )
    {
        return resList[_reqID];
    }

    function retrieveRes(string memory _shareID) public view returns (
        string memory shareID,
        string memory reqID,
        string memory dataOwner,
        string memory proxy,
        string memory shareValidtime,
        string memory nonce
        
    )
    {
        resDetails memory tempRes = res[_shareID];
        return (
            tempRes.shareID,
            tempRes.reqID,
            tempRes.dataOwner,
            tempRes.proxy,
            tempRes.shareValidtime,
            tempRes.nonce
        );
    }
    
    function retrieveData(string memory _shareID) public view returns (
        string memory shareID,
        string memory dataHash,
        string memory ipfsHash
    )
    {
        resDetails memory tempRes = res[_shareID];
        return (
            tempRes.shareID,
            tempRes.dataHash,
            tempRes.ipfsHash
        );
    }
}