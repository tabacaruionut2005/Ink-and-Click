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
