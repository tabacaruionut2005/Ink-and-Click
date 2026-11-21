# Ink and Click - Sistem de Management pentru o Bibliotecă Hibridă

## Descrierea temei
Proiectul „Ink and Click” este o aplicație web destinată digitalizării și automatizării proceselor dintr-o bibliotecă modernă. Sistemul gestionează un model hibrid, permițând atât evidența și împrumutul cărților fizice, cât și achiziționarea de ediții virtuale (e-books și audiobooks). Aplicația oferă trasabilitate completă a stocurilor, istoricului de împrumuturi și tranzacțiilor digitale.

## Roluri și drepturi de acces
Sistemul implementează 3 tipuri de utilizatori:
1. **Administrator:** Gestionează setările globale ale sistemului, utilizatorii și drepturile acestora.
2. **Bibliotecar:** Gestionează inventarul fizic, adaugă cărți noi în catalog, monitorizează împrumuturile și returnările.
3. **Cititor (Client):** Poate vizualiza catalogul, împrumuta cărți fizice și achiziționa ediții digitale.

## Beneficii aduse
* **Eficiență:** Eliminarea registrelor fizice și gestionarea stocului în timp real.
* **Control hibrid:** Integrarea inventarului fizic cu cel digital într-o singură bază de date unificată.
* **Accesibilitate:** Cititorii își pot urmări online termenele scadente și istoricul de lectură.

## Tehnologii utilizate (Backend / Bază de date)
* **SGBD:** PostgreSQL (prin Supabase)
* **Modelare:** Minimum 6 tabele (Utilizatori, Cărți, Inventar_Fizic, Imprumuturi_Fizice, Editii_Virtuale, Achizitii_Virtuale) relaționate corespunzător prin chei primare și străine.

* ## Descrierea Paginilor (Interfata CRUD)

Aplicatia **Ink & Click** este organizata sub forma unui panou centralizat (Dashboard) construit in Next.js, conectat direct la baza de date PostgreSQL prin Supabase API.

### 1. Bara de Navigare (Selector Tabele)
Permite comutarea rapida intre cele 6 tabele ale bazei de date:
- **Carti** (`carti`): catalogul general de titluri, autori si coduri ISBN.
- **Utilizatori** (`utilizatori`): gestionarea conturilor si a rolurilor (`cititor`, `bibliotecar`, `admin`).
- **Inventar Fizic** (`inventar_fizic`): evidenta exemplarelor fizice, locatiei pe raft si starii acestora.
- **Imprumuturi Fizice** (`imprumuturi_fizice`): urmarirea imprumuturilor active, datei de imprumut si scadentei.
- **Editii Virtuale** (`editii_virtuale`): variantele digitale disponibile (PDF, EPUB, MP3) si preturile lor.
- **Achizitii Virtuale** (`achizitii_virtuale`): istoricul tranzactiilor digitale efectuate de utilizatori.

### 2. Sectiunea Formular (Create / Update)
- Se adapteaza dinamic in functie de tabela selectata.
- Permite introducerea de inregistrari noi (**Adauga**) sau modificarea celor existente (**Editeaza** -> **Salveaza**).
- Afiseaza mesaje de eroare in timp real direct din PostgreSQL la incalcarea constrangerilor (`UNIQUE`, `FOREIGN KEY`, `CHECK`).

### 3. Sectiunea Tabel (Read / Delete)
- Afiseaza toate inregistrarile din tabela curenta, ordonate dupa cheia primara.
- Ofera butoane rapide pe fiecare rand pentru **Editeaza** si **Sterge** (cu fereastra de confirmare).
