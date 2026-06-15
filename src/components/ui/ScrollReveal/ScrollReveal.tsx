'use client';

import { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import styles from './ScrollReveal.module.css';

type Animation = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scaleIn';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
  as?: 'div' | 'section';
}

export default function ScrollReveal({
  children,
  animation = 'fadeUp',
  delay = 0,
  className = '',
  as: Tag = 'div',
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLElement>}
      className={`${styles.reveal} ${isVisible ? styles.visible : ''} ${styles[animation]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
