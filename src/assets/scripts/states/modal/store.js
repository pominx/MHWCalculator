/**
 * Modal State - Store
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Libraries
import { createStore, applyMiddleware } from 'redux';

// Load Core Libraries
import Status from 'core/status';
import Helper from 'core/helper';

const statusPrefix = 'state:modal';

// Middleware
const diffLogger = store => next => action => {
    let prevState = store.getState();
    let result = next(action);
    let nextState = store.getState();
    let diffState = {};

    for (let key in prevState) {
        if (JSON.stringify(prevState[key]) === JSON.stringify(nextState[key])) {
            continue;
        }

        diffState[key] = nextState[key];

        Status.set(statusPrefix + ':' + key, nextState[key]);
    }

    Helper.log('State: Modal -> action', action);
    Helper.log('State: Modal -> diffState', diffState);

    return result;
};

// Initial State
const initialState = {
    changelog: Status.get(statusPrefix + ':changelog') || {
        isShow: false
    },
    algorithmSetting: Status.get(statusPrefix + ':algorithmSetting') || {
        isShow: false
    },
    bundleItemSelector: Status.get(statusPrefix + ':bundleItemSelector') || {
        isShow: false
    },
    conditionItemSelector: Status.get(statusPrefix + ':conditionItemSelector') || {
        isShow: false,
        bypassData: null
    },
    equipItemSelector: Status.get(statusPrefix + ':equipItemSelector') || {
        isShow: false,
        bypassData: null
    }
};

export default createStore((state = initialState, action) => {
    switch (action.type) {
    case 'UPDATE_CHANGELOG':
        return Object.assign({}, state, {
            changelog: {
                isShow: action.payload.isShow
            }
        });
    case 'UPDATE_ALGORITHM_SETTING':
        return Object.assign({}, state, {
            algorithmSetting: {
                isShow: action.payload.isShow
            }
        });
    case 'UPDATE_BUNDLE_ITEM_SELECTOR':
        return Object.assign({}, state, {
            bundleItemSelector: {
                isShow: action.payload.isShow
            }
        });
    case 'UPDATE_CONDITION_ITEM_SELECTOR':
        return Object.assign({}, state, {
            conditionItemSelector: {
                isShow: action.payload.isShow,
                bypassData: action.payload.bypassData
            }
        });
    case 'UPDATE_EQUIP_ITEM_SELECTOR':
        return Object.assign({}, state, {
            equipItemSelector: {
                isShow: action.payload.isShow,
                bypassData: action.payload.bypassData
            }
        });
    default:
        return state;
    }
}, applyMiddleware(diffLogger));
