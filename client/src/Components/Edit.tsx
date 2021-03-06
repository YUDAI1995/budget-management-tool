import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    addBudget,
    RequestData,
    RequestDataSuccess,
    RequestDataFailed,
} from '../store/budgetListSlice';
import { validate } from 'class-validator';
import DatePicker, { registerLocale } from 'react-datepicker';
import ja from 'date-fns/locale/ja';
import classNames from 'classnames/bind';
import {
    Budget,
    balanceType,
    BalanceTypes,
    getRandomID,
} from '../Model/budget.model';
import { DateModel, formatDate } from '../Model/Date.model';
import { getTypeNumber } from '../Model/Category.model';
import axios from 'axios';
import { ContentLayout } from './Layout/ContentLayout';
import { ColumnLayout } from './Layout/Column/ColumnLayout';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/Edit.module.scss';
import { useLocation } from 'react-router';

export const Edit: React.FC = () => {
    const location = useLocation();
    const [inputAmount, setInputAmount] = useState('');
    const [inputContent, setInputContent] = useState('');

    const [activeTab, setActiveaTab] = useState(balanceType[0].typename);

    const [targetDate, setTargetDate] = useState(
        location.state ? (location.state as { date: Date }).date : new Date()
    );
    const [selectCategory, setSelectCategory] = useState(0);

    registerLocale('ja', ja);

    const categoryList = useSelector(
        (state: RootState) => state.CategoryList.data
    );

    const onClickCategoryHandler = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();

        setSelectCategory(+event.currentTarget.dataset.id!);
        const ele = document.getElementById('submitBtn')!;
        ele.focus();
    };

    const dispatch = useDispatch();

    const newItemSubmitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        const newID = getRandomID(),
            newAmount = +inputAmount,
            newType = balanceType.findIndex(
                (type) => type.typename === activeTab
            ),
            newContent = inputContent,
            newCategory = selectCategory,
            newDate = formatDate(targetDate, DateModel.YY_MM_DD);

        const newData = new Budget(
            newID,
            newAmount,
            newType,
            newContent,
            newDate,
            newCategory
        );

        // ?????????????????????
        validate(newData)
            .then((errors) => {
                if (errors.length > 0) {
                    throw errors;
                }

                dispatch(RequestData({}));
                // POST???????????????
                axios
                    .post('/api', {
                        newData,
                    })
                    .then((response) => {
                        dispatch(
                            addBudget({
                                newID,
                                newAmount,
                                newType,
                                newContent,
                                newDate,
                                newCategory,
                            })
                        );
                        setInputAmount('');
                        setInputContent('');
                        dispatch(RequestDataSuccess({}));
                    })
                    .catch((err) => {
                        console.log(err);
                        dispatch(RequestDataFailed({}));
                    });
            })

            // ??????????????????????????????????????????
            .catch((err) => {
                if (err.length > 0) {
                    err.forEach((err: any) => {
                        if (err.property === 'categoryId') {
                            alert('??????????????????????????????');
                        } else if (err.property === 'amount') {
                            alert('??????????????????????????????');
                        } else {
                            alert('?????????????????????');
                        }
                    });
                }
            });
    };

    // ?????????????????????class???????????????
    const tabCx = classNames.bind(styles);
    const tabClass = (typename: BalanceTypes['typename']) => {
        return tabCx({
            typeTab: true,
            isActive: typename === balanceType[0].typename,
        });
    };

    // ????????????????????????????????????class???????????????
    const categoryCx = classNames.bind(styles);
    const categoryClass = (categoryId: number) => {
        return categoryCx({
            categoryBtn: true,
            isActive: categoryId === selectCategory,
        });
    };

    return (
        <>
            <ContentLayout title="???????????????">
                <form
                    onSubmit={newItemSubmitHandler}
                    className={styles.editForm}
                >
                    <div
                        className={tabClass(activeTab)}
                        onClick={() =>
                            setActiveaTab((prevState) =>
                                prevState === balanceType[0].typename
                                    ? balanceType[1].typename
                                    : balanceType[0].typename
                            )
                        }
                    >
                        <p className={styles.tabCircle}>{activeTab}</p>
                        <ul className={styles.tabList}>
                            {balanceType.map((type, index) => (
                                <li key={index} className={styles.tabListItem}>
                                    {type.typename}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <ColumnLayout width={[50, 50]}>
                        {
                            <>
                                <div
                                    className={classNames(
                                        `${styles.inputDate} ${styles.input}`
                                    )}
                                >
                                    <label
                                        htmlFor="date"
                                        className={styles.label}
                                    >
                                        ??????
                                    </label>
                                    <DatePicker
                                        id="date"
                                        dateFormat="yyyy/MM/dd"
                                        selected={targetDate}
                                        locale="ja"
                                        onChange={(date: Date) =>
                                            setTargetDate(date)
                                        }
                                        className={styles.editArea}
                                    />
                                </div>
                                <div
                                    className={classNames(
                                        `${styles.inputAmount} ${styles.input}`
                                    )}
                                >
                                    <label
                                        htmlFor="amount"
                                        className={styles.label}
                                    >
                                        ??????
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        placeholder="??????????????????????????????"
                                        min={1}
                                        max={100000000}
                                        className={styles.editArea}
                                        value={inputAmount}
                                        onChange={(e) =>
                                            setInputAmount(e.target.value)
                                        }
                                    />
                                </div>

                                <div
                                    className={classNames(
                                        `${styles.inputContent} ${styles.input}`
                                    )}
                                >
                                    <label
                                        htmlFor="content"
                                        className={styles.label}
                                    >
                                        ??????
                                    </label>
                                    <input
                                        type="text"
                                        id="content"
                                        placeholder="??????????????????????????????(??????)"
                                        className={styles.editArea}
                                        value={inputContent}
                                        onChange={(e) =>
                                            setInputContent(e.target.value)
                                        }
                                    />
                                </div>
                            </>
                        }
                        {
                            <div
                                className={classNames(
                                    `${styles.inputCategory} ${styles.input}`
                                )}
                            >
                                <label
                                    htmlFor="category"
                                    className={styles.label}
                                >
                                    ????????????
                                </label>
                                <ul
                                    className={`${styles.categoryList} ${styles.editArea}`}
                                >
                                    {categoryList[getTypeNumber(activeTab)].map(
                                        (category) => (
                                            <li
                                                key={category.categoryId}
                                                className={`category${category.categoryId} ${styles.category}`}
                                            >
                                                <button
                                                    onClick={
                                                        onClickCategoryHandler
                                                    }
                                                    data-id={
                                                        category.categoryId
                                                    }
                                                    className={categoryClass(
                                                        category.categoryId
                                                    )}
                                                    style={{
                                                        color: `${category.color}`,
                                                    }}
                                                >
                                                    {category.name}
                                                </button>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        }
                    </ColumnLayout>
                    <div className={styles.buttonWrapper}>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            id="submitBtn"
                        >
                            ????????????
                        </button>
                    </div>
                </form>
            </ContentLayout>
        </>
    );
};
