import {Point, Route, SavingsEntry, SavingsMerge, Trip, Trips} from './models';

const driverFlatRate = 500;
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
    const potenialSavings: SavingsEntry[] = [];

    // 1. calculate the savings for the combinations of trips
    // just the half triangle
    for (let i = 0; i < trips.length; i++) {
        for (let j = 0; j < i; j++) {
            const {savings, parent} = savingsIfMerged(trips[i].trip.route, trips[j].trip.route);
            potenialSavings.push({savings, a: trips[i], b: trips[j], parent});
        }
    }

    // 2. sort the potentials by their savings value (and filter negative combinations)
    potenialSavings.filter((sav) => sav.savings > 0).sort((a, b) => (a.savings > b.savings ? -1 : 1));
    // console.log(`savings ${potenialSavings.length}`);

    // 3. start at the most savings and try to apply the change
    for (let i = 0; i < potenialSavings.length; i++) {
        if (isMergedRouteValid(potenialSavings[i])) {
            if (isSameTrip(potenialSavings[i].a.trip, potenialSavings[i].b.trip)) {
                continue;
            }
            // console.log(`merging ${potenialSavings[i].a.trip.ids} ${potenialSavings[i].b.trip.ids}`);
            // console.log(i);
            mergeTrips(potenialSavings[i]);
        }
    }

    // 4. reaching the end of the list of savings means we're done.
    const doneIds: number[] = [];

    trips.forEach((trip) => {
        const tripId = trip.trip.ids[0];
        // might have some duplicates, just don't output them
        if (doneIds.includes(tripId)) {
            return;
        }
        doneIds.push(tripId);
        console.log(trip.trip.ids);
    });
}

function isSameTrip(a: Trip, b: Trip) {
    return a === b;
}

function mergeTrips(entry: SavingsEntry) {
    const parent = entry.parent === 'a' ? entry.a : entry.b;

    parent.trip.route = mergeRoute(entry);

    if (entry.parent === 'a') {
        entry.a.trip.ids.concat(entry.b.trip.ids);
        // change the reference to the trip in the pointer shim.  Entries all point to the same trip shim, so change it once, it changes for the rest
        entry.b.trip = entry.a.trip;
    } else {
        entry.b.trip.ids.concat(entry.a.trip.ids);
        entry.a.trip = entry.b.trip;
    }
}

function mergeRoute(entry: SavingsEntry): Route {
    const [parent, child] = entry.parent === 'a' ? [entry.a.trip, entry.b.trip] : [entry.b.trip, entry.a.trip];

    // making copies so we don't mutate state until we're sure
    const newRoute = [...parent.route, ...child.route];
    return newRoute;
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

export function distance(a: Point, b: Point): number {
    const dist = Math.pow(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2), 0.5);
    return dist;
}

function savingsIfMerged(a: Route, b: Route): SavingsMerge {
    // assume that each route is already in order
    const endA = a[a.length - 1];
    const endB = b[b.length - 1];
    const aEndbStart = distance(endA, b[0]);
    const bEndaStart = distance(endB, a[0]);

    if (aEndbStart < bEndaStart) {
        const dist = distance(endA, origin) + distance(origin, b[0]) - aEndbStart; // savings formula from Clark and Wright [1]
        return {parent: 'a', savings: dist};
    } else {
        return {parent: 'b', savings: distance(endB, origin) + distance(origin, a[0]) - bEndaStart}; // same as above
    }
}
