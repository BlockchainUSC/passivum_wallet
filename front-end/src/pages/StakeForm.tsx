import styles from "../styles/FormScreen.module.css";

export default function StakeForm() {
  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <h2 className={styles.title}>Choose Amount</h2>
        <div className={styles.field}>
          <input type="number" id="amount" className={styles.input} />
        </div>
        <button type="submit" className={styles.button}>
          Stake
        </button>
      </form>
    </div>
  );
}
