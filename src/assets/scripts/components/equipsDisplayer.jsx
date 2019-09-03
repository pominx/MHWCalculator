'use strict';
/**
 * Equips Displayer
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Libraries
import React, { useState, useEffect } from 'react';

// Load Core Libraries
import Helper from 'core/helper';

// Load Custom Libraries
import _ from 'libraries/lang';
import JewelDataset from 'libraries/dataset/jewel';
import EnhanceDataset from 'libraries/dataset/enhance';
import SetDataset from 'libraries/dataset/set';
import SkillDataset from 'libraries/dataset/skill';
import CommonDataset from 'libraries/dataset/common';

// Load Components
import FunctionalIcon from 'components/common/functionalIcon';
import SharpnessBar from 'components/common/sharpnessBar';

// Load Config & Constant
import Config from 'config';
import Constant from 'constant';

// Load State Control
import CommonStates from 'states/common';
import ModalStates from 'states/modal';

export default function EquipsDisplayer(props) {

    /**
     * Hooks
     */
    const [stateCurrentEquips, updateCurrentEquips] = useState(CommonStates.getters.getCurrentEquips());
    const [stateRequiredEquipPins, updateRequiredEquipPins] = useState(CommonStates.getters.getRequiredEquipPins());

    // Did Mount & Will Unmount
    useEffect(() => {
        const unsubscribe = CommonStates.store.subscribe(() => {
            updateCurrentEquips(CommonStates.getters.getCurrentEquips());
            updateRequiredEquipPins(CommonStates.getters.getRequiredEquipPins());
        });

        return () => {
            unsubscribe();
        };
    }, []);

    /**
     * Handle Functions
     */
    let handleEquipsDisplayerRefresh = () => {
        CommonStates.setters.cleanRequiredEquipPins();
        CommonStates.setters.cleanCurrentEquips();
    };

    let handleEquipLockToggle = (equipType) => {
        CommonStates.setters.toggleRequiredEquipPins(equipType);
    };

    let handleEquipSwitch = (data) => {
        ModalStates.setters.showEquipItemSelector(data);
    };

    let handleEquipEmpty = (data) => {
        CommonStates.setters.setCurrentEquip(data);
    };

    /**
     * Render Functions
     */
    let renderEnhanceOption = (equipType, enhanceIndex, enhanceInfo) => {
        let selectorData = {
            equipType: equipType,
            enhanceIndex: enhanceIndex,
            enhanceId: (Helper.isNotEmpty(enhanceInfo)) ? enhanceInfo.id : null
        };

        let emptySelectorData = {
            equipType: equipType,
            enhanceIndex: enhanceIndex,
            enhanceId: null
        };

        if (Helper.isEmpty(enhanceInfo)) {
            return (
                <div key={'enhance_' + enhanceIndex} className="row mhwc-enhance">
                    <div className="col-4 mhwc-name">
                        <span>{_('enhance')}: {enhanceIndex + 1}</span>
                    </div>
                    <div className="col-8 mhwc-value">
                        <div className="mhwc-icons_bundle">
                            <FunctionalIcon
                                iconName="plus" altName={_('add')}
                                onClick={() => {handleEquipSwitch(selectorData)}} />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div key={'enhance_' + enhanceIndex} className="row mhwc-enhance">
                <div className="col-4 mhwc-name">
                    <span>{_('enhance')}: {enhanceIndex + 1}</span>
                </div>
                <div className="col-8 mhwc-value">
                    <span>{_(enhanceInfo.name)}</span>
                    <div className="mhwc-icons_bundle">
                        <FunctionalIcon
                            iconName="exchange" altName={_('change')}
                            onClick={() => {handleEquipSwitch(selectorData)}} />
                        <FunctionalIcon
                            iconName="times" altName={_('clean')}
                            onClick={() => {handleEquipEmpty(emptySelectorData)}} />
                    </div>
                </div>
            </div>
        );
    };

    let renderJewelOption = (equipType, slotIndex, slotSize, jewelInfo) => {
        let selectorData = {
            equipType: equipType,
            slotIndex: slotIndex,
            slotSize: slotSize,
            slotId: (Helper.isNotEmpty(jewelInfo)) ? jewelInfo.id : null
        };

        let emptySelectorData = {
            equipType: equipType,
            slotIndex: slotIndex,
            slotSize: slotSize,
            slotId: null
        };

        if (Helper.isEmpty(jewelInfo)) {
            return (
                <div key={'jewel_' + equipType + '_' + slotIndex} className="row mhwc-jewel">
                    <div className="col-4 mhwc-name">
                        <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
                    </div>
                    <div className="col-8 mhwc-value">
                        <div className="mhwc-icons_bundle">
                            <FunctionalIcon
                                iconName="plus" altName={_('add')}
                                onClick={() => {handleEquipSwitch(selectorData)}} />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div key={'jewel_' + equipType + '_' + slotIndex} className="row mhwc-jewel">
                <div className="col-4 mhwc-name">
                    <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
                </div>
                <div className="col-8 mhwc-value">
                    <span>[{jewelInfo.size}] {_(jewelInfo.name)}</span>
                    <div className="mhwc-icons_bundle">
                        <FunctionalIcon
                            iconName="exchange" altName={_('change')}
                            onClick={() => {handleEquipSwitch(selectorData)}} />
                        <FunctionalIcon
                            iconName="times" altName={_('clean')}
                            onClick={() => {handleEquipEmpty(emptySelectorData)}} />
                    </div>
                </div>
            </div>
        );
    };

    let renderWeaponProperties = (equipInfo) => {
        let originalSharpness = null;
        let enhancedSharpness = null;

        if (Helper.isNotEmpty(equipInfo.sharpness)) {
            originalSharpness = Helper.deepCopy(equipInfo.sharpness);
            enhancedSharpness = Helper.deepCopy(equipInfo.sharpness);
            enhancedSharpness.value += 50;
        }

        return (
            <div className="col-12 mhwc-item mhwc-properties">
                <div className="col-12 mhwc-name">
                    <span>{_('property')}</span>
                </div>
                <div className="col-12 mhwc-value">
                    <div className="row">
                        {(Helper.isNotEmpty(equipInfo.sharpness)) ? [(
                            <div key={'sharpness_1'} className="col-4">
                                <div className="mhwc-name">
                                    <span>{_('sharpness')}</span>
                                </div>
                            </div>
                        ), (
                            <div key={'sharpness_2'} className="col-8">
                                <div className="mhwc-value mhwc-sharpness">
                                    <SharpnessBar data={originalSharpness} />
                                    <SharpnessBar data={enhancedSharpness} />
                                </div>
                            </div>
                        )] : false}

                        <div className="col-4">
                            <div className="mhwc-name">
                                <span>{_('attack')}</span>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="mhwc-value">
                                <span>{equipInfo.attack}</span>
                            </div>
                        </div>

                        <div className="col-4">
                            <div className="mhwc-name">
                                <span>{_('criticalRate')}</span>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="mhwc-value">
                                <span>{equipInfo.criticalRate}%</span>
                            </div>
                        </div>

                        {(Helper.isNotEmpty(equipInfo.element)
                            && Helper.isNotEmpty(equipInfo.element.attack))
                        ? [(
                            <div key={'attackElement_1'} className="col-4">
                                <div className="mhwc-name">
                                    <span>{_('element')}: {_(equipInfo.element.attack.type)}</span>
                                </div>
                            </div>
                        ), (
                            <div key={'attackElement_2'} className="col-2">
                                <div className="mhwc-value">
                                    {equipInfo.element.attack.isHidden ? (
                                        <span>({equipInfo.element.attack.value})</span>
                                    ) : (
                                        <span>{equipInfo.element.attack.value}</span>
                                    )}
                                </div>
                            </div>
                        )] : false}

                        {(Helper.isNotEmpty(equipInfo.element)
                            && Helper.isNotEmpty(equipInfo.element.status))
                        ? [(
                            <div key={'statusElement_1'} className="col-4">
                                <div className="mhwc-name">
                                    <span>{_('element')}: {_(equipInfo.element.status.type)}</span>
                                </div>
                            </div>
                        ), (
                            <div key={'statusElement_2'} className="col-2">
                                <div className="mhwc-value">
                                    {equipInfo.element.status.isHidden ? (
                                        <span>({equipInfo.element.status.value})</span>
                                    ) : (
                                        <span>{equipInfo.element.status.value}</span>
                                    )}
                                </div>
                            </div>
                        )] : false}

                        {(Helper.isNotEmpty(equipInfo.elderseal)) ? [(
                            <div key={'elderseal_1'} className="col-4">
                                <div className="mhwc-name">
                                    <span>{_('elderseal')}</span>
                                </div>
                            </div>
                        ), (
                            <div key={'elderseal_2'} className="col-2">
                                <div className="mhwc-value">
                                    <span>{_(equipInfo.elderseal.affinity)}</span>
                                </div>
                            </div>
                        )] : false}

                        <div className="col-4">
                            <div className="mhwc-name">
                                <span>{_('defense')}</span>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="mhwc-value">
                                <span>{equipInfo.defense}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    let renderArmorProperties = (equipInfo) => {
        return (
            <div className="col-12 mhwc-item mhwc-properties">
                <div className="col-12 mhwc-name">
                    <span>{_('property')}</span>
                </div>
                <div className="col-12 mhwc-value">
                    <div className="row">
                        <div className="col-4">
                            <div className="mhwc-name">
                                <span>{_('defense')}</span>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="mhwc-value">
                                <span>{equipInfo.defense}</span>
                            </div>
                        </div>

                        {Constant.resistances.map((resistanceType) => {
                            return [(
                                <div key={resistanceType + '_1'} className="col-4">
                                    <div className="mhwc-name">
                                        <span>{_('resistance')}: {_(resistanceType)}</span>
                                    </div>
                                </div>
                            ),(
                                <div key={resistanceType + '_2'} className="col-2">
                                    <div className="mhwc-value">
                                        <span>{equipInfo.resistance[resistanceType]}</span>
                                    </div>
                                </div>
                            )];
                        })}
                    </div>
                </div>
            </div>
        );
    };

    let renderEquipBlock = (equipType, equipInfo, isEquipLock) => {
        let selectorData = {
            equipType: equipType,
            equipId: (Helper.isNotEmpty(equipInfo)) ? equipInfo.id : null
        };

        let emptySelectorData = {
            equipType: equipType,
            equipId: null
        };

        if (Helper.isEmpty(equipInfo)) {
            return (
                <div key={'equip_' + equipType} className="row mhwc-equip">
                    <div className="col-12 mhwc-name">
                        <span>{_(equipType)}</span>
                        <div className="mhwc-icons_bundle">
                            <FunctionalIcon
                                iconName="plus" altName={_('add')}
                                onClick={() => {handleEquipSwitch(selectorData)}} />
                        </div>
                    </div>
                </div>
            );
        }

        let setInfo = (Helper.isNotEmpty(equipInfo.set))
            ? SetDataset.getInfo(equipInfo.set.id) : null;

        return (
            <div key={'equip_' + equipType} className="row mhwc-equip">
                <div className="col-12 mhwc-name">
                    <span>{_(equipType)}: {_(equipInfo.name)}</span>
                    <div className="mhwc-icons_bundle">
                        <FunctionalIcon
                            iconName={isEquipLock ? 'lock' : 'unlock-alt'}
                            altName={isEquipLock ? _('unlock') : _('lock')}
                            onClick={() => {handleEquipLockToggle(equipType)}} />
                        <FunctionalIcon
                            iconName="exchange" altName={_('change')}
                            onClick={() => {handleEquipSwitch(selectorData)}} />
                        <FunctionalIcon
                            iconName="times" altName={_('clean')}
                            onClick={() => {handleEquipEmpty(emptySelectorData)}} />
                    </div>
                </div>

                {(Helper.isNotEmpty(equipInfo.enhances)
                    && 0 !== equipInfo.enhances.length)
                ? (
                    <div className="col-12 mhwc-item mhwc-enhances">
                        {equipInfo.enhances.map((data, index) => {
                            return renderEnhanceOption(
                                equipType, index,
                                EnhanceDataset.getInfo(data.id)
                            );
                        })}
                    </div>
                ) : false}

                {(Helper.isNotEmpty(equipInfo.slots)
                    && 0 !== equipInfo.slots.length)
                ? (
                    <div className="col-12 mhwc-item mhwc-slots">
                        {equipInfo.slots.map((data, index) => {
                            return renderJewelOption(
                                equipType, index, data.size,
                                JewelDataset.getInfo(data.jewel.id)
                            );
                        })}
                    </div>
                ) : false}

                {('weapon' === equipType)
                    ? renderWeaponProperties(equipInfo) : false}

                {('weapon' !== equipType && 'charm' !== equipType)
                    ? renderArmorProperties(equipInfo) : false}

                {(Helper.isNotEmpty(setInfo)) ? (
                    <div className="col-12 mhwc-item mhwc-set">
                        <div className="row">
                            <div className="col-4 mhwc-name">
                                <span>{_('set')}</span>
                            </div>
                            <div className="col-8 mhwc-value">
                                <span>{_(setInfo.name)}</span>
                            </div>
                        </div>
                    </div>
                ) : false}

                {(Helper.isNotEmpty(equipInfo.skills)
                    && 0 !== equipInfo.skills.length)
                ? (
                    <div className="col-12 mhwc-item mhwc-skills">
                        <div className="col-12 mhwc-name">
                            <span>{_('skill')}</span>
                        </div>
                        <div className="col-12 mhwc-value">
                            <div className="row">
                                {equipInfo.skills.sort((skillA, skillB) => {
                                    return skillB.level - skillA.level;
                                }).map((data) => {
                                    let skillInfo = SkillDataset.getInfo(data.id);

                                    return (Helper.isNotEmpty(skillInfo)) ? (
                                        <div key={data.id} className="col-6">
                                            <div className="mhwc-value">
                                                <span>{_(skillInfo.name)} Lv.{data.level}</span>
                                            </div>
                                        </div>
                                    ) : false;
                                })}
                            </div>
                        </div>
                    </div>
                ) : false}
            </div>
        );
    };

    let ContentBlocks = [];

    ContentBlocks.push(renderEquipBlock(
        'weapon',
        CommonDataset.getAppliedWeaponInfo(stateCurrentEquips.weapon),
        stateRequiredEquipPins.weapon
    ));

    ['helm', 'chest', 'arm', 'waist', 'leg'].forEach((equipType) => {
        ContentBlocks.push(renderEquipBlock(
            equipType,
            CommonDataset.getAppliedArmorInfo(stateCurrentEquips[equipType]),
            stateRequiredEquipPins[equipType]
        ));
    });

    ContentBlocks.push(renderEquipBlock(
        'charm',
        CommonDataset.getAppliedCharmInfo(stateCurrentEquips.charm),
        stateRequiredEquipPins.charm
    ));

    return (
        <div className="col mhwc-equips">
            <div className="mhwc-section_name">
                <span className="mhwc-title">{_('equipBundle')}</span>

                <div className="mhwc-icons_bundle">
                    <FunctionalIcon
                        iconName="refresh" altName={_('reset')}
                        onClick={handleEquipsDisplayerRefresh} />
                    <FunctionalIcon
                        iconName="th-list" altName={_('bundleList')}
                        onClick={ModalStates.setters.showEquipBundleSelector} />
                    {'production' !== Config.env ? <FunctionalIcon
                        iconName="th-large" altName={_('inventorySetting')}
                        onClick={ModalStates.setters.showInventorySetting} /> : false}
                </div>
            </div>

            <div className="mhwc-list">
                {ContentBlocks}
            </div>
        </div>
    );
}
