'use strict';
/**
 *
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Libraries
import React, { Fragment, useState, useEffect, useCallback, useRef } from 'react';

// Load Core Libraries
import Status from 'core/status';
import Helper from 'core/helper';

// Load Custom Libraries
import _ from 'libraries/lang';

// Load Components
import FunctionalButton from 'components/common/functionalButton';
import FunctionalSelector from 'components/common/functionalSelector';
import FunctionalInput from 'components/common/functionalInput';

// Load State Control
import CommonState from 'states/common';
import ModalState from 'states/modal';

/**
 * Variables
 */
const sortList = [
    { key: 'complex', value: _('complex') },
    { key: 'defense', value: _('defense') },
    { key: 'amount', value: _('amount') },
    { key: 'slot', value: _('slot') },
    { key: 'expectedValue', value: _('expectedValue') },
    { key: 'expectedLevel', value: _('expectedLevel') }
];

const strategyList = [
    { key: 'complete', value: _('complete') },
    { key: 'speed', value: _('speed') }
];

/**
 * Handler Functions
 */
const handleLimitChange = (event) => {
    let limit = ('' !== event.target.value) ? parseInt(event.target.value) : 25;

    CommonState.setter.setAlgorithmParamsLimit(limit);
};

const handleSortChange = (event) => {
    CommonState.setter.setAlgorithmParamsSort(event.target.value);
};

const handleStrategyChange = (event) => {
    CommonState.setter.setAlgorithmParamsStrategy(event.target.value);
};

export default function AlgorithmSetting(props) {

    /**
     * Hooks
     */
    const [stateAlgorithmParams, updateAlgorithmParams] = useState(CommonState.getter.getAlgorithmParams());
    const [stateIsShow, updateIsShow] = useState(ModalState.getter.isShowAlgorithmSetting());
    const refModal = useRef();

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeCommon = CommonState.store.subscribe(() => {
            updateAlgorithmParams(CommonState.getter.getAlgorithmParams());
        });

        const unsubscribeModal = ModalState.store.subscribe(() => {
            updateIsShow(ModalState.getter.isShowAlgorithmSetting());
        });

        return () => {
            unsubscribeCommon();
            unsubscribeModal();
        };
    }, []);

    /**
     * Handle Functions
     */
    const handleFastWindowClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return;
        }

        ModalState.setter.hideAlgorithmSetting();
    }, []);

    /**
     * Render Functions
     */
    return stateIsShow ? (
        <div className="mhwc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhwc-modal mhwc-slim-modal">
                <div className="mhwc-panel">
                    <strong>{_('algorithmSetting')}</strong>

                    <div className="mhwc-icons_bundle">
                        <FunctionalButton
                            iconName="times" altName={_('close')}
                            onClick={ModalState.setter.hideAlgorithmSetting} />
                    </div>
                </div>
                <div className="mhwc-list">
                    <div className="mhwc-wrapper">
                        <div className="mhwc-item mhwc-item-2-step">
                            <div className="col-12 mhwc-name">
                                <span>顯示數量</span>

                                <div className="mhwc-icons_bundle">
                                    <FunctionalInput
                                        iconName="list-alt" placeholder={_('inputKeyword')}
                                        defaultValue={stateAlgorithmParams.limit}
                                        onChange={handleLimitChange} />
                                </div>
                            </div>
                        </div>
                        <div className="mhwc-item mhwc-item-2-step">
                            <div className="col-12 mhwc-name">
                                <span>排序方式</span>

                                <div className="mhwc-icons_bundle">
                                    <FunctionalSelector
                                        iconName="sort-amount-desc" defaultValue={stateAlgorithmParams.sort}
                                        options={sortList} onChange={handleSortChange} />
                                </div>
                            </div>
                        </div>
                        <div className="mhwc-item mhwc-item-2-step">
                            <div className="col-12 mhwc-name">
                                <span>搜尋策略</span>

                                <div className="mhwc-icons_bundle">
                                    <FunctionalSelector
                                        iconName="book" defaultValue={stateAlgorithmParams.strategy}
                                        options={strategyList} onChange={handleStrategyChange} />
                                </div>
                            </div>
                        </div>
                        <div className="mhwc-item mhwc-item-2-step">
                            <div className="col-12 mhwc-name">
                                <span>裝備因子</span>
                            </div>
                            <div className="col-12 mhwc-content">
                                {Object.keys(stateAlgorithmParams.armorFactor).map((rare) => {
                                    return (
                                        <div key={rare} className="col-6 mhwc-value">
                                            <span>{_('rare') + `: ${rare}`}</span>
                                            {stateAlgorithmParams.armorFactor[rare] ? (
                                                <div className="mhwc-icons_bundle">
                                                    <FunctionalButton
                                                        iconName="star"
                                                        altName={_('exclude')}
                                                        onClick={() => {CommonState.setter.toggleAlgorithmParamsArmorFactor(rare)}} />
                                                </div>
                                            ) : (
                                                <div className="mhwc-icons_bundle">
                                                    <FunctionalButton
                                                        iconName="star-o"
                                                        altName={_('include')}
                                                        onClick={() => {CommonState.setter.toggleAlgorithmParamsArmorFactor(rare)}} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : false;
};
