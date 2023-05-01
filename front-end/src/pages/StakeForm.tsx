import styles from "../styles/FormScreen.module.css";
import { useState } from "react";
import { TokenPaymasterInterface } from "@account-abstraction/contracts/dist/types/TokenPaymaster";

// Takes in first token name, second token name, first token amount, second token amount
// Then updates the state in the parent accordingly
type FormProps = {
  updateParentStaking: (arg0: string, arg1:string, arg2: number, arg3: number) => void;
};

export default function StakeForm({updateParentStaking}: FormProps) {
  const [amountOne, setAmountOne] = useState<number>(0);
  const [amountTwo, setAmountTwo] = useState<number>(0);
  const [tokenOneName, setTokenOneName] = useState<string>("ETH");
  const [tokenTwoName, setTokenTwoName] = useState<string>("USDT");

  // Handles when the user selects different token paris
  const handleTokenPairChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tokenPair = event.target.value;
    const tokens = tokenPair.split("/");
    setTokenOneName(tokens[0]);
    setTokenTwoName(tokens[1]);
  };

  // Handles when the user submits the form
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // event.preventDefault();
    if (amountOne >= 0 && amountTwo >= 0) {
      updateParentStaking(tokenOneName, tokenTwoName, amountOne, amountTwo);
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
            <option value="ETH/USDT" selected>ETH/USDT</option>
            <option value="WBTC/ETH">WBTC/ETH</option>
            <option value="USDC/ETH">USDC/ETH</option>
            <option value="LINK/ETH">LINK/ETH</option>
          </select>
        </div>
        <button type="submit" className={styles.button}>
          Stake
        </button>
      </form>
    </div>
  );
}
