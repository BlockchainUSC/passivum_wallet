import styles from "../styles/FormScreen.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import nonfungiblePositionManagerABI from "../../public/nonfungiblePositionManagerABI.json";
import SmartAccount from '@biconomy/smart-account';
import { ChainId } from '@biconomy/core-types';


// Takes in first token name, second token name, first token amount, second token amount
// Then updates the state in the parent accordingly
type FormProps = {
  updateParentStaking: (arg0: string, arg1:string, arg2: number, arg3: number) => void;
};

//map tokens to their addresses
type TokenAddressMap = {
  [tokenName: string]: string;
};

//map tokens to their decimal places
type TokenDecimalMap = {
  [tokenName: string]: number;
};

export default function StakeForm({updateParentStaking}: FormProps) {
  //state declarations
  const [amountOne, setAmountOne] = useState<number>(0);
  const [amountTwo, setAmountTwo] = useState<number>(0);
  const [tokenOneName, setTokenOneName] = useState<string>("WETH");
  const [tokenTwoName, setTokenTwoName] = useState<string>("USDT");
  const [scwAddress, setScwAddress] = useState('');
  const [tokenAddresses, setTokenAddresses] = useState<TokenAddressMap>({
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA'
  });
  const [tokenDecimals, setTokenDecimals] = useState<TokenDecimalMap>({
    'WETH': 18,
    'USDT': 6,
    'USDC': 6,
    'WBTC': 8,
    'LINK': 18,
  });
  const [tokenOneAddress, setTokenOneAddress] = useState<string>('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
  const [tokenTwoAddress, setTokenTwoAddress] = useState<string>('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  //for uniswap v3 price ranges
  const MIN_TICK = -887272;
  const MAX_TICK = 887272;

  // Handles when the user selects different token pairs
  const handleTokenPairChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tokenPair = event.target.value;
    const tokens = tokenPair.split("/");
    setTokenOneName(tokens[0]);
    setTokenTwoName(tokens[1]);
    setTokenOneAddress(tokenAddresses[tokens[0]]);
    setTokenTwoAddress(tokenAddresses[tokens[1]]);
  };

  // Handles when the user submits the form
  const handleSubmit = async () => {

    try {

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []).catch((e) => console.log(e));
      const signer = provider.getSigner();
  
      const smartAccount = new SmartAccount(provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
      });
  
      await smartAccount.init();
      console.log(smartAccount);
      console.log(smartAccount.getSmartAccountContext().baseWallet.getAddress());
      setScwAddress(smartAccount.getSmartAccountContext().baseWallet.getAddress());

      // event.preventDefault();
      if (amountOne >= 0 && amountTwo >= 0) {
        updateParentStaking(tokenOneName, tokenTwoName, amountOne, amountTwo);
      }

      const nonfungiblePositionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"; 

      // Set up the nonfungible position manager contract
      const nonfungiblePositionManager = new ethers.Contract(
        nonfungiblePositionManagerAddress,
        nonfungiblePositionManagerABI,
        signer
      );

      const txs = [];

      // Approve the nonfungible position manager to use the tokens
      const erc20Interface = new ethers.utils.Interface([
        'function approve(address spender, uint256 value)'
      ]);

      const data0 = erc20Interface.encodeFunctionData('approve', [nonfungiblePositionManagerAddress, ethers.utils.parseUnits(amountOne.toString(), tokenDecimals[tokenOneName])]);
      const tx0 = {
        to: tokenOneAddress,
        data: data0,
      };
      txs.push(tx0);

      const data1 = erc20Interface.encodeFunctionData('approve', [nonfungiblePositionManagerAddress, ethers.utils.parseUnits(amountTwo.toString(), tokenDecimals[tokenTwoName])]);
      const tx1 = {
        to: tokenTwoAddress,
        data: data1,
      };
      txs.push(tx1);

      // Mint the position
      const params = {
        token0: tokenOneAddress,
        token1: tokenTwoAddress,
        fee: 3000, // for example
        tickLower: MIN_TICK, //widest possible range for a liquidity position (provide liquidity across entire pool). should be changed for production
        tickUpper: MAX_TICK,
        amount0Desired: ethers.utils.parseUnits(amountOne.toString(), tokenDecimals[tokenOneName]),
        amount1Desired: ethers.utils.parseUnits(amountTwo.toString(), tokenDecimals[tokenTwoName]),
        amount0Min: 0, //NOTE: these are not optimal values for liquidity provision without slippage protection. should be changed for production
        amount1Min: 0,
        recipient: scwAddress,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      };

      const mintTx = await nonfungiblePositionManager.populateTransaction.mint(params);
      const tx2 = {
        to: nonfungiblePositionManagerAddress,
        data: mintTx.data,
      };
      txs.push(tx2);

      // Send the batch transaction
      const txResponse = await smartAccount.sendTransactionBatch({ transactions: txs });
      console.log('UserOp hash', txResponse.hash);
      const txReciept = await txResponse.wait();
      console.log('Tx Hash', txReciept.transactionHash);

    } catch (error) {
      console.log(error);
    }

  };

  // Handles when the user changes the amount
  const handleAmountChangeOne = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmountOne(parseFloat(event.target.value));
  };

  const handleAmountChangeTwo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmountTwo(parseFloat(event.target.value));
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Choose Amount</h2>
        <div className={styles.field}>
          <label htmlFor="amount" className={styles.label}>{tokenOneName}</label>
          <input type="number" step="any" id="amount" className={styles.input} onChange={handleAmountChangeOne}/>

          <label htmlFor="amount" className={styles.label}>{tokenTwoName}</label>
          <input type="number" step="any" id="amount" className={styles.input} onChange={handleAmountChangeTwo}/>
          <br></br>
          <select id="token-pair" className={styles.input} onChange={handleTokenPairChange}>
            <option value="WETH/USDT" selected>WETH/USDT</option>
            <option value="WBTC/WETH">WBTC/WETH</option>
            <option value="USDC/WETH">USDC/WETH</option>
            <option value="LINK/WETH">LINK/WETH</option>
          </select>
        </div>
        <button type="submit" className={styles.button} onClick={() => handleSubmit()} >
          Stake
        </button>
      </form>
    </div>
  );
}
