import {Point, TripsMap} from './models';

const driverFlatRate = 500;
const maxDriveDistance = 12 * 60;

function distance(a: Point, b: Point): number {
    return (b.x - a.x) ^ (2 + (b.y - a.y)) ^ 2;
}

export function assignDrivers(trips: TripsMap) {
    // so we have a set of trips and we want to minimize the total cost
    // we want to schedule multiple jobs to the same driver if possible


    // what if we sort the trips by distance to center,
    // then we schedule

    trips.forEach((trip, id) => {
        console.log([id]);
    });
}
