/**
 * Dataset Charm
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Core Libraries
import Helper from 'core/helper';

// Load Dataset
import Charms from 'files/json/datasets/charms.json';

// [
//     0: series [
//         0: id,
//         1: name
//     ],
//     1: items [
//         [
//             0: id
//             1: name
//             2: rare
//             3: level
//             4: skills [
//                 [
//                     0: id,
//                     1: level
//                 ]
//             ]
//         ],
//         [ ... ]
//     ]
// ]
let dataset = Charms.map((bundle) => {
    return bundle[1].map((item) => {
        return {
            seriesId: bundle[0][0],
            series: bundle[0][1],
            id: item[0],
            name: item[1],
            rare: item[2],
            level: item[3],
            skills: (Helper.isNotEmpty(item[4])) ? item[4].map((skill) => {
                return {
                    id: skill[0],
                    level: skill[1]
                };
            }) : []
        };
    });
})
.reduce((charmsA, charmsB) => {
    return charmsA.concat(charmsB);
});

class CharmDataset {

    constructor (list) {
        this.mapping = {};

        list.forEach((data) => {
            this.mapping[data.id] = data;
        });

        // Filter Conditional
        this.resetFilter();
    }

    resetFilter = () => {
        this.filterRare = null;
        this.filterSkillName = null;
    };

    getIds = () => {
        return Object.keys(this.mapping);
    };

    getItems = () => {
        let result = Object.values(this.mapping).filter((data) => {
            if (Helper.isNotEmpty(this.filterRare)) {
                if (this.filterRare !== data.rare) {
                    return false;
                }
            }

            let isSkip = true;

            if (Helper.isNotEmpty(this.filterSkillName)) {
                for (let index in data.skills) {
                    if (this.filterSkillName !== data.skills[index].id) {
                        continue;
                    }

                    isSkip = false;
                }

                if (isSkip) {
                    return false;
                }
            }

            return true;
        });

        this.resetFilter();

        return result;
    };

    getInfo = (name) => {
        return (Helper.isNotEmpty(this.mapping[name]))
            ? Helper.deepCopy(this.mapping[name]) : null;
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
}

export default new CharmDataset(dataset);
