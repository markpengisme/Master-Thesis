// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract Proxy {
    event reqEvent(string dataOwner, string reqID);
    event resEvent(string dataOwner, string shareID);
    
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
    
   
    mapping (string => reqDetails) req; // reqID -> reqDetails
    mapping (string => resDetails) res; // shareID -> resDetails

    function proxyRequest (
        string memory _reqID,
        string memory _dataOwner,
        string memory _proxy,
        string memory _reqValidtime,
        string memory _nonce
    ) 
        public 
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
        public 
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
        emit resEvent(_dataOwner, _shareID);
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