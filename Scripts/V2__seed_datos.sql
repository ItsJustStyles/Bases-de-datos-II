-- Mapas
INSERT INTO mapas (nombre) VALUES
    ('Ascent'), ('Bind'), ('Breeze'), ('Fracture'), ('Haven'),
    ('Icebox'), ('Lotus'), ('Pearl'), ('Split'), ('Sunset'), ('Abyss');

-- Resultados
INSERT INTO resultados (nombre) VALUES
    ('victoria'), ('derrota'), ('empate');

-- Agentes
INSERT INTO agentes (nombre, rol) VALUES
    ('Jett','Duelista'), ('Reyna','Duelista'), ('Phoenix','Duelista'),
    ('Raze','Duelista'), ('Yoru','Duelista'), ('Neon','Duelista'), ('Iso','Duelista'),
    ('Sova','Iniciador'), ('Breach','Iniciador'), ('Skye','Iniciador'),
    ('KAY/O','Iniciador'), ('Fade','Iniciador'), ('Gekko','Iniciador'), ('Tejo','Iniciador'),
    ('Brimstone','Controlador'), ('Viper','Controlador'), ('Omen','Controlador'),
    ('Astra','Controlador'), ('Harbor','Controlador'), ('Clove','Controlador'),
    ('Sage','Centinela'), ('Cypher','Centinela'), ('Killjoy','Centinela'),
    ('Chamber','Centinela'), ('Deadlock','Centinela'), ('Vyse','Centinela');

-- Partidas de ejemplo
INSERT INTO partidas (agente_id, mapa_id, resultado_id, kills, deaths, assists, jugado_en)
VALUES
    (
        (SELECT id FROM agentes    WHERE nombre = 'Jett'),
        (SELECT id FROM mapas      WHERE nombre = 'Ascent'),
        (SELECT id FROM resultados WHERE nombre = 'victoria'),
        18, 9, 5, now() - interval '6 days'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Sova'),
        (SELECT id FROM mapas      WHERE nombre = 'Bind'),
        (SELECT id FROM resultados WHERE nombre = 'derrota'),
        9, 15, 11, now() - interval '5 days'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Killjoy'),
        (SELECT id FROM mapas      WHERE nombre = 'Ascent'),
        (SELECT id FROM resultados WHERE nombre = 'victoria'),
        12, 10, 8, now() - interval '5 days'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Reyna'),
        (SELECT id FROM mapas      WHERE nombre = 'Icebox'),
        (SELECT id FROM resultados WHERE nombre = 'victoria'),
        24, 11, 2, now() - interval '4 days'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Omen'),
        (SELECT id FROM mapas      WHERE nombre = 'Pearl'),
        (SELECT id FROM resultados WHERE nombre = 'empate'),
        7, 8, 14, now() - interval '3 days'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Raze'),
        (SELECT id FROM mapas      WHERE nombre = 'Split'),
        (SELECT id FROM resultados WHERE nombre = 'derrota'),
        13, 16, 4, now() - interval '3 days'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Skye'),
        (SELECT id FROM mapas      WHERE nombre = 'Haven'),
        (SELECT id FROM resultados WHERE nombre = 'victoria'),
        10, 9, 17, now() - interval '2 days'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Chamber'),
        (SELECT id FROM mapas      WHERE nombre = 'Lotus'),
        (SELECT id FROM resultados WHERE nombre = 'victoria'),
        21, 7, 3, now() - interval '1 day'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Fade'),
        (SELECT id FROM mapas      WHERE nombre = 'Sunset'),
        (SELECT id FROM resultados WHERE nombre = 'derrota'),
        6, 14, 9, now() - interval '1 day'
    ),
    (
        (SELECT id FROM agentes    WHERE nombre = 'Viper'),
        (SELECT id FROM mapas      WHERE nombre = 'Breeze'),
        (SELECT id FROM resultados WHERE nombre = 'victoria'),
        8, 6, 19, now()
    );