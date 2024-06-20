// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSStorage {
    struct IPFSData {
        string targetContractAddress;
        string[] hashes;
        uint256 timestamp; // 데이터가 저장된 시간
        uint256 blockNumber; // 데이터가 저장된 블록 넘버
    }

    mapping(string => IPFSData) private ipfsData;

    // IPFS 데이터 저장 함수
    function storeData(string memory targetContractAddress, string[] memory hashes) public {
        IPFSData storage data = ipfsData[targetContractAddress];
        data.targetContractAddress = targetContractAddress;
        data.timestamp = block.timestamp; // 현재 블록의 타임스탬프
        data.blockNumber = block.number; // 현재 블록의 번호
        for (uint i = 0; i < hashes.length; i++) {
            data.hashes.push(hashes[i]);
        }
    }

    // IPFS 데이터 조회 함수
    function getData(string memory targetContractAddress) public view returns (string memory, string[] memory, uint256, uint256) {
        IPFSData storage data = ipfsData[targetContractAddress];
        return (data.targetContractAddress, data.hashes, data.timestamp, data.blockNumber);
    }
}
