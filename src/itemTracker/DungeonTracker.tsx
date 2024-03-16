import { CSSProperties, useRef, useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

import Item from './Item';
import g1 from '../assets/bosses/g1.png';
import scaldera from '../assets/bosses/scaldera.png';
import moldarach from '../assets/bosses/moldarach.png';
import koloktos from '../assets/bosses/koloktos.png';
import tentalus from '../assets/bosses/tentalus.png';
import g2 from '../assets/bosses/g2.png';
import dreadfuse from '../assets/bosses/dreadfuse.png';

import noSmallKey from '../assets/dungeons/noSmallKey.png';
import oneSmallKey from '../assets/dungeons/1_smallKey.png';
import twoSmallKey from '../assets/dungeons/2_smallKey.png';
import threeSmallKey from '../assets/dungeons/3_smallKey.png';
import trialGate from '../assets/bosses/trialGate.png';
import faronTrialGate from '../assets/bosses/faronTrialGate.png';
import lanayruTrialGate from '../assets/bosses/lanayruTrialGate.png';
import eldinTrialGate from '../assets/bosses/eldinTrialGate.png';
import DungeonName from './items/dungeons/DungeonName';
import DungeonIcon from './items/dungeons/DungeonIcon';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import AreaCounters from '../locationTracker/AreaCounters';
import HintMarker from '../hints/HintMarker';
import { useSelector } from 'react-redux';
import { areasSelector, settingSelector } from '../tracker/selectors';
import {
    HintRegion,
    DungeonName as DungeonNameType,
    isDungeon,
} from '../logic/Locations';

const silentRealmData: Record<string, string> = {
    'Farore\'s Silent Realm': faronTrialGate,
    'Din\'s Silent Realm': eldinTrialGate,
    'Nayru\'s Silent Realm': lanayruTrialGate,
    'The Goddess\'s Silent Realm': trialGate,
};

const dungeonData = {
    'Skyview Temple': {
        dungeonAbbr: 'SV',
        dungeonName: 'Skyview Temple',
        bossIcon: g1,
    },
    'Earth Temple': {
        dungeonAbbr: 'ET',
        dungeonName: 'Earth Temple',
        bossIcon: scaldera,
    },
    'Lanayru Mining Facility': {
        dungeonAbbr: 'LMF',
        dungeonName: 'Lanayru Mining Facility',
        bossIcon: moldarach,
    },
    'Ancient Cistern': {
        dungeonAbbr: 'AC',
        dungeonName: 'Ancient Cistern',
        bossIcon: koloktos,
    },
    Sandship: {
        dungeonAbbr: 'SSH',
        dungeonName: 'Sandship',
        bossIcon: tentalus,
    },
    'Fire Sanctuary': {
        dungeonAbbr: 'FS',
        dungeonName: 'Fire Sanctuary',
        bossIcon: g2,
    },
    'Sky Keep': {
        dungeonAbbr: 'SK',
        dungeonName: 'Sky Keep',
        bossIcon: dreadfuse,
    },
} as const;

const smallKeyImages = [noSmallKey, oneSmallKey, twoSmallKey, threeSmallKey];

export default function DungeonTracker({
    setActiveArea,
    compact,
}: {
    setActiveArea: (area: string) => void;
    compact?: boolean;
}) {
    const [width, setWidth] = useState(0);
    const divElement = useRef<HTMLDivElement>(null);
    const areas = useSelector(areasSelector);

    const dungeons = areas.filter((a) =>
        isDungeon(a.name) && !a.hidden,
    ) as HintRegion<DungeonNameType>[];
    const silentRealms = areas.filter((a) => a.name.includes('Silent Realm'));

    useResizeObserver(divElement, () => {
        const elem = divElement.current;
        if (!elem) {
            return;
        }
        setWidth(divElement.current.clientWidth);
    });

    const numDungeons = dungeons.length;
    const iconsPerDungeon = 2;
    // scale icons differently with ER / sky keep to keep things fitted all at once
    const scaleFactor =
        (dungeons.some((d) => d.name === 'Sky Keep') ? 1.05 : 1.0) * 1.15;
    const colWidth = width / (numDungeons * iconsPerDungeon * scaleFactor);
    const secondRowWidth = width / 4;
    const keysStyle: CSSProperties = compact
        ? {
            position: 'fixed',
            margin: '0%',
            left: '0.25%',
            top: '0%',
            width,
        }
        : {
            position: 'relative',
            margin: '-2%',
            left: '3%',
        };
    const dungeonStyle: CSSProperties = {
        position: 'relative',
        top: width * -0.015,
    };
    const bossStyle: CSSProperties = {
        position: 'relative',
        top: width * -0.05,
    };
    const dungeonCheckStyle: CSSProperties = {
        position: 'relative',
        top: width * -0.05,
    };
    const trialStyle: CSSProperties = {
        position: 'relative',
        margin: '0.5%',
        left: '-1.5%',
        top: '-2%',
    };
    const trialHintStyle: CSSProperties = {
        position: 'relative',
        margin: '0.5%',
        left: '2%',
        top: '-2%',
    };
    const trialCheckStyle: CSSProperties = {
        position: 'relative',
        margin: '0.5%',
        left: '2%',
        top: '-2%',
    };

    const hideEtKeyPieces = useSelector(settingSelector('open-et'));

    return (
        <Col
            // style={{ padding: 0 }}
            id="dungeonTracker"
            ref={divElement}
        >
            <table style={keysStyle}>
                <tbody>
                    <tr>
                        {dungeons.map((d) => (
                            <React.Fragment key={d.name}>
                                {(d.name !== 'Earth Temple' ||
                                    !hideEtKeyPieces) && (
                                    <td>
                                        <Item
                                            itemName={
                                                d.name !== 'Earth Temple'
                                                    ? `${d.name} Small Key`
                                                    : 'Key Piece'
                                            }
                                            images={
                                                d.name !== 'Earth Temple'
                                                    ? smallKeyImages
                                                    : undefined
                                            }
                                            ignoreItemClass
                                            imgWidth={colWidth}
                                        />
                                    </td>
                                )}
                                <td
                                    colSpan={
                                        d.name === 'Earth Temple' &&
                                        hideEtKeyPieces
                                            ? 2
                                            : 1
                                    }
                                >
                                    <Item
                                        itemName={
                                            d.name !== 'Sky Keep'
                                                ? `${d.name} Boss Key`
                                                : 'Stone of Trials'
                                        }
                                        ignoreItemClass
                                        imgWidth={colWidth}
                                    />
                                </td>
                            </React.Fragment>
                        ))}
                    </tr>
                    <tr>
                        {dungeons.map((d) => (
                            <td colSpan={2} key={d.name} style={dungeonStyle}>
                                <DungeonName
                                    setActiveArea={setActiveArea}
                                    dungeonAbbr={
                                        dungeonData[d.name].dungeonAbbr
                                    }
                                    dungeonName={d.name}
                                />
                            </td>
                        ))}
                    </tr>
                    {!compact && (
                        <>
                            <tr>
                                {dungeons.map((d) => (
                                    <td
                                        colSpan={2}
                                        key={d.name}
                                        style={bossStyle}
                                    >
                                        <DungeonIcon
                                            area={d.name}
                                            image={dungeonData[d.name].bossIcon}
                                            iconLabel={d.name}
                                            width={colWidth * 2}
                                            groupClicked={() =>
                                                setActiveArea(d.name)
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                {dungeons.map((d) => (
                                    <td
                                        colSpan={2}
                                        key={d.name}
                                        style={dungeonCheckStyle}
                                    >
                                        <AreaCounters
                                            totalChecksLeftInArea={
                                                d.numChecksRemaining
                                            }
                                            totalChecksAccessible={
                                                d.numChecksAccessible
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        </>
                    )}
                </tbody>
            </table>
            {!compact && (
                <>
                    <Row style={trialHintStyle}>
                        {silentRealms.map((area) => (
                            <Col key={area.name}>
                                <HintMarker width={secondRowWidth / 4} />
                            </Col>
                        ))}
                    </Row>
                    <Row style={trialStyle}>
                        {silentRealms.map((a) => (
                            <Col key={a.name}>
                                <DungeonIcon
                                    image={silentRealmData[a.name]}
                                    iconLabel={a.name}
                                    area={a.name}
                                    width={secondRowWidth}
                                    groupClicked={() => setActiveArea(a.name)}
                                />
                            </Col>
                        ))}
                    </Row>
                    <Row style={trialCheckStyle}>
                        {silentRealms.map((a) => (
                            <Col key={a.name}>
                                <AreaCounters
                                    totalChecksLeftInArea={a.numChecksRemaining}
                                    totalChecksAccessible={
                                        a.numChecksAccessible
                                    }
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Col>
    );
}
