import {Point, Route, SavingsEntry, SavingsMerge, Trips} from './models';

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

/**
 *
 * Implementation of Clarke and Wright's savings algorithm [1]
 */
export function assignDrivers(trips: Trips) {
    const potenialSavings: SavingsEntry[] = [];

    // 1. calculate the savings for the combinations of trips
    // just the half triangle
    for (let i = 0; i < trips.length; i++) {
        for (let j = 0; j <= i; j++) {
            const {savings, parent} = savingsIfMerged(trips[i].trip.route, trips[j].trip.route);
            potenialSavings.push({savings, a: trips[i], b: trips[j], parent});
        }
    }

    // 2. sort the potentials by their savings value
    potenialSavings.sort((a, b) => (a.savings > b.savings ? -1 : 1));

    // 3. start at the most savings and try to apply the change
    for (let i = 0; i < potenialSavings.length; i++) {
        if (isMergedRouteValid(potenialSavings[i])) {
            mergeTrips(potenialSavings[i]);
        }
    }

    // 4. reaching the end of the list of savings means we're done.

    trips.forEach((trip, id) => {
        console.log([id]);
    });
}

function mergeTrips(entry: SavingsEntry) {
    const parent = entry.parent === 'a' ? entry.a : entry.b;

    parent.trip.route = mergeRoute(entry);

    if (entry.parent === 'a') {
        // change the reference to the trip in the pointer shim.  Entries all point to the same trip shim, so change it once, it changes for the rest
        entry.b.trip = entry.a.trip;
    } else {
        entry.a.trip = entry.b.trip;
    }
}

function mergeRoute(entry: SavingsEntry): Route {
    // making copies so we don't mutate state until we're sure
    const parent = entry.parent === 'a' ? [...entry.a.trip.route] : [...entry.b.trip.route];

    parent.push(...entry.a.trip.route);
    return parent;
}

function measureRoute(route: Route): number {
    let sum = 0;
    for (let i = 0; i < route.length - 1; i++) {
        sum += distance(route[i], route[i + 1]);
    }
    return sum;
}

function isMergedRouteValid(entry: SavingsEntry): boolean {
    const resultRoute = [origin, ...mergeRoute(entry), origin];
    const totalDrive = measureRoute(resultRoute);
    const totalDriveExceeded = totalDrive > maxDriveDistance;
    return totalDriveExceeded;
}
