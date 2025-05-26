// SPDX-License-Identifier: BSD

pragma solidity ^0.8.0;


contract WOP{

uint256 trun_now;

function add_turn (uint256 _trun) public {
trun_now = _trun;
trun_now = trun_now + 1;
}

function check_turn () public view returns (uint256){
return trun_now;
}

}