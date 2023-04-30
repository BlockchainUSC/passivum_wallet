import ImageStyles from "../styles/ImageRow.module.css";
import StakeForm from "./StakeForm";
import React, { useState } from 'react';


export default function AutoStakePage() {
    const [showForm, setShowForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const handleImageClick = (imageUrl: React.SetStateAction<string>) => {
        setSelectedImage(imageUrl);
        setShowForm(true);
    };

    // builds the row of images
    const ImageRow = () => {
        const images = [
            'https://images.prismic.io/contrary-research/0fdbf218-37ff-4afb-af27-1cfafb081dbc_Uniswap+Long+Logo.png?auto=compress,format',
            'https://logowik.com/content/uploads/images/1inch-1inch8031.jpg',
            'https://coincentral.com/wp-content/uploads/2018/01/0x.png'
        ];

        return (
            <div>
                {!showForm ? (<div className={ImageStyles.imageRow}>
                    {images.map((imageUrl) => (
                        <div key={imageUrl} className={ImageStyles.imageContainer}>
                            <img
                                src={imageUrl}
                                onClick={() => handleImageClick(imageUrl)}
                            />
                        </div>
                    ))}
                </div>) :
                    (

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={selectedImage} style={{ width: '250px', height: '150px', marginBottom: '1rem' }} />
                            <StakeForm />
                        </div>
                    )
                }
            </div>
        );
    };

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24`}
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
                Stake your assets
            </div>

            <ImageRow />

            <div className="flex my-24 text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                <a
                    href="/"
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    rel="noopener noreferrer"
                >
                    <h2 className={`mb-3 text-2xl font-semibold`}>
                        Back
                    </h2>
                </a>
            </div>
        </main>
    );
}