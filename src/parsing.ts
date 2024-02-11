import {open} from 'node:fs/promises';

import {Point, Trip, TripsMap} from './models';

function parsePoint(rawPoint: string): Point {
    const sepInd = rawPoint.indexOf(',');
    const x = parseFloat(rawPoint.slice(1, sepInd));
    const y = parseFloat(rawPoint.slice(sepInd + 1, rawPoint.length - 2));

    return {
        x,
        y,
    };
}

function loadLineIntoMap(trips: TripsMap, line: string): void {
    const parts = line.split(' ');

    const id = parseInt(parts[0], 10);
    if (isNaN(id)) {
        return;
    }

    const pickup = parsePoint(parts[1]);
    const dropoff = parsePoint(parts[2]);

    trips.set(id, {pickup, dropoff});
}

export async function readTripsFromFile(filename: string): Promise<TripsMap> {
    const trips = new Map<number, Trip>();

    const file = await open(filename);

    for await (const line of file.readLines()) {
        loadLineIntoMap(trips, line);
    }

    return trips;
}
