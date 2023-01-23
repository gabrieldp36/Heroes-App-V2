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
    id_usuario: number;
};

export enum Publisher {
    DCComics = "DC Comics",
    MarvelComics = "Marvel Comics",
};

export interface Publishers {
    id: string,
    desc: string
};

export interface Comentario {
    id_comentario: number,
    id_usuario: number,
    url_foto: string,
    nombre: string,
    descripcion: string,
};

export interface ComentarioPost {
    id_usuario: number,
    id_heroe: number,
    comentario: string,
};