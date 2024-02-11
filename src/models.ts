export type Point = {
    x: number;
    y: number;
};

export type Trip = {
    pickup: Point;
    dropoff: Point;
};

export type TripsMap = Map<number, Trip>;
