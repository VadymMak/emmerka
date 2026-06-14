'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import styles from './AboutSection.module.css';

export default function AboutSection() {
  const t = useTranslations('About');

  return (
    <div className={styles.about}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.label}>{t('label')}</span>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={styles.text}>{t('text')}</p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>2024</span>
              <span className={styles.statLabel}>{t('yearsLabel')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>25+</span>
              <span className={styles.statLabel}>{t('dishesLabel')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>5 000+</span>
              <span className={styles.statLabel}>{t('guestsLabel')}</span>
            </div>
          </div>
        </div>

        <div className={styles.imageWrap}>
          <Image
            src="/placeholder-hero.svg"
            alt="Emmerka — interiér"
            fill
            className={styles.image}
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
