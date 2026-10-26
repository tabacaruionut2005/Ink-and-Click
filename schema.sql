CREATE TABLE utilizatori (
    id_utilizator SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin', 'bibliotecar', 'cititor')) NOT NULL
);

CREATE TABLE carti (
    id_carte SERIAL PRIMARY KEY,
    titlu VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE
);

CREATE TABLE inventar_fizic (
    id_exemplar SERIAL PRIMARY KEY,
    id_carte INT REFERENCES carti(id_carte) ON DELETE CASCADE,
    locatie_raft VARCHAR(50),
    stare VARCHAR(20) DEFAULT 'disponibil'
);

CREATE TABLE imprumuturi_fizice (
    id_imprumut SERIAL PRIMARY KEY,
    id_utilizator INT REFERENCES utilizatori(id_utilizator),
    id_exemplar INT REFERENCES inventar_fizic(id_exemplar),
    data_imprumut DATE DEFAULT CURRENT_DATE,
    data_scadenta DATE NOT NULL
);

CREATE TABLE editii_virtuale (
    id_editie SERIAL PRIMARY KEY,
    id_carte INT REFERENCES carti(id_carte) ON DELETE CASCADE,
    format_fisier VARCHAR(10) CHECK (format_fisier IN ('PDF', 'EPUB', 'MP3')),
    pret_achizitie DECIMAL(5,2) NOT NULL
);

CREATE TABLE achizitii_virtuale (
    id_tranzactie SERIAL PRIMARY KEY,
    id_utilizator INT REFERENCES utilizatori(id_utilizator),
    id_editie INT REFERENCES editii_virtuale(id_editie),
    data_achizitie TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
