import styles from "../styles/FormScreen.module.css";
import { useState } from "react";

type FormProps = {
  updateParentStaking: (arg0: number) => void;
};

export default function StakeForm({updateParentStaking}: FormProps) {
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // event.preventDefault();
    if (amount) {
      updateParentStaking(amount);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(event.target.value));
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Choose Amount</h2>
        <div className={styles.field}>
          <input type="number" id="amount" className={styles.input} value={amount} onChange={handleAmountChange}/>
          <select id="token-pair" className={styles.input}>
            <option value="ETH/USDT">ETH/USDT</option>
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
