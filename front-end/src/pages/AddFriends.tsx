import { useRef, useState } from 'react';
import Image from 'next/image';
import animationData from '../../public/success-check.json';
import Lottie from 'react-lottie';

export default function AddFriendsPage() {
    const friendRef = useRef<HTMLInputElement>(null);
    const [friendsList, setFriendsList] = useState<string[]>([]);
    const [deadman, setDeadman] = useState('');
    const [nextPage, setNextPage] = useState(0);

    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationData,
        background: 'transparent',
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
        },
      };

    const addFriend = () => {
        setFriendsList([...friendsList, friendRef.current!.value]);
    }
    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24`}
        >
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                Welcome to Passivum. Generate passive income with your idle assets.
                </p>
                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <a
                    className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    A Blockchain@USC Product
                    </a>
                </div>
            </div>
            {nextPage === 2 ? <><div className="relative text-3xl flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
                Social Recovery Succesfully Enabled
            </div>
            <div className="flex justify-center items-center">
              <Lottie options={defaultOptions} height={300} width={300} />
            </div>
            <div>Your wallet can now be safely recovered should you lose the keys.</div></> :
                <>
                    <div className="relative text-3xl flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
                        {nextPage === 1 ? 'Select Deadman' : 'Add Friends'}
                    </div>
                    <div>{nextPage === 1 ? 'This will be the friend that receives all your assets should something happen to you' : 'Select friends for social recovery of your wallet'}</div>
                
                    <div className="mt-24 flex" >
                        {nextPage === 1 ? <div className='text-xl'>Your Friends</div> : 
                        <div>
                            <input type="text" className="w-[25rem] p-2" ref={friendRef} placeholder="Enter Address" />
                            <button
                                type="submit"
                                className={`text-white-100 bg-red-100 ml-4 py-2 w-[10rem] rounded-xl text-xl`}
                                onClick={() => addFriend()}
                            >
                                Add
                            </button>
                        </div>}
                    </div>

                    <div className="space-y-1">
                        {friendsList.map(friend => (
                        <button className="flex bg-gray-100 hover:bg-red-100 focus:bg-red-100 w-[30rem] p-4 justify-between text-md" key={friend} 
                            onClick={() => setDeadman(friend)}>
                            <div>{friend}</div>
                            <Image
                                src={'/garbage-icon.svg'}
                                width="24"
                                height="24"
                                alt="garbage"
                            />
                        </button>))}
                    </div>
                    {nextPage === 1 ? <div>{`Selected deadman: ${deadman}`}</div> : null}
                    <button
                        className={`bg-blue-100 ml-4 px-8 py-2 rounded-xl text-xl`}
                        onClick={() => setNextPage(nextPage + 1)}
                    >
                        Continue
                    </button>
                </>
            }

            <div className="flex my-24 text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                <a
                    href="/"
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    rel="noopener noreferrer"
                >
                    <h2 className={`mb-3 text-2xl font-semibold`}>
                        Exit
                    </h2>
         
                </a>
            </div>
        </main>
    );
}
