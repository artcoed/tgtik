import React, { useState } from 'react';
import styles from './SubscriptionBlock.module.css';
import { ReactComponent as CloseGiftWindowIcon } from '../assets/CloseGiftWindowIcon.svg';
import { ReactComponent as MoneyWarningIcon } from '../assets/MoneyWarningIcon.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setBalance, incrementBalance } from '../store';
import type { RootState, AppDispatch } from '../store';

export interface SubscriptionBlockProps {
  onContinue?: () => void;
  money: number
  minWithdraw: number
  translations: any
}

type WithdrawFormProps = {
    minWithdraw: number
    onClose: () => void
    onWithdraw: (data: { cardData: string; amount: string }) => void
    translations: any
    showToast: (title: string, description: string) => void
}

export const WithdrawalForm: React.FC<WithdrawFormProps> = ({ onClose, minWithdraw, onWithdraw, translations, showToast }) => {
    const [card, setCard] = useState('');
    const [iban, setIban] = useState('');
    const [amount, setAmount] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    const isCardValid = /^\d{4} ?\d{4} ?\d{4} ?\d{4}$/.test(card);
    const isIbanValid = iban.length >= 15 && iban.length <= 34;
    const isAmountValid = !!amount && !isNaN(Number(amount)) && Number(amount) >= minWithdraw && Number(amount) <= 1000;
    // Форма валидна, если заполнено либо валидное поле карты, либо валидное поле IBAN, и сумма валидна
    const isFormValid = (isCardValid || isIbanValid) && isAmountValid;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowErrors(true);
        if (isFormValid) {
            let cardData = '';
            if (isCardValid) {
                cardData = card;
            } else if (isIbanValid) {
                cardData = iban;
            }
            onWithdraw({ cardData, amount });
        } else {
            showToast(translations.withdrawErrorTitle || 'Ошибка вывода', translations.withdrawErrorDesc || 'Проверьте сумму и реквизиты для вывода.');
        }
    };
    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Удаляем всё, кроме цифр
        let value = e.target.value.replace(/\D/g, "");
        // Ограничиваем длину (16 цифр)
        value = value.slice(0, 16);
        // Добавляем пробелы после каждых 4 цифр
        const formatted = value.replace(/(.{4})/g, "$1 ").trim();
        setCard(formatted);
      };
      

    return (
        <form className={styles.wrapper} onSubmit={handleSubmit}>
            <div className={styles.header}>
                <div className={styles.title}>{translations.amountToWithdraw}</div>
                <div className={styles.icon}>
                    <button className={styles.iconOutlineBtn} type="button">
                        <CloseGiftWindowIcon className={styles.iconOutline} style={{ cursor: 'pointer'}} onClick={onClose}/>
                    </button>
                </div>
            </div>
            <div className={styles.instruction}>{translations.pleaseIndicateCard}</div>
            <div className={styles.option}>
            <div className={styles.optionContent}>
                <div className={styles.optionLabel}>{translations.card}</div>
                <div className={styles.separator} />
                <input
                    className={styles.optionInput + (showErrors && card && !isCardValid ? ' ' + styles.optionInputError : '')}
                    type="text"
                    placeholder="**** **** **** ****"
                    maxLength={19}
                    value={card}
                    onChange={handleCardChange}
                />
                </div>
            </div>
            <div className={styles.instruction}>{translations.orUseIban}</div>
            <div className={styles.option}>
            <div className={styles.optionContent}>
                <div className={styles.optionLabel}>{translations.iban}</div>
                <div className={styles.separator} />
                <input
                    className={styles.optionInput + (showErrors && iban && !isIbanValid ? ' ' + styles.optionInputError : '')}
                    type="text"
                    placeholder={translations.ibanPlaceholder}
                    maxLength={34}
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                />
                </div>
            </div>
            <div className={styles.instruction}>{translations.amountToWithdraw}</div>
            <div className={styles.option}>
            <div className={styles.optionContent}>
                <div className={styles.optionLabel}>{translations.amount}</div>
                <div className={styles.separator} />
                <input
                    className={styles.optionInput + (showErrors && !isAmountValid ? ' ' + styles.optionInputError : '')}
                    type="number"
                    placeholder={translations.sum}
                    min={minWithdraw}
                    max={1000}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
                </div>
            </div>
            <button
                className={styles.button}
                type="submit"
                disabled={!isFormValid}
                // Стили теперь через .button:disabled
            >
                <div className={styles.buttonText}>
                    {translations?.withdraw || 'Withdraw'}
                    {console.log('DEBUG: translations in WithdrawalForm:', translations)}
                </div>
            </button>
        </form>
    );
};

