import React from 'react';
import Image from 'next/image';
import styles from './button.module.scss';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};


export const BackButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'secondary', 
  size = 'medium',
  disabled = false,
  fullWidth = false,
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    styles.backButton,
    fullWidth && styles.fullWidth,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.backIcon}>
        <Image 
          src="/whitelogo.svg"
          alt="back"
          width={24}
          height={24}
        />
      </span>
      {children}
    </button>
  );
};


export const FloatingButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium', 
  disabled = false,
  icon,
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    styles.floating,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};
