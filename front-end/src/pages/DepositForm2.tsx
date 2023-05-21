import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SmartAccount from '@biconomy/smart-account';
import { ChainId } from '@biconomy/core-types';
import USDTABI from '../../public/USDTABI.json';
import USDCABI from '../../public/USDCABI.json';
import WBTCABI from '../../public/WBTCABI.json';
import LINKABI from '../../public/LINKABI.json';

interface TokenOption {
  symbol: string;
  address: string;
  abi: any[];
}

const DepositForm: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [scwAddress, setScwAddress] = useState('');

  useEffect(() => {
    setup();
  }, []);

  const setup = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    const smartAccount = new SmartAccount(provider, {
      activeNetworkId: ChainId.POLYGON_MUMBAI,
      supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
    });

    await smartAccount.init();
    console.log(smartAccount);
    console.log(smartAccount.getSmartAccountContext().baseWallet.getAddress());
    setScwAddress(smartAccount.getSmartAccountContext().baseWallet.getAddress());
  };

  const tokenOptions: TokenOption[] = [
    { symbol: 'ETH', address: '', abi: [] },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', abi: USDTABI },
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', abi: USDCABI },
    { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', abi: WBTCABI },
    { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', abi: LINKABI },
  ];

  const handleDeposit = async () => {
    try {
      if (!selectedToken || !amount) {
        setStatus('Please select a token and enter the amount.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      let tokenContract;
      if (selectedToken === 'ETH') {
        await signer.sendTransaction({ to: scwAddress, value: ethers.utils.parseEther(amount) });
      } else {
        const token = tokenOptions.find((token) => token.symbol === selectedToken);
        if (!token) {
          setStatus('Token not found.');
          return;
        }

        tokenContract = new ethers.Contract(token.address, token.abi, signer);
        await tokenContract.transfer(scwAddress, ethers.utils.parseUnits(amount, 18));
      }

      setStatus(`Successfully deposited ${amount} ${selectedToken}`);
      setSelectedToken('');
      setAmount('');
    } catch (error) {
      setStatus('Error: Unable to complete the deposit.');
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        <label>Select Token:</label>
        <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)}>
          <option value="">-- Select Token --</option>
          {tokenOptions.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Amount:</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <button onClick={handleDeposit}>Deposit</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default DepositForm;
