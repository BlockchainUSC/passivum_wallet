import ImageStyles from "../styles/ImageRow.module.css";
import StakeForm from "./StakeForm";
import React, { useEffect, useState } from "react";
import { Router, useRouter } from "next/router";
import { Black_And_White_Picture } from "next/font/google";
import Web3 from "web3";
import { all } from "bluebird";

const EtherScanAPIKeys = [
  "MC2UGUBDI73K3252KT4EYG5NZNDA6244Y8",
  "8RBCV3QHV3DBRDP7GCM1PZ87ZIAE29IZIP",
];
var EtherScanAPIKeyIdx = 0;

const EtherScanAPI_URL = "https://api.etherscan.io/api";
// Addresses of ABI's for different tokens
const USDT_ABI_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDC_ABI_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WBTC_ABI_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const LINK_ABI_ADDRESS = "0x514910771af9ca656af840dff83e8264ecf986ca";

// Load balancing for API key calls
const getEtherScanAPIKey = () => {
  let ans = EtherScanAPIKeys[EtherScanAPIKeyIdx];
  EtherScanAPIKeyIdx = (EtherScanAPIKeyIdx + 1) % EtherScanAPIKeys.length;
  return ans;
};

export default function AutoStakePage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [amtIsInvalid, setAmtIsInvalid] = useState(false);
  const [stakingAmt1, setStakingAmt1] = useState(0);
  const [stakingName1, setStakingName1] = useState<string>("");
  const [stakingAmt2, setStakingAmt2] = useState(0);
  const [stakingName2, setStakingName2] = useState<string>("");
  const router = useRouter();
  // balances of different tokens
  const [usdtBalance, setUSDTBalance] = useState<number>(0);
  const [usdcBalance, setUSDCBalance] = useState<number>(0);
  const [wbtcBalance, setWBTCBalance] = useState<number>(0);
  const [linkBalance, setLINKBalance] = useState<number>(0);

  const allBalances = [
    { name: "ETH", balance: balance, setMethod: setBalance },
    { name: "USDT", balance: usdtBalance, setMethod: setUSDTBalance },
    { name: "USDC", balance: usdcBalance, setMethod: setUSDCBalance },
    { name: "WBTC", balance: wbtcBalance, setMethod: setWBTCBalance },
    { name: "LINK", balance: linkBalance, setMethod: setLINKBalance },
  ];

  // Sets up the web3 provider  
  const contractCall = async () => {
    // set up signer and contract
    if (!window.ethereum) {
      alert("please install MetaMask");
      return;
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", []).catch((e) => console.log(e));

      let contract = new ethers.Contract(
        contractAddress,
        SocialABI.result,
        provider.getSigner()
      );
    }
  }
  // Get the balance of the account from EtherScan of different tokens
  const fetchAndSetTokenBalance = async (
    contractAddress: string,
    account: string,
    tokenName: string
  ) => {
    // Get the corresponding token based on name
    let token;
    for (let tk of allBalances) {
      if (tk.name == tokenName) {
        token = tk;
      }
    }
    if (!token) {
      console.error("Token not found");
      return;
    }

    const response = await fetch(
      `${EtherScanAPI_URL}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${account}&tag=latest&apikey=${getEtherScanAPIKey()}`
    );
    const data = await response.json();
    console.log("address: ", contractAddress, data);
    if (data.status === "1") {
      token.setMethod(Number(parseFloat(data.result)));
    } else {
      console.error("Error fetching token balance from Etherscan");
    }
  };

  // Updates the balances of 2 tokens depending on the staking
  const tokenUpdateBalance = (
    token1: string,
    token2: string,
    stakingOne: number,
    stakingTwo: number
  ) => {
    setStakingName1(token1);
    setStakingAmt1(stakingOne);
    setStakingName2(token2);
    setStakingAmt2(stakingTwo);
  };

  // Handle image click
  const handleImageClick = (imageUrl: React.SetStateAction<string>) => {
    setSelectedImage(imageUrl);
    setShowForm(true);
    console.log("HANDLING IMAGE CLICK");
  };

  // Back button to refresh the page when image selected, otherwise go back to main page
  const backButton = () => {
    if (!showForm) {
      router.push("/");
    } else {
      setSelectedImage("");
      setAmtIsInvalid(false);
      setShowForm(false);
    }
  };

  // Keep track of the amount being staked, if it is invalid, and update amtIsInvalid
  useEffect(() => {
    let didSetToInvalid = false;
    for (let tk of allBalances) {
      if (
        (tk.name == stakingName1 && stakingAmt1 > tk.balance) ||
        (tk.name == stakingName2 && stakingAmt2 > tk.balance)
      ) {
        setAmtIsInvalid(true);
        didSetToInvalid = true;
      }
    }
    if (!didSetToInvalid) {
      setAmtIsInvalid(false);
      setShowForm(false);
      for (let tk of allBalances) {
        if (tk.name == stakingName1) {
          tk.setMethod(tk.balance - stakingAmt1);
        }
        if (tk.name == stakingName2) {
          tk.setMethod(tk.balance - stakingAmt2);
        }
      }
    }
    // if(stakingAmt < 0 || stakingAmt > balance) {
    //     setAmtIsInvalid(true);
    // } else {
    //     setAmtIsInvalid(false);
    //     setShowForm(false);
    //     setBalance(balance - stakingAmt);
    // }
  }, [stakingAmt1, stakingName1, stakingAmt2, stakingName2]);

  // Initialize the public address, the balance,and the web3 provider
  useEffect(() => {
    // Get the balance of the account from EtherScan
    const updateBalance = async () => {
      const response = await fetch(
        `${EtherScanAPI_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${getEtherScanAPIKey()}`
      );
      const data = await response.json();
      console.log(data);
      if (data.status == 1) {
        const ether_balance = Web3.utils.fromWei(data.result, "ether");
        setBalance(Number(ether_balance));
      } else {
        console.error("Error fetching data from etherscan");
      }
    };

    // Update the balances of all the other tokens
    const updateTokenBalances = async () => {
      await fetchAndSetTokenBalance(USDC_ABI_ADDRESS, address, "USDC");
      await fetchAndSetTokenBalance(USDT_ABI_ADDRESS, address, "USDT");
      await fetchAndSetTokenBalance(WBTC_ABI_ADDRESS, address, "WBTC");
      await fetchAndSetTokenBalance(LINK_ABI_ADDRESS, address, "LINK");
    };
    // Get the address from local storage
    const storedAddress = localStorage.getItem("account") || "";
    if (storedAddress !== "") {
      setAddress(storedAddress);
      updateBalance();
      updateTokenBalances();
    } else {
      // If the address is not set, redirect to the main page
      router.push("/");
    }
  }, [address, router]);

  const Form = () => {
    // Here we can define the form component
    return (
      <div className={ImageStyles.formContainer}>
        <h2 className={ImageStyles.formTitle}>Stake your assets</h2>
        <StakeForm updateParentStaking={tokenUpdateBalance} />
      </div>
    );
  };
  // builds the row of images
  const ImageRow = () => {
    const images = [
      "https://images.prismic.io/contrary-research/0fdbf218-37ff-4afb-af27-1cfafb081dbc_Uniswap+Long+Logo.png?auto=compress,format",
      "https://logowik.com/content/uploads/images/1inch-1inch8031.jpg",
      "https://coincentral.com/wp-content/uploads/2018/01/0x.png",
    ];

    return (
      <div>
        {!showForm ? (
          <div className="flex flex-col lg:flex-row rounded-xl overflow-hidden items-center">
            {images.map((imageUrl) => (
              <div key={imageUrl} className={ImageStyles.imageContainer}>
                <img
                  src={imageUrl}
                  onClick={() => handleImageClick(imageUrl)}
                  className="w-64 h-40 object-cover rounded-xl lg:mr-10 my-6 "
                />
              </div>
            ))}
          </div>
        ) : (
          <Form />
        )}
      </div>
    );
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 custom-gradient-bg`}
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to Passivum. Your savings account for crypto.
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://www.blockchainusc.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            A Blockchain@USC Product
          </a>
        </div>
      </div>

      <div className="mt-28 relative text-3xl font-semibold flex place-items-center  ">
        Auto-Stake Assets
      </div>

      <div className="mt-8 relative text-lg sm:text-xl flex place-items-center">
        Public Address:
        <span
          className="ml-2 font-medium hover:text-blue-500 hover:cursor-pointer active:text-blue-300"
          onClick={() => navigator.clipboard.writeText(address)}
        >
          {address.substring(0, 6) +
            "..." +
            address.substring(address.length - 4, address.length)}
        </span>
      </div>

      <div className=" mt-20 font-semibold relative text-3xl flex place-items-center ">
        Balances:
      </div>

      <div className="my-8 flex flex-wrap justify-center items-center gap-4">
        {allBalances.map(({ name, balance }) => {
          return (
            <p
              key={name}
              className="text-xl text-white bg-blue-500 rounded-lg shadow-lg p-4 mb-4 before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px] w-full sm:w-auto sm:mx-2 sm:flex-grow sm:flex-shrink-0"
            >
              {name}: {balance}
            </p>
          );
        })}
      </div>

      {amtIsInvalid ? (
        <div className="relative text-3xl  place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px] bg-red-500 p-4 rounded-lg flex items-center justify-center">
          Insufficient funds or invalid amount!
        </div>
      ) : null}

      <ImageRow />

      <div className="flex my-24 text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          onClick={backButton}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>Exit</h2>
        </a>
      </div>
    </main>
  );
}
