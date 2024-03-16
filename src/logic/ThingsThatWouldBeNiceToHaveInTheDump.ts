import {
    OptionType,
    OptionValue,
    TypedOptions,
} from '../permalink/SettingsTypes';

/** Exits that are not randomized even if ER is on. */
export const nonRandomizedExits = [
    '\\Faron\\Sealed Grounds\\Sealed Temple\\Gate of Time Exit',
    "\\Faron\\Sealed Grounds\\Hylia's Temple\\Gate of Time Exit",
];

/** Entrances that are not available for randomization even if ER is on. */
export const nonRandomizedEntrances = [
    '\\Faron\\Sealed Grounds\\Sealed Temple\\Gate of Time Exit',
    "\\Faron\\Sealed Grounds\\Hylia's Temple\\Gate of Time Entrance",
];

/** Exits and entrances that are neutered and don't do anything. */
export const bannedExitsAndEntrances = [
    '\\Lanayru\\Temple of Time\\Inside\\Exit to Lanayru Mining Facility',
    '\\Lanayru\\Temple of Time\\Inside\\Entrance from Lanayru Mining Facility',
    '\\Lanayru Mining Facility\\Hall of Ancient Robots\\End\\Entrance from Temple of Time',
];

/** The exit that leads from LMF to the temple of time. */
export const lmfSecondExit = '\\Lanayru Mining Facility\\Hall of Ancient Robots\\End\\Exit to Temple of Time';

type OptionMapping = [
    string,
    keyof TypedOptions,
    OptionValue | ((val: OptionValue) => boolean),
];
const m = <K extends keyof TypedOptions>(
    item: string,
    settingsKey: K,
    value: TypedOptions[K] | ((value: TypedOptions[K]) => boolean),
): OptionMapping => [item, settingsKey, value as OptionType];

export const runtimeOptions: OptionMapping[] = [
    m('Open Thunderhead option', 'open-thunderhead', 'Open'),
    m('Open ET option', 'open-et', true),
    m('Open LMF option', 'open-lmf', 'Open'),
    m('LMF Nodes On option', 'open-lmf', 'Main Node'),
    m('Open Lake Floria option', 'open-lake-floria', 'Open'),
    m('Talk to Yerbal option', 'open-lake-floria', 'Talk to Yerbal'),
    m('Vanilla Lake Floria option', 'open-lake-floria', 'Vanilla'),
    m('No BiT crashes', 'bit-patches', 'Fix BiT Crashes'),
    m('Nonlethal Hot Cave', 'damage-multiplier', (val) => val < 12),
    m('Upgraded Skyward Strike option', 'upgraded-skyward-strike', true),
    m('FS Lava Flow option', 'fs-lava-flow', true),
];

export const impaSongCheck =
    '\\Faron\\Sealed Grounds\\Sealed Temple\\Song from The Old One';
export const completeTriforceReq = '\\Complete Triforce';

export const swordsToAdd = {
    Swordless: 0,
    'Practice Sword': 1,
    'Goddess Sword': 2,
    'Goddess Longsword': 3,
    'Goddess White Sword': 4,
    'Master Sword': 5,
    'True Master Sword': 6,
};

// These requirements are populated based on required dungeons

export const gotOpeningReq = 'GoT Opening Requirement';
export const gotRaisingReq = 'GoT Raising Requirement';
export const hordeDoorReq = 'Horde Door Requirement';