function ProgressPath({money = 0, minWithdraw = 0, translations}: {money?: number, minWithdraw?: number, translations: any}) {
    return (
        <div className={styles.wrapper}>
            <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" width="100" height="84" viewBox="0 0 100 84" fill="none">
                <path d="M18.1802 81.82C16.2276 83.772 13.0395 83.787 11.2915 81.649C6.12248 75.327 2.56378 67.8134 0.96078 59.7545C-0.96852 50.0555 0.0216799 40.0022 3.80598 30.8658C7.59038 21.7295 13.9991 13.9206 22.2215 8.4265C30.444 2.9325 40.111 0 50 0C59.8891 0 69.5561 2.9325 77.7789 8.4265C86.0009 13.9206 92.4099 21.7295 96.1939 30.8658C99.9779 40.0022 100.969 50.0555 99.0389 59.7545C97.4359 67.8134 93.8779 75.327 88.7089 81.649C86.9609 83.787 83.7729 83.772 81.8199 81.82C79.8669 79.867 79.8959 76.718 81.5899 74.537C85.3889 69.6467 88.0149 63.9216 89.2319 57.8036C90.7749 50.0444 89.9829 42.0017 86.9549 34.6927C83.9279 27.3836 78.8009 21.1365 72.2229 16.7412C65.6449 12.346 57.9113 10 50 10C42.0888 10 34.3552 12.346 27.7772 16.7412C21.1992 21.1365 16.0723 27.3836 13.0448 34.6927C10.0173 42.0017 9.22518 50.0444 10.7686 57.8036C11.9856 63.9216 14.6114 69.6467 18.41 74.537C20.1039 76.718 20.1328 79.867 18.1802 81.82Z" fill="white" fillOpacity="0.1"/>
            </svg>
            <svg className={styles.svgFilled} xmlns="http://www.w3.org/2000/svg" width="15" height="18" viewBox="0 0 15 18" fill="none">
                <path d="M13.1805 15.82C11.2279 17.772 8.03992 17.787 6.29192 15.649C4.22122 13.116 2.40392 10.387 0.86642 7.49902C-0.43138 5.06152 0.81202 2.12592 3.36692 1.07792C5.92172 0.0299215 8.81582 1.27162 10.1742 3.67592C11.133 5.37302 12.2146 6.99802 13.4104 8.53702C15.1043 10.718 15.1331 13.867 13.1805 15.82Z" fill="#FF2B54"/>
            </svg>
            <svg className={styles.svgCircle} xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M15.3862 16.8316C19.0807 13.9353 19.7278 8.59244 16.8316 4.89796C13.9353 1.20347 8.59243 0.556383 4.89794 3.45265C1.20346 6.34891 0.556368 11.6918 3.45263 15.3863C6.3489 19.0807 11.6918 19.7278 15.3862 16.8316Z" fill="white" stroke="#FF2B54" strokeWidth="3"/>
            </svg>
            {/*<MoneyWarningIcon className={styles.moneyWarningIcon} />*/}
            <div className={styles.moneyValueContainer} >
                <span className={styles.moneyCurrentValue} >{translations.currency}{money}</span><span className={styles.moneyMaxValue}>/{translations.currency}{minWithdraw}</span>
            </div>
        </div>
    );
}

const SubscriptionBlock: React.FC<SubscriptionBlockProps> = ({ onContinue, money , minWithdraw, translations }) => {
  const dispatch = useDispatch<AppDispatch>();
  const balance = useSelector((state: RootState) => state.balance.value);
  return (
    <div className={styles.subscriptionWrapper}>
      <div className={styles.subscriptionIconWrapper}>
        <div className={styles.moneyWarningIconContainer}></div>
        <ProgressPath money={money} minWithdraw={minWithdraw} translations={translations}/>
      </div>
      <div className={styles.subscriptionTitle}>{translations.insufficientFunds}</div>
      <div className={styles.subscriptionText}>
        {translations.minimumWithdrawalLimit.replace('{currency}', translations.currency).replace('{amount}', minWithdraw.toString())}
      </div>
      <button className={styles.subscribeBtn} onClick={onContinue}>
        <span>{translations.continueWorking}</span>
      </button>
    </div>
  );
};

export default SubscriptionBlock;