export interface AuthResponse {
    ok: boolean
    jwt?: string;
    msg?: string;
};

export interface Usuario {
    id: number;
    nombre: string;
    correo: string;
    url_foto: string;
    admin: number;
};

export interface TokenResponse {
    ok: boolean
    msg?: string;
};