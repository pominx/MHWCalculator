'use strict';
/**
 * Dataset Jewel Helper
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Constant
import Constant from 'constant';

// Load Dataset
import Jewels from 'datasets/jewels';

// [
//     0: name,
//     1: rare,
//     2: size,
//     3: skill [
//         0: name,
//         1: level
//     ]
// ]
let dataset = Jewels.map((jewel) => {
    return {
        name: jewel[0],
        rare: jewel[1],
        size: jewel[2],
        skill: {
            name: jewel[3][0],
            level: jewel[3][1]
        }
    };
});

class JewelHelper {

    constructor (list) {
        this.mapping = {};

        list.forEach((data) => {
            this.mapping[data.name] = data;
        });

        // Filter Conditional
        this.resetFilter();
    }

    resetFilter = () => {
        this.filterSkillName = null;
        this.filterRare = null;
        this.filterSize = null;
        this.filterSizeCondition = null;
    };

    getNames = () => {
        return Object.keys(this.mapping);
    };

    getItems = () => {
        let result = Object.values(this.mapping).filter((data) => {
            if (null !== this.filterRare) {
                if (this.filterRare !== data.rare) {
                    return false;
                }
            }

            if (null !== this.filterSkillName) {
                if (this.filterSkillName !== data.skill.name) {
                    return false;
                }
            }

            if (null !== this.filterSize) {
                switch (this.filterSizeCondition) {
                case 'equal':
                    if (this.filterSize !== data.size) {
                        return false;
                    }

                    break;
                case 'greaterEqual':
                    if (this.filterSize > data.size) {
                        return false;
                    }

                    break;
                }
            }

            return true;
        });

        this.resetFilter();

        return result;
    };

    getInfo = (name) => {
        return undefined !== this.mapping[name]
            ? JSON.parse(JSON.stringify(this.mapping[name])) : null;
    };

    // Conditional Functions
    rareIs = (number) => {
        this.filterRare = number;

        return this;
    };

    hasSkill = (name) => {
        this.filterSkillName = name;

        return this;
    };

    sizeIsGreaterEqualThen = (value) => {
        this.filterSize = value;
        this.filterSizeCondition = 'greaterEqual';

        return this;
    };

    sizeIsEqualThen = (value) => {
        this.filterSize = value;
        this.filterSizeCondition = 'equal';

        return this;
    };
}

export default new JewelHelper(dataset);
