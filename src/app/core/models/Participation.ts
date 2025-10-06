// TODO: create here a typescript interface for a participation
/*
example of participation:
{
    id: 1,
    year: 2012,
    city: "Londres",
    medalsCount: 28,
    athleteCount: 372
}
*/

export class Participation {
    constructor(
        public id: number,
        public year: number,
        public city: string,
        public medalsCount: number,
        public athleteCount: number
    ) {}

    static from(obj: Partial<Participation>): Participation {
        return new Participation(
            obj.id ?? 0,
            obj.year ?? 0,
            obj.city ?? '',
            obj.medalsCount ?? 0,
            obj.athleteCount ?? 0
        );
    }
}