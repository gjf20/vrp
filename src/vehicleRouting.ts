import {Point, Route, SavingsEntry, SavingsMerge, Trips} from './models';

const maxDriveDistance = 12 * 60; //720

const origin: Point = {
    x: 0,
    y: 0,
};

/**
 *
 * Implementation of Clarke and Wright's savings algorithm [1]
 */
export function assignDrivers(trips: Trips) {
    const sizeOfSavings = Math.floor(Math.pow(trips.length, 2) / 2) - trips.length - 1; // triangle of savings
    const potenialSavings: SavingsEntry[] = new Array<SavingsEntry>(sizeOfSavings);
    let savingsIndex = 0;

    // 1. calculate the savings for the combinations of trips
    // just the half triangle
    for (let i = 0; i < trips.length; i++) {
        for (let j = 0; j < i; j++) {
            const {savings, parent} = savingsIfMerged(trips[i].trip.route, trips[j].trip.route);

            potenialSavings[savingsIndex++] = {savings, a: trips[i], b: trips[j], parent};
        }
    }

    // 2. sort the potentials by their savings value (and filter negative combinations)
    potenialSavings.filter((sav) => sav.savings > 0).sort((a, b) => (a.savings > b.savings ? -1 : 1));

    // 3. start at the most savings and try to apply the change
    for (let i = 0; i < potenialSavings.length; i++) {
        if (isMergedRouteValid(potenialSavings[i])) {
            mergeTrips(potenialSavings[i]);
        }
    }

    // 4. reaching the end of the list of savings means we're done.
    trips.forEach((trip) => {
        if (trip.trip.loads.length === 0) {
            return;
        }
        console.log(`[${trip.trip.loads.join(',')}]`);
    });
}

function mergeTrips(entry: SavingsEntry) {
    if (entry.parent === 'a') {
        entry.a.trip.route = mergeRoute(entry);
        entry.a.trip.loads = entry.a.trip.loads.concat(entry.b.trip.loads);
        // change the reference to the trip in the pointer shim.  Entries all point to the same trip shim, so change it once, it changes for the rest
        entry.b.trip.loads = [];
    } else {
        entry.b.trip.route = mergeRoute(entry);
        entry.b.trip.loads = entry.b.trip.loads.concat(entry.a.trip.loads);
        entry.a.trip.loads = [];
    }
}

function mergeRoute(entry: SavingsEntry): Route {
    // making copies so we don't mutate state until we're sure we want to

    if (entry.parent === 'a') {
        return [...entry.a.trip.route, ...entry.b.trip.route];
    } else {
        return [...entry.b.trip.route, ...entry.a.trip.route];
    }
}

/**
 * @param route the route not including origin points - this gets mutated for speed
 * @returns the total distance of the route (including to and from the origin)
 */
function measureRoute(route: Route): number {
    let sum = 0;
    for (let i = 0; i < route.length - 1; i++) {
        sum += distance(route[i], route[i + 1]);
    }

    // risky, but pop is so much faster than index and we're assuming the route is a copy [2]
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sum += distance(origin, route[0]) + distance(route.pop()!, origin);
    return sum;
}

function isMergedRouteValid(entry: SavingsEntry): boolean {
    if (entry.a.trip.loads.length === 0 || entry.b.trip.loads.length === 0) {
        return false;
    }

    const totalDrive = measureRoute(mergeRoute(entry));
    return totalDrive <= maxDriveDistance;
}

export function distance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
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
        return {parent: 'b', savings: distance(endB, origin) + distance(origin, a[0]) - bEndaStart}; // same as above
    }
}
