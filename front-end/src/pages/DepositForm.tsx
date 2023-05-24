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
      networkConfig: [
        {
          chainId: ChainId.POLYGON_MUMBAI,
          // Dapp API Key for paymaster/gas tank from biconomy dashboard 
          dappAPIKey: "hyva26yFh.45a90b19-8598-4d07-a14a-bcc1d9c85198",
          providerUrl: provider.connection.url
        }
      ]
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
    <div style={{ width: '300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', marginTop: '25px' }}>
        <select
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
        >
          <option value="">-- Select Token --</option>
          {tokenOptions.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>Amount:</label>
        <input
          type="number"
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={handleDeposit}
      >
        Deposit
      </button>
      {status && <p style={{ marginTop: '20px', textAlign: 'center' }}>{status}</p>}
    </div>
  );
};


export default DepositForm;
