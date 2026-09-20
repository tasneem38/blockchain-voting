// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingSystem {
    address public admin;
    bool public electionOpen;
    uint256 public electionEndTimestamp;

    struct CandidateResult {
        string candidateId;
        uint256 voteCount;
    }

    mapping(bytes32 => bool) public voterHasVoted;
    mapping(string => uint256) public candidateVotes;
    string[] public candidateList;
    mapping(string => bool) private candidateExists;

    event VoteCast(bytes32 indexed voterHash, string boothId);
    event ElectionOpened(uint256 endTimestamp);
    event ElectionClosed();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyWhenOpen() {
        require(electionOpen, "Election is not open");
        if (electionEndTimestamp > 0) {
            require(block.timestamp <= electionEndTimestamp, "Election period has ended");
        }
        _;
    }

    constructor() {
        admin = msg.sender;
        electionOpen = false;
    }

    function openElection(uint256 _endTimestamp) external onlyAdmin {
        electionOpen = true;
        electionEndTimestamp = _endTimestamp;
        emit ElectionOpened(_endTimestamp);
    }

    function closeElection() external onlyAdmin {
        electionOpen = false;
        emit ElectionClosed();
    }

    function castVote(bytes32 voterHash, string calldata candidateId, string calldata boothId) external onlyAdmin onlyWhenOpen {
        require(!voterHasVoted[voterHash], "Voter has already voted");

        voterHasVoted[voterHash] = true;

        if (!candidateExists[candidateId]) {
            candidateExists[candidateId] = true;
            candidateList.push(candidateId);
        }

        candidateVotes[candidateId] += 1;

        emit VoteCast(voterHash, boothId);
    }

    function hasVoted(bytes32 voterHash) external view returns (bool) {
        return voterHasVoted[voterHash];
    }

    function getResults() external view returns (CandidateResult[] memory) {
        CandidateResult[] memory results = new CandidateResult[](candidateList.length);
        for (uint256 i = 0; i < candidateList.length; i++) {
            string memory cId = candidateList[i];
            results[i] = CandidateResult({
                candidateId: cId,
                voteCount: candidateVotes[cId]
            });
        }
        return results;
    }
}
