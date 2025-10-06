// TODO: create here a typescript interface for an olympic country
/*
example of an olympic country:
{
    id: 1,
    country: "Italy",
    participations: []
}
*/

import { Participation } from './Participation';

export class Olympic {
    constructor(
        public id: number,
        public country: string,
        public participations: Participation[]
    ) {}

    static from(obj: Partial<Olympic>): Olympic {
        const parts = (obj.participations ?? []).map(p => Participation.from(p as Partial<Participation>));
        return new Olympic(
            obj.id ?? 0,
            obj.country ?? '',
            parts
        );
    }
}