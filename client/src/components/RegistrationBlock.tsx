import React, { useState } from 'react';
import styles from './RegistrationBlock.module.css';
import RegistrationInfoBlock from './RegistrationInfoBlock';

export type Sex = 'male' | 'female' | 'other'

type RegistrationBlockProps = {
  onChangeAge: (value: string) => void
  onChangeGender: (value: Sex) => void
  translations: any
}

const RegistrationBlock: React.FC<RegistrationBlockProps> = ({ onChangeAge, onChangeGender, translations }) => {
  const [sex, setSex] = useState<Sex>('other');
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Только числа, не более 3 символов
    if (!/^\d{0,3}$/.test(value)) return;
    setAge(value);
    onChangeAge(value);
    if (value === '') {
      setAgeError('');
      return;
    }
    const num = Number(value);
    if (num < 18 || num > 100) {
      setAgeError(translations.specifyAge);
    } else {
      setAgeError('');
    }
  };

  const handleGenderChange = (value: Sex) => {
    setSex(value);
    onChangeGender(value);
  };

  return (
    <>
      <div className={styles.registrationPopup}>
        <div className={styles.registrationTitle}>
          {translations.registrationRequired}
        </div>
        <div className={styles.registrationLabel}>{translations.pleaseIndicateGender}</div>
        <div className={styles.registrationGenderBlock}>
          <div className={styles.registrationGenderRow} onClick={() => handleGenderChange('male')} style={{cursor: 'pointer'}}>
            <div className={styles.registrationGenderText}>{translations.male}</div>
            <div className={styles.registrationGenderRadio + (sex === 'male' ? ' ' + styles.selected : '')}>
              {sex === 'male' && <div className={styles.registrationGenderRadioDot} />}
            </div>
          </div>
          <div className={styles.registrationGenderRow} onClick={() => handleGenderChange('female')} style={{cursor: 'pointer'}}>
            <div className={styles.registrationGenderText}>{translations.female}</div>
            <div className={styles.registrationGenderRadio + (sex === 'female' ? ' ' + styles.selected : '')}>
              {sex === 'female' && <div className={styles.registrationGenderRadioDot} />}
            </div>
          </div>
          <div className={styles.registrationGenderRow} onClick={() => handleGenderChange('other')} style={{cursor: 'pointer'}}>
            <div className={styles.registrationGenderText}>{translations.other}</div>
            <div className={styles.registrationGenderRadio + (sex === 'other' ? ' ' + styles.selected : '')}>
              {sex === 'other' && <div className={styles.registrationGenderRadioDot} />}
            </div>
          </div>
        </div>
        <div className={styles.registrationLabel}>{translations.pleaseIndicateAge}</div>
        <div className={ageError ? styles.registrationAgeBlockError : styles.registrationAgeBlock}>
          <div className={styles.registrationAgeRow}>
            <div
              className={styles.registrationAgeInput}>{translations.age}</div>
            <div className={styles.registrationAgeDivider} />
            <input
                type="number"
                className={styles.registrationAgeDesc}
                placeholder={translations.ageRange}
                value={age}
                onChange={handleAgeChange}
                min={18}
                max={100}
                maxLength={3}
            />
          </div>
        </div>
      </div>
      <RegistrationInfoBlock translations={translations} />
    </>
  );
};

export default RegistrationBlock; 