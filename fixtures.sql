INSERT INTO utilizatori (nume, email, rol) VALUES 
('Ion Popescu', 'ion.popescu@email.com', 'admin'),
('Maria Ionescu', 'maria.i@email.com', 'bibliotecar'),
('Andrei Vasile', 'andrei.v@email.com', 'cititor');

INSERT INTO carti (titlu, autor, isbn) VALUES 
('Dune', 'Frank Herbert', '978-0441172719'),
('1984', 'George Orwell', '978-0451524935');

INSERT INTO inventar_fizic (id_carte, locatie_raft, stare) VALUES 
(1, 'Raft A1', 'disponibil'),
(1, 'Raft A1', 'imprumutat'),
(2, 'Raft B3', 'disponibil');

INSERT INTO editii_virtuale (id_carte, format_fisier, pret_achizitie) VALUES 
(1, 'EPUB', 45.50),
(2, 'PDF', 30.00);

INSERT INTO imprumuturi_fizice (id_utilizator, id_exemplar, data_scadenta) VALUES 
(3, 2, CURRENT_DATE + INTERVAL '14 days');

INSERT INTO achizitii_virtuale (id_utilizator, id_editie) VALUES 
(3, 1);
