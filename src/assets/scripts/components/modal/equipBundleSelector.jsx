'use strict';
/**
 * Equip Bundle Selector
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Libraries
import React, { Component } from 'react';

// Load Core Libraries
import Status from 'core/status';
import Helper from 'core/helper';

// Load Custom Libraries
import _ from 'libraries/lang';
import WeaponDataset from 'libraries/dataset/weapon';
import ArmorDataset from 'libraries/dataset/armor';
import CharmDataset from 'libraries/dataset/charm';

// Load Components
import FunctionalIcon from 'components/common/functionalIcon';

// Load Constant
import Constant from 'constant';

// Load State Control
import CommonStates from 'states/common';
import ModalStates from 'states/modal';

export default class EquipBundleSelector extends Component {

    constructor (props) {
        super(props);

        // Initial State
        this.state = {
            reservedBundles: CommonStates.getters.getReservedBundles(),
            currentEquips: CommonStates.getters.getCurrentEquips(),
            isShow: ModalStates.getters.isShowEquipBundleSelector(),
            equips: null
        };
    }

    /**
     * Handle Functions
     */
    handleFastWindowClose = (event) => {
        if (this.refs.modal !== event.target) {
            return;
        }

        this.handleWindowClose();
    };

    handleWindowClose = () => {
        ModalStates.setters.hideEquipBundleSelector();
    };

    handleBundleSave = (index) => {
        let bundleId = (Helper.isNotEmpty(index))
            ? this.refs['bundleId_' + index].value
            : this.refs.bundleId.value;

        if (0 === bundleId.length) {
            return;
        }

        let reservedBundles = this.state.reservedBundles;

        if (Helper.isNotEmpty(index)) {
            let equipBundle = reservedBundles[index];

            equipBundle.id = bundleId;

            // Set Data to Status
            Status.set('equipBundleSelector:reservedBundles', reservedBundles);

            this.setState({
                reservedBundles: reservedBundles
            });
        } else {
            reservedBundles.push({
                id: bundleId,
                equips: this.state.equips
            });

            // Set Data to Status
            Status.set('equipBundleSelector:reservedBundles', reservedBundles);

            this.setState({
                equips: null,
                reservedBundles: reservedBundles
            });
        }
    };

    handleBundleRemove = (index) => {
        let reservedBundles = this.state.reservedBundles;

        delete reservedBundles[index];

        reservedBundles = reservedBundles.filter((euqipBundle) => {
            return (Helper.isNotEmpty(euqipBundle));
        });

        // Set Data to Status
        Status.set('equipBundleSelector:reservedBundles', reservedBundles);

        this.setState({
            reservedBundles: reservedBundles
        });
    };

    handleBundlePickUp = (index) => {
        let reservedBundles = this.state.reservedBundles;

        CommonStates.setters.replaceCurrentEquips(reservedBundles[index].equips);
        ModalStates.setters.hideEquipBundleSelector();
    };

    /**
     * Lifecycle Functions
     */
    static getDerivedStateFromProps (nextProps, prevState) {
        let equips = prevState.currentEquips;

        if (Helper.isEmpty(equips.weapon.id)
            && Helper.isEmpty(equips.helm.id)
            && Helper.isEmpty(equips.chest.id)
            && Helper.isEmpty(equips.arm.id)
            && Helper.isEmpty(equips.waist.id)
            && Helper.isEmpty(equips.leg.id)
            && Helper.isEmpty(equips.charm.id)
        ) {
            equips = null;
        }

        return {
            equips: equips
        };
    }

    componentDidMount () {
        this.unsubscribeCommon = ModalStates.store.subscribe(() => {
            this.setState({
                reservedBundles: CommonStates.getters.getReservedBundles(),
                currentEquips: CommonStates.getters.getCurrentEquips()
            });
        });

        this.unsubscribeModal = ModalStates.store.subscribe(() => {
            this.setState({
                isShow: ModalStates.getters.isShowEquipBundleSelector()
            });
        });
    }

    componentWillUnmount(){
        this.unsubscribeCommon();
        this.unsubscribeModal();
    }

    /**
     * Render Functions
     */
    renderRow = (data, index) => {
        let weaponInfo = WeaponDataset.getInfo(data.equips.weapon.id);
        let helmInfo = ArmorDataset.getInfo(data.equips.helm.id);
        let chestInfo = ArmorDataset.getInfo(data.equips.chest.id);
        let armInfo = ArmorDataset.getInfo(data.equips.arm.id);
        let waistInfo = ArmorDataset.getInfo(data.equips.waist.id);
        let legInfo = ArmorDataset.getInfo(data.equips.leg.id);
        let charmInfo = CharmDataset.getInfo(data.equips.charm.id);

        return (
            <tr key={data.id}>
                <td><input type="text" placeholder={_('inputName')} ref={'bundleId_' + index} defaultValue={data.id} /></td>
                <td><span>{(Helper.isNotEmpty(weaponInfo)) ? _(weaponInfo.name) : false}</span></td>
                <td><span>{(Helper.isNotEmpty(helmInfo)) ? _(helmInfo.name) : false}</span></td>
                <td><span>{(Helper.isNotEmpty(chestInfo)) ? _(chestInfo.name) : false}</span></td>
                <td><span>{(Helper.isNotEmpty(armInfo)) ? _(armInfo.name) : false}</span></td>
                <td><span>{(Helper.isNotEmpty(waistInfo)) ? _(waistInfo.name) : false}</span></td>
                <td><span>{(Helper.isNotEmpty(legInfo)) ? _(legInfo.name) : false}</span></td>
                <td><span>{(Helper.isNotEmpty(charmInfo)) ? _(charmInfo.name) : false}</span></td>
                <td>
                    <div className="mhwc-icons_bundle">
                        <FunctionalIcon
                            iconName="check" altName={_('select')}
                            onClick={() => {this.handleBundlePickUp(index)}} />
                        <FunctionalIcon
                            iconName="times" altName={_('remove')}
                            onClick={() => {this.handleBundleRemove(index)}} />
                        <FunctionalIcon
                            iconName="floppy-o" altName={_('save')}
                            onClick={() => {this.handleBundleSave(index)}} />
                    </div>
                </td>
            </tr>
        );
    };

    renderTable = () => {
        let equips = this.state.equips;
        let reservedBundles = this.state.reservedBundles;

        let DefaultRow = false;

        if (Helper.isNotEmpty(equips)) {
            let weaponInfo = WeaponDataset.getInfo(equips.weapon.id);
            let helmInfo = ArmorDataset.getInfo(equips.helm.id);
            let chestInfo = ArmorDataset.getInfo(equips.chest.id);
            let armInfo = ArmorDataset.getInfo(equips.arm.id);
            let waistInfo = ArmorDataset.getInfo(equips.waist.id);
            let legInfo = ArmorDataset.getInfo(equips.leg.id);
            let charmInfo = CharmDataset.getInfo(equips.charm.id);

            DefaultRow = (
                <tr>
                    <td><input type="text" placeholder={_('inputName')} ref="bundleId" /></td>
                    <td><span>{(Helper.isNotEmpty(weaponInfo)) ? _(weaponInfo.name) : false}</span></td>
                    <td><span>{(Helper.isNotEmpty(helmInfo)) ? _(helmInfo.name) : false}</span></td>
                    <td><span>{(Helper.isNotEmpty(chestInfo)) ? _(chestInfo.name) : false}</span></td>
                    <td><span>{(Helper.isNotEmpty(armInfo)) ? _(armInfo.name) : false}</span></td>
                    <td><span>{(Helper.isNotEmpty(waistInfo)) ? _(waistInfo.name) : false}</span></td>
                    <td><span>{(Helper.isNotEmpty(legInfo)) ? _(legInfo.name) : false}</span></td>
                    <td><span>{(Helper.isNotEmpty(charmInfo)) ? _(charmInfo.name) : false}</span></td>
                    <td>
                        <div className="mhwc-icons_bundle">
                            <FunctionalIcon
                                iconName="floppy-o" altName={_('save')}
                                onClick={() => {this.handleBundleSave(null)}} />
                        </div>
                    </td>
                </tr>
            );
        }

        return (
            <table className="mhwc-equip_bundle_table">
                <thead>
                    <tr>
                        <td>{_('name')}</td>
                        <td>{_('weapon')}</td>
                        <td>{_('helm')}</td>
                        <td>{_('chest')}</td>
                        <td>{_('arm')}</td>
                        <td>{_('waist')}</td>
                        <td>{_('leg')}</td>
                        <td>{_('charm')}</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {DefaultRow}
                    {reservedBundles.map(this.renderRow)}
                </tbody>
            </table>
        );
    };

    render () {
        return this.state.isShow ? (
            <div className="mhwc-selector" ref="modal" onClick={this.handleFastWindowClose}>
                <div className="mhwc-modal">
                    <div className="mhwc-panel">
                        <div className="mhwc-icons_bundle">
                            <FunctionalIcon
                                iconName="times" altName={_('close')}
                                onClick={this.handleWindowClose} />
                        </div>
                    </div>
                    <div className="mhwc-list">
                        {this.renderTable()}
                    </div>
                </div>
            </div>
        ) : false;
    }
}
