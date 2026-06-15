import styles from './loading.module.css';

export default function CatalogLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.text}>Načítavam menu...</p>
    </div>
  );
}
