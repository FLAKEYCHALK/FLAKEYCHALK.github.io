---
title: Damn Vulnerable Defi V4 Unstoppable
description: Write up of Unstoppable
publicationDate: 2024-12-05
image: ./blog-asset-1.jpg
---

## Overview

There’s a tokenized vault with a million DVT tokens deposited. It’s offering flash loans for free, until the grace period ends.

To catch any bugs before going 100% permissionless, the developers decided to run a live beta in testnet. There’s a monitoring contract to check liveness of the flashloan feature.

Starting with 10 DVT tokens in balance, **show that it’s possible to halt the vault**. It must stop offering flash loans.

## Research

In the context of smart contracts, stopping a flash loan can be achieved by triggering an error or a revert and that's what we're going to do since that's the condition to show that it possible to halt the vault.

The question is... where can we find that trigger to halt the flashloan? Let's focus on this contract `UnstoppableVault.sol` and look closely on the `flashLoan` function since this is the one that performs the flashloan.

Since we're looking ways to trigger that condition, we must focus only on what makes things conditionally revert the  `flashLoan` function. If you notice, there are multiple `if` statements here checking conditions, like whether the amount is zero, etc. Do you think there's anything that could potentially cause issues with these checks?

```solidity
    function flashLoan(IERC3156FlashBorrower receiver, address _token, uint256 amount, bytes calldata data)
        external
        returns (bool)
    {
        if (amount == 0) revert InvalidAmount(0); // fail early
        if (address(asset) != _token) revert UnsupportedCurrency(); // enforce ERC3156 requirement
        uint256 balanceBefore = totalAssets();
        if (convertToShares(totalSupply) != balanceBefore) revert InvalidBalance(); // enforce ERC4626 requirement

        // transfer tokens out + execute callback on receiver
        ERC20(_token).safeTransfer(address(receiver), amount);

        // callback must return magic value, otherwise assume it failed
        uint256 fee = flashFee(_token, amount);
        if (
            receiver.onFlashLoan(msg.sender, address(asset), amount, fee, data)
                != keccak256("IERC3156FlashBorrower.onFlashLoan")
        ) {
            revert CallbackFailed();
        }

        // pull amount + fee from receiver, then pay the fee to the recipient
        ERC20(_token).safeTransferFrom(address(receiver), address(this), amount + fee);
        ERC20(_token).safeTransfer(feeRecipient, fee);

        return true;
    }
```

Now, if you read more about ERC4626, ERC20 and you got a little bit of common accounting knowledge, you will notice that the third check is sketchy. Basically this check just indicates that if `convertToShares(totalSupply)` and `balanceBefore` are not equal, it will revert.

```solidity	
if (convertToShares(totalSupply) != balanceBefore) revert InvalidBalance(); 
```

Let's dissect the code first.

- `convertToShares`
	- Returns the amount of `shares` that would be exchanged by the vault for the amount of `assets` provided.
- `totalSupply`
	- Returns the total number of unredeemed vault shares in circulation.
- `balanceBefore`
	- Actual token balance in the contract and this is from the built-in function of ERC4626 `totalAssets` where it states *"This function returns the total amount of underlying assets held by the vault."*
- `InvalidBalance`
	- If it does not match the actual balance, the transaction will be reverted.

Now that we have the overview of these, let's focus on what's important, and that's understanding how the accounting works.  Starting with `convertToShares`, let's examine the code closely to see what it actually does, it handles two scenarios. If the supply is zero then it will return the asset amount and if the supply is not zero (which is our case) it will calculate the shares using `mulDivDown()` which we can assume that it is a safe math and the formula here is `(assets * supply) / totalAssets()`.

```solidity
  function convertToShares(uint256 assets) public view virtual returns (uint256) {
        uint256 supply = totalSupply; // Saves an extra SLOAD if totalSupply is non-zero.

        return supply == 0 ? assets : assets.mulDivDown(supply, totalAssets());
    }
```

The third check assumes a perfect 1:1 relationship between shares and assets. We can think ways to trigger the revert and it is simple, disrupt the 1:1 ratio, but how we can achieve that?

If we use the `deposit` function of ERC4626 it will mint the receiver address amount of shares causing the condition not to revert because `totalAssets()` and `convertToShares(totalSupply)` values will be always equal.

But if you read more about ERC4626, it is an extension of ERC20 and we have the `transfer` function which we can use to **directly transfer assets** in the vault, and this results not minting a shares thus `convertToShares(totalSupply)` is not updated but `totalAssets()` increases.

## Exploit

Now that we know the flaw of the contract, the next step is to execute the attack which is really simple. 

```solidity	
function test_unstoppable() public checkSolvedByPlayer {
    require(token.transfer(address(vault), 1));  
}
```

Here's what it does, and also you can use console.log to observe the changes of before and after of `totalAssets`.

1. **Directly transfer to the vault**
    - Manually send `DVT` tokens to the vault contract using the ERC20 `transfer` function.
2. **Cause the flashloan to fail**
    - The external transfer inflates `totalAssets` without minting additional shares (`oDVT`).
    - The condition in the `flashLoan` function fails due to the mismatch between `convertToShares(totalSupply)` and `totalAssets`.
3.  **Result**
    - The `flashLoan` function becomes broken, which triggers the revert `InvalidBalance`

## Key Takeaways

- The attack relies on exploiting a mismatch between two accounting systems (`totalAssets` and `convertToShares`).
- By inflating `totalAssets` it disables the `flashLoan` functionality without interacting directly with its logic.
  
## References

- [ERC-4626 Tokenized Vault Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-4626/)
