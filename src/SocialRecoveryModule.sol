// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "../SmartAccount.sol";
import {IModule} from "../interfaces/IModule.sol";

contract SocialRecoveryModule is IModule {
    string public constant NAME = "Social Recovery Module";
    string public constant VERSION = "0.1.0";
    uint256 internal constant SIG_VALIDATION_FAILED = 1;

    event SetupComplete(address indexed wallet, address[] friends, uint256 threshold);
    event RecoveryConfirmed(address indexed wallet, address indexed friend, address newOwner);
    event RecoveryComplete(address indexed wallet, address indexed newOwner);
    event SetupDMS(address indexed wallet, bool on, address receiver, uint256 unlockTime);
    event UnlockedDMS(address indexed wallet, address receiver);

    // @review
    // Might as well keep a state to mark seen userOpHashes
    mapping(bytes32 => bool) public opsSeen;

    // @todo
    // Notice validateAndUpdateNonce in just skipped in case of modules. To avoid replay of same userOpHash I think it should be done.

    struct Friends {
        address[] friends; // the list of friends
        uint256 threshold; // minimum number of friends required to recover
    }
    //Address of the SCW (proxy) mapped to its Friends struct
    mapping(address => Friends) internal friendsEntries;
    //Address of SCW -> address of some EOA -> bool whether is friend of that SCW
    mapping(address => mapping(address => bool)) public isFriend;

    // isConfirmed - map of [recoveryHash][friend] to bool
    mapping(bytes32 => mapping(address => bool)) public isConfirmed;
    // nonce value that increments for each time a recovery attempt goes through
    mapping(address => uint256) internal walletsNonces;


    // Struct storing dead man's switch settings
    struct DeadManSwitch {
        bool on;
        address receiver;
        uint256 unlockTime;
    }
    // Address of the SCW wallet mapped to its DeadManSwitch struct
    mapping(address => DeadManSwitch) internal deadManSwitchEntries;


    /**
     * @dev Setup function sets initial storage of contract, called by SCW to set their own list of friends and threshold
     * @param _friends the list of friends
     * @param _threshold the minimum number of friends required to recover
     */
    function setup(address[] memory _friends, uint256 _threshold) public {
        require(
            _threshold <= _friends.length,
            "Threshold exceeds friends count"
        );
        require(_threshold >= 2, "At least 2 friends required");
        Friends storage entry = friendsEntries[msg.sender];
        // check for duplicates in friends list
        for (uint256 i = 0; i < _friends.length; i++) {
            address friend = _friends[i];
            require(friend != address(0), "Invalid friend address provided");
            require(
                !isFriend[msg.sender][friend],
                "Duplicate friends provided"
            );
            isFriend[msg.sender][friend] = true;
        }
        // update friends list and threshold for smart account
        entry.friends = _friends;
        entry.threshold = _threshold;

        emit SetupComplete(msg.sender, _friends, _threshold);
    }

    /**
     * @dev standard validateSignature for modules to validate and mark userOpHash as seen
     * @param userOp the operation that is about to be executed.
     * @param userOpHash hash of the user's request data. can be used as the basis for signature.
     * @return sigValidationResult sigAuthorizer to be passed back to trusting Account, aligns with validationData
     */
    function validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) external virtual returns (uint256 sigValidationResult) {
        if (opsSeen[userOpHash] == true) return SIG_VALIDATION_FAILED;
        opsSeen[userOpHash] = true;
        // can perform it's own access control logic, verify agaisnt expected signer and return SIG_VALIDATION_FAILED
        return 0;
    }

    /**
     * @dev Confirm friend recovery transaction. Only by friends.
     * msg.sender must be a friend of the wallet
     * msg.sender is only confirming for that specific recovery attempt, identified by recovery hash
     * @param _wallet the wallet we are trying to recover
     * @param _newOwner the address of the new owner
     */
    function confirmTransaction(address _wallet, address _newOwner) public {
        require(_onlyFriends(_wallet, msg.sender), "sender not a friend");
        bytes32 recoveryHash = getRecoveryHash(
            _wallet,
            _newOwner,
            walletsNonces[_wallet]
        );
        isConfirmed[recoveryHash][msg.sender] = true;

        emit RecoveryConfirmed(_wallet, msg.sender, _newOwner);
    }

    /**
     * @dev Recover the wallet by making a call to the SCW proxy contract setOwner function
     * Only runs if the recovery attempt has been confirmed by the required amount of friends
     * Sets the new owner to specifically the address in the recovery hash, as confirmed by the friends
     * Will increment the nonce of the wallet
     * @param _wallet the wallet we are trying to recover
     * @param _newOwner the address of the new owner
     */
    function recoverAccess(address payable _wallet, address _newOwner) public {
        // require(_onlyFriends(_wallet, msg.sender), "sender not a friend");
        bytes32 recoveryHash = getRecoveryHash(
            _wallet,
            _newOwner,
            walletsNonces[_wallet]
        );
        require(
            isConfirmedByRequiredFriends(recoveryHash, _wallet),
            "Not enough confirmations"
        );
        SmartAccount smartAccount = SmartAccount(payable(_wallet));
        require(
            smartAccount.execTransactionFromModule(
                _wallet,
                0,
                // abi.encodeCall("setOwner", (newOwner)),
                abi.encodeWithSignature("setOwner(address)", _newOwner),
                Enum.Operation.Call
            ),
            "Could not execute recovery"
        );
        walletsNonces[_wallet]++;

        emit RecoveryComplete(_wallet, _newOwner);
    }


    /**
     * @dev Verify that a recovery attempt has been confirmed by the required amount of friends
     * @param recoveryHash the hash of the recovery data for that particular attampted recovery (wallet, newOwner, nonce)
     * @param _wallet the wallet we are trying to recover
     * @return true if the recovery attempt has been confirmed by the required amount of friends, false otherwise
     */
    function isConfirmedByRequiredFriends(
        bytes32 recoveryHash,
        address _wallet
    ) public view returns (bool) {
        uint256 confirmationCount;
        Friends storage entry = friendsEntries[_wallet];
        for (uint256 i = 0; i < entry.friends.length; i++) {
            if (isConfirmed[recoveryHash][entry.friends[i]])
                confirmationCount++;
            if (confirmationCount == entry.threshold) return true;
        }
        return false;
    }

    /**
     * @dev Verifies that the _friend is truly a friend of the _wallet
     * @param _wallet the wallet address
     * @param _friend the friend address
     * @return true if _friend is a friend of _wallet
     */
    function _onlyFriends(
        address _wallet,
        address _friend
    ) public view returns (bool) {
        Friends storage entry = friendsEntries[_wallet];
        for (uint256 i = 0; i < entry.friends.length; i++) {
            if (entry.friends[i] == _friend) return true;
        }
        return false;
    }

    /**
     * @dev Returns hash of data encoding owner replacement.
     * @param _wallet Wallet address.
     * @param _newOwner New owner address.
     * @param _nonce Nonce of the wallet (increments each time a recovery happens)
     * @return Data hash.
     * */
    function getRecoveryHash(
        address _wallet,
        address _newOwner,
        uint256 _nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_wallet, _newOwner, _nonce));
    }

    /**
     * @dev Allow SCW to set up a dead man's switch for themselves
     * Can be called multiple times to update settings
     * @param _on bool indicating if the switch is on or off
     * @param _receiver address of the receiver of the wallet
     * @param _unlockTime time after which the receiver can claim ownership of the wallet
     */
    function setDeadMansSwitch (bool _on, address _receiver, uint256 _unlockTime) public {
        require(_receiver != address(0), "Invalid receiver address provided");
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");

        deadManSwitchEntries[msg.sender] = DeadManSwitch(_on, _receiver, _unlockTime);

        emit SetupDMS(msg.sender, _on, _receiver, _unlockTime);
    }


    /**
     * @dev Allow receiver to claim ownership of wallet after unlockPeriod has passed
     * Runs the setOwner function on the SCW proxy contract
     * @param _wallet address of the wallet
     */ 
    function claimUnlock (address _wallet) public {
        require(deadManSwitchEntries[_wallet].on == true, "Dead man's switch not on");
        require(deadManSwitchEntries[_wallet].receiver == msg.sender, "Not designated receiver");
        require(deadManSwitchEntries[_wallet].unlockTime > block.timestamp, "Unlock period not passed");
        SmartAccount smartAccount = SmartAccount(payable(_wallet));
        
        require(
            smartAccount.execTransactionFromModule(
                _wallet,
                0,
                // abi.encodeCall("setOwner", (newOwner)),
                abi.encodeWithSignature("setOwner(address)", msg.sender),
                Enum.Operation.Call
            ),
            "Could not execute recovery"
        );

        walletsNonces[_wallet]++;

        emit UnlockedDMS(_wallet, msg.sender);
    }


}
