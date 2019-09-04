'use strict';
/**
 * Functional Button
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Libraries
import React from 'react';

export default function FunctionalButton(props) {
    return (
        <div className="mhwc-functional_button">
            <a onClick={props.onClick}>
                <i className={`fa fa-${props.iconName}`}></i>
            </a>

            <div>
                <span>{props.altName}</span>
            </div>
        </div>
    );
};