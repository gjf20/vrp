import {Point, Route, Trips} from './models';

const driverFlatRate = 500;
const maxDriveDistance = 12 * 60; //720

const origin: Point = {
    x: 0,
    y: 0,
};

// total number of points >>> 200 loads in problem => very sparse graph
/**
   (probably shouldn't use a 2d array for constant time lookup)
 * But we could use a hashmap (radial distance is the hash)
 */
///
function distance(a: Point, b: Point): number {
    return (((b.x - a.x) ^ 2) + ((b.y - a.y) ^ 2)) ^ 0.5;
}

type SavingsMerge = {savings: number; parent: 'a' | 'b'};

function savingsIfMerged(a: Route, b: Route): SavingsMerge {
    // assume that each route is already in order
    const endA = a[a.length - 1];
    const endB = b[b.length - 1];
    const aEndbStart = distance(endA, b[0]);
    const bEndaStart = distance(endB, a[0]);

    if (aEndbStart < bEndaStart) {
        return {parent: 'a', savings: distance(endA, origin) + distance(origin, b[0]) - aEndbStart}; // savings formula from Clark and Wright [1]
    } else {
        return {parent: 'b', savings: distance(endB, origin) + distance(origin, a[0]) - bEndaStart}; // same as a
    }
}

type SavingsEntry = {
    savings: number;
    a: number;
    b: number;
    parent: 'a' | 'b';
};

/**
 *
 * Implementation of Clarke and Wright's savings algorithm [1]
 */
export function assignDrivers(trips: Trips) {
    const potenialSavings: SavingsEntry[] = [];
    // 1. calculate the savings for the combinations of trips
    // just the half triangle

    let i = 0;
    let j = 0;
    for (; i < trips.length; i++) {
        for (; j <= i; j++) {
            const {savings, parent} = savingsIfMerged(trips[i].route, trips[j].route);
            potenialSavings.push({savings, a: i, b: j, parent});
        }
    }

    // 2. sort the potentials by their savings value

    // 3. start at the most savings and try to apply the change
    // - check for the distance constraint, merge them
    // - what if we merge and the child route appears in the list?
    //              - if that child b' is another child b'', do nothing, if that child b' is a parent in the entry a'', then the entry's parent a'' becomes the original parent a'

    // 4. reaching the end of the list of savings means we're done.

    trips.forEach((trip, id) => {
        console.log([id]);
    });
}
