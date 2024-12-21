import React from 'react';
import Image from 'next/image';
import styles from './input.module.scss';

interface BaseInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

interface NumberInputProps extends BaseInputProps {
  type: 'number';
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

interface TextInputProps extends BaseInputProps {
  type: 'text';
  value: string; 
  onChange: (value: string) => void;
}

interface LongTextInputProps extends BaseInputProps {
  type: 'longText';
  value: string;
  onChange: (value: string) => void;
}

interface IconTextInputProps extends BaseInputProps {
  type: 'iconText';
  value: string;
  onChange: (value: string) => void;
  icon: string;
  alt: string;
}

type InputProps = NumberInputProps | TextInputProps | IconTextInputProps | LongTextInputProps;

const Input: React.FC<InputProps> = (props) => {
  const { label, placeholder, error, required } = props;
  const renderInput = () => {
    switch (props.type) {
        
      case 'number':
        return (
          <div className={styles.numberInputWrapper}>
            <div className={styles.numberControls}>
              <input
                type="number"
                value={props.value}
                onChange={(e) => props.onChange(Number(e.target.value))}
                min={props.min}
                max={props.max}
                placeholder={placeholder}
                className={`${styles.numberInput} ${error ? styles.inputError : ''}`}
              />
              <div className={styles.numberButtons}>
                <div className={styles.numberButton} onClick={() => { const newValue = Number(props.value) + 1; if (!props.max || newValue <= props.max) props.onChange(newValue); }}>▲</div>
                <div className={styles.numberButton} onClick={() => { const newValue = Number(props.value) - 1; if (!props.min || newValue >= props.min) props.onChange(newValue); }}>▼</div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={placeholder}
            className={`${styles.textInput} ${error ? styles.inputError : ''}`}
          />
        );
      case 'longText':
        return (
          <textarea
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={placeholder}
            className={`${styles.longTextInput} ${error ? styles.inputError : ''}`}
            rows={4}
          />
        );
      case 'iconText':
        return (
          <div className={styles.iconInputWrapper}>
            <Image
              src={props.icon}
              alt={props.alt}
              width={20}
              height={20}
              className={styles.inputIcon}
            />
            <input
              type="text"
              value={props.value}
              onChange={(e) => props.onChange(e.target.value)}
              placeholder={placeholder}
              className={`${styles.iconTextInput} ${error ? styles.inputError : ''}`}
            />
          </div>
        );
    }
  };

  return (
    <div className={styles.inputContainer}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {renderInput()}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input;
