# Ink & Click - Sistem de Management pentru Biblioteca Hibrida

**Ink & Click** este o aplicatie web pentru gestionarea unei biblioteci hibride, care combina administrarea volumelor fizice (inventar pe rafturi si imprumuturi) cu editii digitale (achizitii in format PDF, EPUB, MP3).

---

## Etapa 1 - Proiectarea si Implementarea Bazei de Date

Baza de date este implementata in **PostgreSQL** (gazduita pe **Supabase**) si contine 6 tabele relationale cu chei primare, chei straine si constrangeri de integritate (`UNIQUE`, `CHECK`, `NOT NULL`).

### Structura bazei de date
- **`carti`**: catalogul general de titluri, autori si coduri ISBN unice.
- **`utilizatori`**: evidenta utilizatorilor si a rolurilor acestora (`cititor`, `bibliotecar`, `admin`).
- **`inventar_fizic`**: exemplarele tiparite asociate cartilor, locatia pe raft si starea lor (`disponibil`, `imprumutat`, `deteriorat`, `pierdut`).
- **`imprumuturi_fizice`**: evidenta imprumuturilor de exemplare fizice, data imprumutului si data scadenta.
- **`editii_virtuale`**: variantele digitale ale cartilor (`PDF`, `EPUB`, `MP3`) si preturile de achizitie.
- **`achizitii_virtuale`**: istoricul tranzactiilor prin care utilizatorii achizitioneaza editii digitale.

### Fisiere aferente Etapei 1
- `schema.sql` - scriptul SQL pentru crearea tabelelor si a constrangerilor.
- `fixtures.sql` - datele initiale de test inserate in baza de date.
- `DECISIONS.md` - deciziile de arhitectura si modelare a bazei de date.
- `AI_LOG.md` - jurnalul de utilizare a instrumentelor AI pe parcursul proiectului.

---

## Etapa 2 - Interfata Web CRUD (Next.js + Supabase)

Interfata web este construita in **Next.js** cu o tematica de biblioteca clasica, conectata direct la baza de date PostgreSQL prin Supabase API.

### Structura si functionalitatile paginii

1. **Bara de Navigare (Selector Tabele)**
   Permite comutarea rapida intre toate cele 6 tabele ale bazei de date:
   - **Carti (`carti`)**
   - **Utilizatori (`utilizatori`)**
   - **Inventar Fizic (`inventar_fizic`)**
   - **Imprumuturi Fizice (`imprumuturi_fizice`)**
   - **Editii Virtuale (`editii_virtuale`)**
   - **Achizitii Virtuale (`achizitii_virtuale`)**

2. **Formular Dinamic (Create / Update)**
   - Se adapteaza automat in functie de tabela selectata.
   - Permite adaugarea de inregistrari noi (**Adauga**) si modificarea celor existente (**Editeaza** -> **Salveaza**).
   - Afiseaza in timp real erorile returnate de PostgreSQL la incalcarea constrangerilor (`UNIQUE`, `FOREIGN KEY`, `CHECK`).

3. **Zona de Vizualizare si Cautare (Read / Delete)**
   - Include o bara de cautare rapida pentru filtrarea inregistrarilor din tabela activa.
   - Ofera comutare intre modul **Fise Biblioteca** (carduri) si modul **Tabel Clasic**.
   - Fiecare inregistrare dispune de butoane dedicate pentru **Editeaza** si **Sterge** (cu fereastra de confirmare).

---

## Rulare Locala

1. Instalati dependentele:
   ```bash
   npm install
