CREATE TABLE mapas (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE resultados (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE agentes (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(30) NOT NULL UNIQUE,
    rol     VARCHAR(20) NOT NULL,

    CONSTRAINT chk_rol_agente CHECK (rol IN ('Duelista','Iniciador','Controlador','Centinela'))
);

CREATE TABLE partidas (
    id            SERIAL PRIMARY KEY,
    agente_id     INTEGER      NOT NULL REFERENCES agentes(id),
    mapa_id       INTEGER      NOT NULL REFERENCES mapas(id),
    resultado_id  INTEGER      NOT NULL REFERENCES resultados(id),
    kills         INTEGER      NOT NULL DEFAULT 0,
    deaths        INTEGER      NOT NULL DEFAULT 0,
    assists       INTEGER      NOT NULL DEFAULT 0,
    jugado_en     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_stats_no_negativos CHECK (kills >= 0 AND deaths >= 0 AND assists >= 0)
);

CREATE INDEX idx_partidas_agente_id    ON partidas (agente_id);
CREATE INDEX idx_partidas_mapa_id      ON partidas (mapa_id);
CREATE INDEX idx_partidas_resultado_id ON partidas (resultado_id);