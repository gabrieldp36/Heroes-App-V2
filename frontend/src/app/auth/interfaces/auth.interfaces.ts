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
    admin: boolean;
    estado: boolean;
};

export interface TokenResponse {
    ok: boolean
    msg?: string;
};