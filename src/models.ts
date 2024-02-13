export type Point = {
    x: number;
    y: number;
};

export type Route = Point[];

export type Trip = {
    loads: number[];
    route: Route;
};
export type TripPointerShim = {
    trip: Trip;
};

export type Trips = TripPointerShim[];

export type SavingsMerge = {
    savings: number;
    parent: 'a' | 'b';
};

export type SavingsEntry = SavingsMerge & {
    a: TripPointerShim;
    b: TripPointerShim;
};
