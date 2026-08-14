// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PortfolioActionAgent
 * @notice Records approved portfolio rebalancing actions on Flare Testnet.
 * @dev This contract does NOT hold or transfer funds. It serves as an
 *      immutable, on-chain audit log for portfolio actions that were
 *      approved by the user through the Private AI Financial Agent.
 *
 *      Sensitive financial information (income, net worth, private strategy)
 *      is NEVER stored on-chain. Only the minimum action metadata required
 *      for verification is recorded.
 */
contract PortfolioActionAgent {
    // ──────────────────────────────────────────────
    // Types
    // ──────────────────────────────────────────────

    enum ActionType {
        REBALANCE,          // 0
        REDUCE_EXPOSURE,    // 1
        INCREASE_EXPOSURE,  // 2
        HOLD                // 3
    }

    enum ActionStatus {
        PENDING,    // 0
        EXECUTED,   // 1
        CANCELLED   // 2
    }

    struct PortfolioAction {
        address user;
        ActionType actionType;
        string asset;
        uint256 targetExposureBps;   // basis points (0–10000 = 0–100%)
        uint256 timestamp;
        ActionStatus status;
        bytes32 recommendationHash;  // hash of off-chain recommendation ID
    }

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    uint256 public nextActionId;
    mapping(uint256 => PortfolioAction) public actions;
    mapping(address => uint256[]) private _userActionIds;

    // Safety limits
    uint256 public constant MAX_EXPOSURE_BPS = 10000; // 100%
    uint256 public constant MAX_ACTIONS_PER_USER = 100;

    // Supported assets allowlist
    mapping(string => bool) public supportedAssets;
    string[] public supportedAssetList;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event ActionRecorded(
        uint256 indexed actionId,
        address indexed user,
        ActionType actionType,
        string asset,
        uint256 targetExposureBps,
        uint256 timestamp,
        bytes32 recommendationHash
    );

    event ActionStatusUpdated(
        uint256 indexed actionId,
        ActionStatus newStatus
    );

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error UnsupportedAsset(string asset);
    error InvalidExposure(uint256 exposureBps);
    error ActionNotFound(uint256 actionId);
    error NotActionOwner(uint256 actionId, address caller);
    error TooManyActions(address user);
    error ActionAlreadyFinalized(uint256 actionId);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    constructor() {
        // Initialize supported assets
        _addSupportedAsset("XRP");
        _addSupportedAsset("FXRP");
        _addSupportedAsset("FLR");
        _addSupportedAsset("WFLR");
        _addSupportedAsset("C2FLR");
        _addSupportedAsset("USDC");
        _addSupportedAsset("USDT");
    }

    // ──────────────────────────────────────────────
    // External Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Record an approved portfolio action.
     * @param _actionType  The type of action (REBALANCE, REDUCE, etc.)
     * @param _asset       The target asset symbol (must be in allowlist)
     * @param _targetExposureBps  Target exposure in basis points (0–10000)
     * @param _recommendationHash  Keccak256 of the off-chain recommendation ID
     * @return actionId    The ID assigned to this recorded action
     */
    function recordAction(
        ActionType _actionType,
        string calldata _asset,
        uint256 _targetExposureBps,
        bytes32 _recommendationHash
    ) external returns (uint256 actionId) {
        // Validate asset
        if (!supportedAssets[_asset]) {
            revert UnsupportedAsset(_asset);
        }

        // Validate exposure
        if (_targetExposureBps > MAX_EXPOSURE_BPS) {
            revert InvalidExposure(_targetExposureBps);
        }

        // Rate limit per user
        if (_userActionIds[msg.sender].length >= MAX_ACTIONS_PER_USER) {
            revert TooManyActions(msg.sender);
        }

        actionId = nextActionId++;

        actions[actionId] = PortfolioAction({
            user: msg.sender,
            actionType: _actionType,
            asset: _asset,
            targetExposureBps: _targetExposureBps,
            timestamp: block.timestamp,
            status: ActionStatus.EXECUTED,
            recommendationHash: _recommendationHash
        });

        _userActionIds[msg.sender].push(actionId);

        emit ActionRecorded(
            actionId,
            msg.sender,
            _actionType,
            _asset,
            _targetExposureBps,
            block.timestamp,
            _recommendationHash
        );
    }

    /**
     * @notice Cancel a pending action. Only the action owner can cancel.
     * @param _actionId  The action to cancel
     */
    function cancelAction(uint256 _actionId) external {
        PortfolioAction storage action = actions[_actionId];

        if (action.timestamp == 0) {
            revert ActionNotFound(_actionId);
        }
        if (action.user != msg.sender) {
            revert NotActionOwner(_actionId, msg.sender);
        }
        if (action.status != ActionStatus.PENDING) {
            revert ActionAlreadyFinalized(_actionId);
        }

        action.status = ActionStatus.CANCELLED;

        emit ActionStatusUpdated(_actionId, ActionStatus.CANCELLED);
    }

    // ──────────────────────────────────────────────
    // View Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Get a single action by ID.
     */
    function getAction(uint256 _actionId) external view returns (PortfolioAction memory) {
        if (actions[_actionId].timestamp == 0 && _actionId >= nextActionId) {
            revert ActionNotFound(_actionId);
        }
        return actions[_actionId];
    }

    /**
     * @notice Get all action IDs for a user.
     */
    function getUserActionIds(address _user) external view returns (uint256[] memory) {
        return _userActionIds[_user];
    }

    /**
     * @notice Get the total number of actions for a user.
     */
    function getUserActionCount(address _user) external view returns (uint256) {
        return _userActionIds[_user].length;
    }

    /**
     * @notice Check if an asset is in the supported allowlist.
     */
    function isAssetSupported(string calldata _asset) external view returns (bool) {
        return supportedAssets[_asset];
    }

    /**
     * @notice Get all supported assets.
     */
    function getSupportedAssets() external view returns (string[] memory) {
        return supportedAssetList;
    }

    // ──────────────────────────────────────────────
    // Internal Functions
    // ──────────────────────────────────────────────

    function _addSupportedAsset(string memory _asset) internal {
        supportedAssets[_asset] = true;
        supportedAssetList.push(_asset);
    }
}
