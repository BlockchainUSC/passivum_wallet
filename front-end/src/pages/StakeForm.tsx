import styles from "../styles/FormScreen.module.css";

export default function StakeForm() {
  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <h2 className={styles.title}>Choose Amount</h2>
        <div className={styles.field}>
          <input type="number" id="amount" className={styles.input} />
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
