import { setCounterBasis } from './customization/slice';
import { RemoteReference, getAndPatchLogic } from './loader/LogicLoader';
import { LogicalState } from './logic/Locations';
import { loadLogic } from './logic/slice';
import { defaultSettings } from './permalink/Settings';
import { AllTypedOptions, TypedOptions } from './permalink/SettingsTypes';
import { RootState, Store, createStore } from './store/store';
import { allSettingsSelector, areasSelector, checkSelector, totalCountersSelector } from './tracker/selectors';
import { acceptSettings, clickCheck, clickDungeonName, clickItem, reset, setCheckHint } from './tracker/slice';
import fs from 'node:fs';

const main: RemoteReference = {
    type: 'forkBranch',
    author: 'ssrando',
    repoName: 'ssrando',
    branch: 'main',
}

describe('full logic tests', () => {
    let store: Store;
    let defaultSet: AllTypedOptions;

    beforeAll(async () => {
        store = createStore();

        const loader = async (fileName: string) =>
            await fs.promises.readFile(`./testData/${fileName}.yaml`, 'utf-8');
        const [logic, options] = await getAndPatchLogic(loader);
        defaultSet = defaultSettings(options);
        store.dispatch(loadLogic({ logic, options, remote: main, remoteName: 'ssrando/main' }));
    });

    // Before each test, must reset our tracker to default
    beforeEach(() => {
        store.dispatch(reset({ settings: defaultSet }))
    });

    /**
     * Read the value of a selector. The result is not reactive,
     * so for updated state you must read again after dispatching any actions.
     */
    function readSelector<T>(selector: (state: RootState) => T): T {
        return selector(store.getState());
    }

    /**
     * Check that a check of the given name exists in the area, and return its id.
     */
    function findCheckId(areaName: string, checkName: string) {
        const area = findArea(areaName);
        const check = area.checks.find((c) => c.includes(checkName)) ?? area.extraChecks.tr_cube?.find((c) => c.includes(checkName));
        expect(check).toBeDefined();
        return check!;
    }

    /**
     * Finds an area by name and asserts that it exists.
     */
    function findArea(areaName: string) {
        const area = readSelector(areasSelector).find((a) => a.name === areaName)!;
        expect(area).toBeDefined();
        return area;
    }

    /**
     * Check that a check of the given name *does not* exist in the area (most likely is banned).
     * To protect against typos, you should also verify that the check exists with different settings.
     */
    function expectCheckAbsent(areaName: string, checkName: string) {
        const area = findArea(areaName);
        const check = area.checks.find((c) => c.includes(checkName));
        expect(check).toBeUndefined();
        const maybeCube = area.extraChecks.tr_cube?.find((c) => c.includes(checkName));
        expect(maybeCube).toBeUndefined();
    }

    /** Set a particular settings value. */
    function updateSettings<K extends keyof TypedOptions>(option: K, value: TypedOptions[K]) {
        const settings = { ...readSelector(allSettingsSelector), [option]: value };
        store.dispatch(acceptSettings({ settings }));
    }

    function checkState(checkId: string): LogicalState {
        return readSelector(checkSelector(checkId)).logicalState;
    }

    it('has some checks in logic with default settings', () => {
        const fledgesGiftId = findCheckId('Upper Skyloft', 'Fledge\'s Gift');
        expect(checkState(fledgesGiftId)).toBe('inLogic');
    });

    it('supports hint item semilogic', () => {
        const fledgesGiftId = findCheckId('Upper Skyloft', 'Fledge\'s Gift');
        const zeldaClosetGift = findCheckId('Upper Skyloft', 'Zelda\'s Closet');

        // Zelda's Closet is out of logic because it needs clawshots
        expect(checkState(zeldaClosetGift)).toBe('outLogic');

        // But if Fledge's Gift is hinted to be Clawshots...
        store.dispatch(setCheckHint({ checkId: fledgesGiftId, hint: 'Clawshots' }));

        // Then Zelda's Closet is semilogic
        expect(checkState(zeldaClosetGift)).toBe('semiLogic');
    });

    it('supports goddess chests and semilogic', () => {
        const chestName = 'Northeast Island Goddess Chest behind Bombable Rocks';
        const cubeName = 'Goddess Cube at Lanayru Mine Entrance';
        // Goddess chests are excluded by default
        expectCheckAbsent('Sky', chestName);
        expectCheckAbsent('Lanayru Mine', cubeName);

        updateSettings('excluded-locations', []);
        const goddessChest = findCheckId('Sky', chestName);
        const cubeCheck = findCheckId('Lanayru Mine', cubeName);

        expect(checkState(goddessChest)).toBe('outLogic');

        store.dispatch(clickItem({ item: 'Clawshots', take: false }));
        store.dispatch(clickItem({ item: 'Amber Tablet', take: false }));

        // Still out of logic since we still needs bombs to access the chest itself,
        // even if we can access the cube
        expect(checkState(goddessChest)).toBe('outLogic');

        // With bombs, it's semilogic
        store.dispatch(clickItem({ item: 'Bomb Bag', take: false }));
        expect(checkState(goddessChest)).toBe('semiLogic');

        store.dispatch(clickCheck({ checkId: cubeCheck }));

        // And once we collect the cube, the chest is in logic
        expect(checkState(goddessChest)).toBe('inLogic');;
    });

    it('bans goddess chest if cube is in EUD Skyview Temple', () => {
        const chestName = 'Lumpy Pumpkin\\Goddess Chest on the Roof';
        const cubeName = 'Goddess Cube in Skyview Temple Spring';

        updateSettings('excluded-locations', []);
        updateSettings('empty-unrequired-dungeons', true);
        expectCheckAbsent('Sky', chestName);
        expectCheckAbsent('Skyview Temple', cubeName);

        // Either EUD is off
        updateSettings('empty-unrequired-dungeons', false);
        findCheckId('Sky', chestName);
        findCheckId('Skyview Temple', cubeName);

        // Or SV is required
        updateSettings('empty-unrequired-dungeons', true);
        store.dispatch(clickDungeonName({ dungeonName: 'Skyview Temple' }));
        findCheckId('Sky', chestName);
        findCheckId('Skyview Temple', cubeName);
    });

    it('shows or hides Sky Keep depending on settings', () => {
        const skyKeepHidden = () => readSelector(areasSelector).find((a) => a.name === 'Sky Keep')!.hidden;
        expect(skyKeepHidden()).toBe(true);

        updateSettings('randomize-entrances', 'All Surface Dungeons + Sky Keep');
        expect(skyKeepHidden()).toBe(false);

        updateSettings('randomize-entrances', 'All Surface Dungeons');
        expect(skyKeepHidden()).toBe(true);
        updateSettings('randomize-entrances', 'Required Dungeons Separately');
        expect(skyKeepHidden()).toBe(true);

        updateSettings('triforce-shuffle', 'Sky Keep');
        expect(skyKeepHidden()).toBe(false);
        updateSettings('triforce-shuffle', 'Vanilla');
        expect(skyKeepHidden()).toBe(false);
    });

    it('handles countable items', () => {
        const check = findCheckId('Eldin Volcano', 'Chest behind Bombable Wall near Volcano Ascent');
        expect(checkState(check)).toBe('outLogic');

        store.dispatch(clickItem({ item: 'Ruby Tablet', take: false }));
        expect(checkState(check)).toBe('outLogic');
        store.dispatch(clickItem({ item: 'Progressive Beetle', take: false }));
        expect(checkState(check)).toBe('outLogic');
        store.dispatch(clickItem({ item: 'Progressive Beetle', take: false }));
        expect(checkState(check)).toBe('inLogic');
    });

    it('handles semilogic counters', () => {
        const area = findArea('Batreaux\'s House');
        expect(area.numChecksRemaining).toBeGreaterThan(0);
        expect(area.numChecksAccessible).toBe(0);
        const totalCounter = readSelector(totalCountersSelector).numAccessible;

        store.dispatch(setCounterBasis('semilogic'));

        const areaWithSemilogic = findArea('Batreaux\'s House');
        expect(areaWithSemilogic.numChecksRemaining).toBeGreaterThan(0);
        expect(areaWithSemilogic.numChecksAccessible).toBe(2);

        const totalCounterWithSemilogic = readSelector(totalCountersSelector).numAccessible;
        expect(totalCounterWithSemilogic).toBeGreaterThan(totalCounter);

    });
});
