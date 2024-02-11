import {readTripsFromFile} from './parsing';

export async function main() {
    const filename = process.argv[2];
    if (!filename) {
        throw new Error('Filename was undefined, please pass a filename');
    }

    const trips = await readTripsFromFile(filename);

    // run the algorithm
}

main();
