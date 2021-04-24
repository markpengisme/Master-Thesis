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

    uint constant UNION_NUM = 4;
    address public auditor;
    mapping (string => reqDetails) req; // reqID -> reqDetails
    mapping (string => resDetails) res; // shareID+reqID -> resDetails
    mapping (string => string[]) resList; // reqID -> shareIDs
    mapping (string => bool) resRecord; // reqID+msg.sender -> union response end record
    mapping (string => uint) resCount; // reqID -> no. unions response
    

    modifier onlyUnion {
      require(msg.sender != auditor, "only union can do this");
      _;
   }
   
    constructor () public {
        auditor = msg.sender;
    }

    function compareStrings(
        string memory a,
         string memory b
    ) public view returns (bool) 
    {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
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
        emit reqEvent(_dataOwner, _reqID);
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
        public onlyUnion
    {
        string memory resID = string(abi.encodePacked(_shareID, _reqID));
        res[resID] = resDetails({
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

    function proxyResponseEnd(
        string memory _reqID
    ) 
        public onlyUnion
    {
        string memory record = string(abi.encodePacked(_reqID, msg.sender));
        require(resRecord[record] != true, "can not response again");

        resCount[_reqID] += 1;
        resRecord[record] = true;
        if (resCount[_reqID] == UNION_NUM) {
            emit resEvent(req[_reqID].proxy, _reqID);
        }
    }

    function proxyResponses (
        string memory reqID,
        string[8][] memory resDatas
    ) 
        public onlyUnion
    {
        for (uint i=0; i< resDatas.length; i++) {
            require(this.compareStrings(reqID,resDatas[i][1]), "reqID not same");
            this.proxyResponse( resDatas[i][0],
                                resDatas[i][1],
                                resDatas[i][2],
                                resDatas[i][3],
                                resDatas[i][4],
                                resDatas[i][5],
                                resDatas[i][6],
                                resDatas[i][7]);
        }
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

    function retrieveRes(string memory _resID) public view returns (
        string memory shareID,
        string memory reqID,
        string memory dataOwner,
        string memory proxy,
        string memory shareValidtime,
        string memory nonce
        
    )
    {
        resDetails memory tempRes = res[_resID];
        return (
            tempRes.shareID,
            tempRes.reqID,
            tempRes.dataOwner,
            tempRes.proxy,
            tempRes.shareValidtime,
            tempRes.nonce
        );
    }
    
    function retrieveData(string memory _resID) public view returns (
        string memory shareID,
        string memory dataHash,
        string memory ipfsHash
    )
    {
        resDetails memory tempRes = res[_resID];
        return (
            tempRes.shareID,
            tempRes.dataHash,
            tempRes.ipfsHash
        );
    }
}