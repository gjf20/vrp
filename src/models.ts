export type Point = {
    x: number;
    y: number;
};

export type Route = Point[];

export type Trip = {
    id: number;
    route: Route;
};

export type Trips = Trip[];
