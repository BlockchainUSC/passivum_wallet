import styles from "../styles/FormScreen.module.css";

export default function StakeForm() {
  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <h2 className={styles.title}>Form Title</h2>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Name:
          </label>
          <input type="text" id="name" className={styles.input} />
        </div>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email:
          </label>
          <input type="email" id="email" className={styles.input} />
        </div>
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>
    </div>
  );
}
