import {open} from 'node:fs/promises';

import {Point, Trips} from './models';

function parsePoint(rawPoint: string): Point {
    const sepInd = rawPoint.indexOf(',');
    const x = parseFloat(rawPoint.slice(1, sepInd));
    const y = parseFloat(rawPoint.slice(sepInd + 1, rawPoint.length - 2));

    return {
        x,
        y,
    };
}

function loadLineIntoArray(trips: Trips, line: string): void {
    const parts = line.split(' ');

    const id = parseInt(parts[0], 10);
    if (isNaN(id)) {
        return;
    }

    const pickup = parsePoint(parts[1]);
    const dropoff = parsePoint(parts[2]);

    trips.push({trip: {loads: [id], route: [pickup, dropoff]}});
}

export async function readTripsFromFile(filename: string): Promise<Trips> {
    const trips: Trips = [];

    const file = await open(filename);

    for await (const line of file.readLines()) {
        loadLineIntoArray(trips, line);
    }

    return trips;
}
