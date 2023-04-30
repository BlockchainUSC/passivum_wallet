import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import { Suspense } from "react";


const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [hasAccount, setHasAccount] = useState(false);

  const SocialLoginDynamic = dynamic(
    () => import("../components/scw").then((res) => res.default),
    {
      ssr: false,
    }
  );

  // Check if user has account
  useEffect(() => {
    if(localStorage.getItem("account") !== null) {
      setHasAccount(true);
      console.log(localStorage.getItem("account"));
    } else {
      setHasAccount(false);
    }},[]);

    // Updates parent's hasAccount state when child updates
    const onChildUpdate = () => {
      if(localStorage.getItem("account") !== null) {
        setHasAccount(true);
        console.log(localStorage.getItem("account"));
      } else {
        setHasAccount(false);
      }
    }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to Passivum. Auto-stake your idle assets today.
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

      <div className="relative text-3xl flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        PASSIVUM WALLET
      </div>

      <div>
          {/* style={{ display: hasAccount ? 'none' : 'block' }}> */}
        <Suspense fallback={<div>Loading...</div>}>
          <SocialLoginDynamic onChildUpdate={onChildUpdate}/>
        </Suspense>

      </div>

      <div className="flex mb-60 text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="/AddFriends"
          className="w-1/2 group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
          style={{ display: hasAccount ? 'block' : 'none' }}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Add Friends{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Add friends to enable social recovery for your wallet
          </p>
        </a>

        <a
          href="/AutoStake"
          className="w-1/2 group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
          style={{ display: hasAccount ? 'block' : 'none' }}
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Stake Assets{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Select liquidity pools to auto-stake your assets on UniSwap
          </p>
        </a>

       
      </div>
    </main>
  )
}
