export interface Heroe {
    id: number;
    superhero: string;
    publisher: Publisher;
    alter_ego: string;
    first_appearance: string;
    characters: string;
    habilities: string;
    alt_img: string;
    assets_img: boolean;
    usuario: number;
};

export enum Publisher {
    DCComics = "DC Comics",
    MarvelComics = "Marvel Comics",
};

export interface Publishers {
    id: string,
    desc: string
};