import styles from './Placeholder.module.css';

// Lightweight stub for admin sections that aren't built out yet, so the
// sidebar navigation never lands on a 404.
export default function Placeholder({ title }: { title: string }) {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </span>
        <p className={styles.text}>Розділ у розробці</p>
      </div>
    </div>
  );
}
