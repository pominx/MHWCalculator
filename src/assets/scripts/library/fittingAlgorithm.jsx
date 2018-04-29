'use strict';
/**
 * Fitting Algorithm
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

// Load Libraries
import MD5 from 'md5';

// Load Custom Libraries
import Misc from 'library/misc';
import DataSet from 'library/dataset';

// Load Constant & Lang
import Constant from 'constant';

export default class FittingAlgorithm {

    /**
     * Search
     */
    search = (skills, equips, equipsLock) => {

        // Create 1st BundleList & Extra Info
        let requireEquips = [];
        let requireSkills = {};
        let correspondJewels = {};
        let pervBundleList = {};
        let nextBundleList = {};
        let lastBundleList = {};
        let bundle = Misc.deepCopy(Constant.defaultBundle);

        skills.sort((a, b) => {
            return b.level - a.level;
        }).forEach((skill) => {
            requireSkills[skill.name] = skill.level;

            let jewel = DataSet.jewelHelper.hasSkill(skill.name).getItems();
            jewel = (0 !== jewel.length) ? jewel[0] : null;

            correspondJewels[skill.name] = (null !== jewel) ? {
                name: jewel.name,
                size: jewel.size,
            } : null;
        });

        ['weapon', 'helm', 'chest', 'arm', 'waist', 'leg', 'charm'].forEach((equipType) => {
            if (false === equipsLock[equipType]) {
                if ('weapon' !== equipType) {
                    requireEquips.push(equipType);
                }

                return;
            }

            let equipInfo = null;
            let candidateEquip = null;

            // Get Equipment Info
            if ('weapon' === equipType) {
                equipInfo = DataSet.weaponHelper.getApplyedInfo(equips.weapon);
            } else if ('helm' === equipType
                || 'chest' === equipType
                || 'arm' === equipType
                || 'waist' === equipType
                || 'leg' === equipType) {

                equipInfo = DataSet.armorHelper.getApplyedInfo(equips[equipType]);
            } else if ('charm' === equipType) {
                equipInfo = DataSet.charmHelper.getApplyedInfo(equips.charm);
                equipInfo.type = equipType;
            }

            // Convert Equip to Candidate Equip
            candidateEquip = this.convertEquipToCandidateEquip(equipInfo);

            // Add Candidate Equip to Bundle
            bundle = this.addCandidateEquipToBundle(bundle, candidateEquip);

            // Add Jewels info to Bundle
            if (undefined !== equipInfo.slots) {
                equipInfo.slots.forEach((slot) => {
                    if (null === slot.jewel) {
                        return;
                    }

                    if (undefined === bundle.jewels[slot.jewel.name]) {
                        bundle.jewels[slot.jewel.name] = 0;
                    }

                    bundle.jewels[slot.jewel.name] += 1;
                    bundle.meta.remainingSlotCount[slot.size] -= 1;
                });
            }
        });

        // Reset Equip Count & Completed Skill Count
        bundle.meta.euqipCount = 0;
        bundle.meta.completedSkillCount = 0;

        Object.keys(requireSkills).forEach((skillName, index) => {
            let skillLevel = requireSkills[skillName];

            if (undefined === bundle.skills[skillName]) {
                bundle.skills[skillName] = 0;
            }

            if (skillLevel === bundle.skills[skillName]) {
                bundle.meta.completedSkillCount += 1;
            }
        });

        pervBundleList[this.generateBundleHash(bundle)] = bundle;

        let requireEquipCount = requireEquips.length;
        let requireSkillCount = Object.keys(requireSkills).length;

        console.log(requireSkills);
        console.log(requireEquips);
        console.log(correspondJewels);
        console.log(pervBundleList);

        // Create Next BundleList with Skill Equips
        console.log('Create Next BundleList with Skill Equips');

        let firstSkillName = Object.keys(requireSkills).shift();
        let lastSkillName = Object.keys(requireSkills).pop();
        let usedSkills = {};

        Object.keys(requireSkills).forEach((skillName, index) => {
            let skillLevel = requireSkills[skillName];

            // Set Past Skills
            usedSkills[skillName] = skillLevel;

            requireEquips.forEach((equipType) => {

                // Get Candidate Equips
                let equips = null;

                if ('helm' === equipType
                    || 'chest' === equipType
                    || 'arm' === equipType
                    || 'waist' === equipType
                    || 'leg' === equipType) {

                    equips = DataSet.armorHelper.typeIs(equipType).hasSkill(skillName).getItems();
                } else if ('charm' === equipType) {
                    equips = DataSet.charmHelper.hasSkill(skillName).getItems();
                }

                let candidateEquips = this.createCandidateEquips(equips, equipType);

                if (0 === candidateEquips.length) {
                    return;
                }

                // Add Empty Equip
                if ('charm' === equipType &&
                    skillName === lastSkillName) {

                    // pass
                } else {
                    let candidateEquip = Misc.deepCopy(Constant.defaultCandidateEquip);
                    candidateEquip.type = equipType;

                    candidateEquips.push(candidateEquip);
                }

                // Create Next BundleList By Skill Equips
                let nextBundleList = {};

                console.log(
                    'CreateNextBundleListBySkillEquips:',
                    Object.keys(pervBundleList).length,
                    equipType, candidateEquips,
                    skillName, skillLevel
                );

                candidateEquips.forEach((candidateEquip) => {
                    Object.keys(pervBundleList).forEach((hash) => {
                        let bundle = Misc.deepCopy(pervBundleList[hash]);

                        if (undefined === bundle.equips[equipType]) {
                            bundle.equips[equipType] = null;
                        }

                        if (undefined === bundle.skills[skillName]) {
                            bundle.skills[skillName] = 0;
                        }

                        // Check Equip & Skill
                        if (null !== bundle.equips[equipType]
                            || skillLevel === bundle.skills[skillName]) {

                            nextBundleList[this.generateBundleHash(bundle)] = bundle;

                            return;
                        }

                        // Check Candidate Equip
                        if (null === candidateEquip.name) {
                            nextBundleList[this.generateBundleHash(bundle)] = bundle;

                            return;
                        }

                        // Add Candidate Equip to Bundle
                        bundle = this.addCandidateEquipToBundle(bundle, candidateEquip);

                        // If Equips Is Full Then Do Fully Check
                        if (requireEquipCount === bundle.meta.euqipCount) {

                            // Completed Bundle By Skills
                            bundle = this.completeBundleBySkills(bundle, requireSkills, correspondJewels);

                            if (false === bundle) {
                                return;
                            }

                            if (requireSkillCount === bundle.meta.completedSkillCount) {
                                lastBundleList[this.generateBundleHash(bundle)] = bundle;
                            }

                            return;
                        }

                        // Reset & Add Bundle to Next Run
                        if (skillLevel < bundle.skills[skillName]) {
                            bundle = Misc.deepCopy(pervBundleList[hash]);
                            nextBundleList[this.generateBundleHash(bundle)] = bundle;

                            return;
                        }

                        if (skillLevel === bundle.skills[skillName]) {
                            bundle.meta.completedSkillCount += 1;
                        }

                        if (requireSkillCount === bundle.meta.completedSkillCount) {
                            lastBundleList[this.generateBundleHash(bundle)] = bundle;
                        } else {
                            nextBundleList[this.generateBundleHash(bundle)] = bundle;
                        }
                    });
                });

                pervBundleList = nextBundleList;
            });

            console.log('Last BundleList:', Object.keys(lastBundleList).length);
        });

        // Find Completed Bundle into Last BundleList
        console.log('Find Completed Bundle');

        nextBundleList = {};

        Object.keys(pervBundleList).forEach((hash) => {
            let bundle = Misc.deepCopy(pervBundleList[hash]);

            // Completed Bundle By Skills
            bundle = this.completeBundleBySkills(bundle, requireSkills, correspondJewels);

            if (false === bundle) {
                return;
            }

            if (requireSkillCount === bundle.meta.completedSkillCount) {
                lastBundleList[this.generateBundleHash(bundle)] = bundle;
            } else {
                nextBundleList[this.generateBundleHash(bundle)] = bundle;
            }
        });

        pervBundleList = nextBundleList;

        console.log('Last BundleList:', Object.keys(lastBundleList).length);

        // Create Next BundleList with Slot Equips
        if (0 === Object.keys(lastBundleList).length) {
            requireEquips.forEach((equipType) => {
                if ('charm' === equipType) {
                    return;
                }

                // Get Candidate Equips
                let equips = DataSet.armorHelper.typeIs(equipType).rareIs(0).getItems();
                let candidateEquips = this.createCandidateEquips(equips, equipType);

                if (0 === candidateEquips.length) {
                    return;
                }

                // Create Next BundleList By Slot Equips
                let nextBundleList = {};

                console.log(
                    'CreateNextBundleListBySlotEquips:',
                    Object.keys(pervBundleList).length,
                    equipType, candidateEquips
                );

                candidateEquips.forEach((candidateEquip) => {
                    Object.keys(pervBundleList).forEach((hash) => {
                        let bundle = Misc.deepCopy(pervBundleList[hash]);

                        if (undefined === bundle.equips[equipType]) {
                            bundle.equips[equipType] = null;
                        }

                        if (null !== bundle.equips[equipType]) {
                            nextBundleList[this.generateBundleHash(bundle)] = bundle;

                            return;
                        }

                        // Add Candidate Equip to Bundle
                        bundle = this.addCandidateEquipToBundle(bundle, candidateEquip);

                        // If Equips Is Full Then Do Fully Check
                        if (requireEquipCount === bundle.meta.euqipCount) {

                            // Completed Bundle By Skills
                            bundle = this.completeBundleBySkills(bundle, requireSkills, correspondJewels);

                            if (false === bundle) {
                                return;
                            }

                            if (requireSkillCount === bundle.meta.completedSkillCount) {
                                lastBundleList[this.generateBundleHash(bundle)] = bundle;
                            }

                            return;
                        }

                        nextBundleList[this.generateBundleHash(bundle)] = bundle;
                    });
                });

                pervBundleList = nextBundleList;
            });

            // Find Completed Bundle into Last BundleList
            console.log('Find Completed Bundle');

            Object.keys(pervBundleList).forEach((hash) => {
                let bundle = Misc.deepCopy(pervBundleList[hash]);

                // Completed Bundle By Skills
                bundle = this.completeBundleBySkills(bundle, requireSkills, correspondJewels);

                if (false !== bundle
                    && requireSkillCount === bundle.meta.completedSkillCount) {

                    lastBundleList[this.generateBundleHash(bundle)] = bundle;
                }
            });
        }

        console.log('Last BundleList:', Object.keys(lastBundleList).length);

        lastBundleList = Object.values(lastBundleList).sort((a, b) => {
            let valueA = (8 - a.meta.euqipCount) * 1000 + a.defense;
            let valueB = (8 - b.meta.euqipCount) * 1000 + b.defense;

            return valueB - valueA;
        }).slice(0, 200);

        console.log(lastBundleList);

        return lastBundleList;
    };

    /**
     * Generate Bundle Hash
     */
    generateBundleHash = (bundle) => {
        let equips = {};
        let jewels = {};

        Object.keys(bundle.equips).forEach((equipType) => {
            if (null === bundle.equips[equipType]) {
                return;
            }

            equips[equipType] = bundle.equips[equipType];
        });

        Object.keys(bundle.jewels).sort().forEach((jewelName) => {
            if (0 === bundle.jewels[jewelName]) {
                return;
            }

            jewels[jewelName] = bundle.jewels[jewelName];
        });

        return MD5(JSON.stringify([equips, jewels]));
    };

    /**
     * Create Candidate Equips
     */
    createCandidateEquips = (equips, equipType) => {
        let candidateEquips = [];

        equips.forEach((equip) => {
            equip.type = equipType;

            // Convert Equip to Candidate Equip
            let candidateEquip = this.convertEquipToCandidateEquip(equip);

            candidateEquips.push(candidateEquip);
        });

        return candidateEquips;
    };

    /**
     * Convert Equip To Candidate Equip
     */
    convertEquipToCandidateEquip = (equip) => {
        let candidateEquip = Misc.deepCopy(Constant.defaultCandidateEquip);

        // Set Name, Type & Defense
        candidateEquip.name = equip.name;
        candidateEquip.type = equip.type;
        candidateEquip.defense = (undefined !== equip.defense) ? equip.defense : 0;

        if (undefined === equip.skills) {
            equip.skills = [];
        }

        if (undefined === equip.slots) {
            equip.slots = [];
        }

        equip.skills.forEach((skill) => {
            candidateEquip.skills[skill.name] = skill.level;
        });

        equip.slots.forEach((slot) => {
            candidateEquip.ownSlotCount[slot.size] += 1;
        });

        return candidateEquip;
    };

    /**
     * Add Candidate Equip To Bundle
     */
    addCandidateEquipToBundle = (bundle, candidateEquip) => {
        if (null === candidateEquip.name) {
            return bundle;
        }

        if (undefined !== bundle.equips[candidateEquip.type]
            && null !== bundle.equips[candidateEquip.type]) {

            return bundle;
        }

        bundle.equips[candidateEquip.type] = candidateEquip.name;
        bundle.defense += candidateEquip.defense;

        Object.keys(candidateEquip.skills).forEach((skillName) => {
            let skillLevel = candidateEquip.skills[skillName];

            if (undefined === bundle.skills[skillName]) {
                bundle.skills[skillName] = 0;
            }

            bundle.skills[skillName] += skillLevel;
        });

        for (let size = 1; size <= 3; size++) {
            bundle.meta.remainingSlotCount[size] += candidateEquip.ownSlotCount[size];
        }

        bundle.meta.euqipCount += 1;
        bundle.meta.expectedValue += candidateEquip.expectedValue;

        return bundle;
    };

    /**
     * Complete Bundle By Skills
     */
    completeBundleBySkills = (bundle, skills, jewels) => {
        let isSkip = false;

        // Reset Completed Skill Count
        bundle.meta.completedSkillCount = 0;

        Object.keys(skills).forEach((skillName) => {
            if (true === isSkip) {
                return;
            }

            let skillLevel = skills[skillName];

            // Add Jewel to Bundle
            bundle = this.addJewelToBundleBySpecificSkill(bundle, {
                name: skillName,
                level: skillLevel
            }, jewels[skillName], true);

            if (false === bundle) {
                isSkip = true;

                return;
            }

            if (skillLevel === bundle.skills[skillName]) {
                bundle.meta.completedSkillCount += 1;
            }
        });

        if (true === isSkip) {
            return false;
        }

        return bundle;
    };

    /**
     * Add Jewel To Bundle By Specific Skill
     */
    addJewelToBundleBySpecificSkill = (bundle, skill, jewel, isAllowLargerSlot = false) => {
        let diffSkillLevel = skill.level - bundle.skills[skill.name];

        if (0 === diffSkillLevel) {
            return bundle;
        }

        // Failed - No Jewel
        if (null === jewel.name && 0 !== diffSkillLevel) {
            return false;
        }

        let currentSlotSize = jewel.size;
        let usedSlotCount = {
            1: 0,
            2: 0,
            3: 0
        };

        while (true) {
            if (false === isAllowLargerSlot) {

                // Failed - No Slots
                if (0 === bundle.meta.remainingSlotCount[currentSlotSize]
                    || diffSkillLevel > bundle.meta.remainingSlotCount[currentSlotSize]) {

                    return false;
                }

                break;
            } else {
                if (0 !== bundle.meta.remainingSlotCount[currentSlotSize]) {
                    if (diffSkillLevel > bundle.meta.remainingSlotCount[currentSlotSize]) {
                        usedSlotCount[currentSlotSize] = bundle.meta.remainingSlotCount[currentSlotSize];
                        diffSkillLevel -= bundle.meta.remainingSlotCount[currentSlotSize];
                    } else {
                        usedSlotCount[currentSlotSize] = diffSkillLevel;
                        diffSkillLevel = 0;
                    }
                }

                currentSlotSize += 1;

                if (0 === diffSkillLevel) {
                    break;
                }

                // Failed - No Slots
                if (3 < currentSlotSize) {
                    return false;
                }
            }
        }

        if (undefined === bundle.skills[skill.name]) {
            bundle.skills[skill.name] = 0;
        }

        if (undefined === bundle.jewels[jewel.name]) {
            bundle.jewels[jewel.name] = 0;
        }

        diffSkillLevel = skill.level - bundle.skills[skill.name];

        bundle.skills[skill.name] += diffSkillLevel;
        bundle.jewels[jewel.name] += diffSkillLevel;

        Object.keys(usedSlotCount).forEach((slotSize) => {
            bundle.meta.remainingSlotCount[slotSize] -= usedSlotCount[slotSize];
        });

        return bundle;
    };
};