import { useRef, useState } from "react";
import Image from "next/image";
import animationData from "../../public/success-check.json";
import Lottie from "react-lottie";
import SocialABI from "../../public/SocialRecoveyABI.json";
import { ethers } from "ethers";

export default function AddFriendsPage() {
  const friendRef = useRef<HTMLInputElement>(null);
  const deadmanRef = useRef<HTMLInputElement>(null);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [deadman, setDeadman] = useState("");
  const [nextPage, setNextPage] = useState(0);
  const [threshold, setThreshold] = useState("");
  const year = useRef<HTMLInputElement>(null);

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    background: "transparent",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const contractAddress = "0x47F828f8dBeD8e83E1897D11dC1B07bdbb81ae95";

  const addFriend = () => {
    setFriendsList([...friendsList, friendRef.current!.value]);
    friendRef.current!.value = "";
  };

  function deleteFriend(name: string) {
    setFriendsList(friendsList.filter((friend) => friend !== name));
  }

  const contractCall = async () => {
    if (nextPage === 1) {
      try {
        // set up signer and contract
        if (!window.ethereum) {
          alert("please install MetaMask");
          return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        provider.send("eth_requestAccounts", []).catch((e) => console.log(e));

        let contract = new ethers.Contract(
          contractAddress,
          SocialABI.result,
          provider.getSigner()
        );
            // BATCH
        // TODO: call contract for setup
        const txs = []

const socialSetupInterface = new ethers.utils.Interface([
  'function setup(address[] memory _friends, uint256 _threshold)'
])

// Encode an ERC-20 token approval. User approves the amount of tokens to the Hyphen LP
const data = socialSetupInterface.encodeFunctionData(
  'setup', [hyphenLiquidityPoolAddress, amount]
)

const tx1 = {
  to: usdcAddress 
  data: data
}

txs.push(tx1)




        // await contract.setup(friendsList, threshold);

        // // Call for deadman
        // const date = new Date(year.current?.value + "-06-16");

        // const unixTimestamp = Math.floor(date.getTime() / 1000);

        // await contract.setDeadMansSwitch(
        //   true,
        //   deadmanRef.current?.value,
        //   unixTimestamp
        // );
      } catch (error) {}
    }
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
      {nextPage === 2 ? (
        <div className="mt-24">
          <div className="relative text-3xl flex place-items-center ">
            Social Recovery Succesfully Enabled
          </div>
          <div className="flex justify-center items-center">
            <Lottie options={defaultOptions} height={300} width={300} />
          </div>
          <div className="text-center">
            Your wallet can now be safely recovered.
          </div>
        </div>
      ) : (
        <>
          <div className="mt-28 text-3xl font-semibold flex place-items-center  ">
            Social Recovery
          </div>
          <div className="mt-10 relative text-2xl font-semibold flex place-items-center  ">
            {nextPage === 1 ? "Step 2: Select Receiver" : "Step 1: Add Friends"}
          </div>
          <div className="text-center max-w-2xl">
            {nextPage === 1
              ? "To ensure your assets can be recovered in the event something happens to you, this will be the address that receives all your assets at the beginning of the specified year."
              : "Select friends for social recovery of your wallet. Set a threshold amount that determines how many friends are needed to approve recovery."}
          </div>

          <div className="mt-14">
            {nextPage === 1 ? (
              <div className="text-xl">Your Friends</div>
            ) : (
              <div className="space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    className="w-[25rem] p-2 rounded-lg dark:text-black"
                    ref={friendRef}
                    placeholder="Enter Friend's Address"
                  />
                  <button
                    type="submit"
                    className={`text-white-100 bg-blue-200 dark:bg-blue-800 ml-4 py-2 w-[10rem] rounded-xl text-xl`}
                    onClick={() => addFriend()}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="my-4">
            {friendsList.map((friend) => (
              <div
                className="my-3 rounded-xl flex dark:text-black bg-gray-100 hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-100 w-[30rem] p-4 justify-between text-md"
                key={friend}
                onClick={() => setDeadman(friend)}
              >
                <div>{friend}</div>
                <Image
                  src={"/garbage-icon.svg"}
                  width="24"
                  height="24"
                  alt="garbage"
                  onClick={() => deleteFriend(friend)}
                />
              </div>
            ))}
          </div>

          {nextPage === 1 ? (
            <div className="my-2 text-center">
              <div className="flex">
                <input
                  type="text"
                  className="w-[20rem] p-2 dark:text-black"
                  ref={deadmanRef}
                  placeholder="Enter a Different Receiver"
                />
                <button
                  type="submit"
                  className={`text-white-100 bg-blue-200 dark:bg-blue-800 ml-4 py-2 w-[6rem] rounded-xl text-xl`}
                  onClick={() => setDeadman(deadmanRef.current!.value)}
                >
                  Select
                </button>
              </div>
              <div className="mt-2">{`Selected receiver: ${deadman}`}</div>
            </div>
          ) : null}
          {nextPage === 0 && (
            <div className="flex-col items-center">
              <div className="flex justify-center">
                <text>Minimum Number of Approvals Needed:</text>
                <input
                  onChange={(e) => setThreshold(e.target.value)}
                  type="number"
                  min={nextPage === 0 ? "2" : "2023"}
                  className={`mx-2 px-2 dark:text-black ${
                    nextPage === 0 ? "w-[4rem]" : "w-[8rem]"
                  }`}
                  placeholder="2"
                />
              </div>
            </div>
          )}
          {nextPage === 1 && (
            <div className="flex-col items-center my-2">
              <div className="flex justify-center">
                <text>{"Year:"}</text>
                <input
                  ref={year}
                  type="number"
                  min={2024}
                  className={`mx-2 px-2 dark:text-black w-[8rem]`}
                  placeholder="2024"
                />
              </div>
            </div>
          )}
          <button
            className={`bg-blue-200 dark:bg-blue-800 ml-4 mt-5 px-8 py-2 rounded-xl text-xl`}
            onClick={() => {
              contractCall();

              setNextPage(nextPage + 1);
            }}
          >
            Continue
          </button>
        </>
      )}

      <div className="mt-10 flex mb-24 text-center lg:mb-0 lg:grid-cols-4 lg:text-center">
        <a
          href="/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className={`text-2xl font-semibold`}>Exit</h2>
        </a>
      </div>
    </main>
  );
}
