# Hechtel U11 Planner

Webapp om de wekelijkse wedstrijdschema's van K. Hechtel FC U11 A en B te maken: selectie, verzameluur, was en broodjes, trainers, export als JPEG en PDF. Werkt op gsm en computer.

## Hoe het werkt

- **De website** staat op GitHub Pages. Het zijn gewone bestanden, er is geen server en geen build-stap.
- **De gegevens** (kalender, spelers, tegenstanders, historiek, instellingen) staan in Firebase Firestore. Elke trainer ziet dezelfde planning.
- **Inloggen** gebeurt met een link in je mailbox, zonder wachtwoord. Alleen e-mailadressen die de beheerder toevoegde, krijgen toegang.
- **De RBFA-kalender** wordt opgehaald door de browser van wie de planner opent, hoogstens om de 20 minuten. Nieuwe en verplaatste matchen, nieuwe tegenstanders en nieuwe spelers komen er automatisch bij. Wat een trainer zelf aanpaste, blijft staan.
- **Rijtijden** naar nieuwe uitterreinen worden berekend via OpenStreetMap (Nominatim en OSRM) en afgerond naar boven op 5 minuten. Vertrek op de parking = aftrap − 60 min − rijtijd.

Er staan geen gegevens van spelers in deze repository. Die zitten alleen in Firestore, achter de login.

## Eenmalige installatie

1. **Firebase-project.** Maak op [console.firebase.google.com](https://console.firebase.google.com) een project (gratis Spark-plan). Kies bij Projectinstellingen > Algemeen > Je apps een **web-app** en kopieer de `firebaseConfig` naar `config.js`.
2. **Inloggen met e-maillink.** Authentication > Sign-in method > E-mailadres/wachtwoord: zet aan, en zet ook **E-maillink (inloggen zonder wachtwoord)** aan.
3. **Toegelaten domein.** Authentication > Instellingen > Geautoriseerde domeinen: voeg `<gebruikersnaam>.github.io` toe.
4. **Database.** Firestore Database > Database maken, locatie in Europa (bv. `eur3` of `europe-west1`), productiemodus.
5. **Beveiligingsregels.** Open `firestore.rules`, vervang `OWNER_EMAIL` door het e-mailadres van de eigenaar (kleine letters) en plak de regels bij Firestore Database > Regels. Klik op Publiceren. Zet het echte e-mailadres niet in deze repository.
6. **GitHub Pages.** Repository > Settings > Pages: Deploy from a branch, `main`, map `/ (root)`.
7. **Eerste keer openen.** Ga naar `https://<gebruikersnaam>.github.io/<repository>/`, log in met het e-mailadres van de eigenaar en kies **Bestand terugzetten** (een back-up van de planner) of **Leeg beginnen**. Daarna haalt de planner de RBFA-kalender op.

## Trainers toegang geven

Meer > Toegang: vul het e-mailadres van de trainer in en stuur hem de link naar de planner. Hij logt in met dat adres. Een beheerder kan ook anderen toegang geven of afnemen.

Het gratis Firebase-plan verstuurt **maximaal 5 inloglinks per dag**. Eenmaal ingelogd blijft een toestel ingelogd, dus dat is normaal ruim genoeg.

Op een iPhone opent de link uit de mail soms in een andere browser dan de app op het beginscherm. Dan kan je bij het inlogscherm de link uit de mail plakken.

## Gebruik

Voor de trainers is er een korte handleiding met screenshots: `handleiding.html`, ook te openen via het vraagteken bovenaan in de planner en via de link op het inlogscherm. De namen op die screenshots zijn voorbeelden.

- **Speeldag:** de matchen van één week. Tik op een speler om hem uit de selectie te halen, op het shirtje voor was + broodjes, op het verzameluur om het aan te passen. Exporteer als JPEG of PDF, of deel meteen via WhatsApp.
- **Kalender:** alle weken onder elkaar. Vink meerdere speeldagen aan om ze samen te exporteren.
- **Spelers:** de ploeglijsten van A en B zijn het sjabloon voor elke nieuwe match. Verhuis spelers tussen A en B, voeg externe spelers toe, zet iemand inactief.
- **Meer:** tegenstanders en rijtijden, verzamelregels, trainers, speeldagnummering, RBFA-ploegen, toegang en back-up.

Was + broodjes: de planner stelt per ploeg per week iemand voor, op basis van wie het dit seizoen het minst en het langst geleden deed. Bij het delen of downloaden van het schema wordt het voorstel vastgelegd.

## Nieuw seizoen

RBFA geeft elk seizoen nieuwe ploegnummers. De planner zoekt de ploegen op naam (standaard `U11 A` en `U11 B`). Heten de ploegen anders, kies ze dan bij Meer > RBFA. Een nieuwe reeks krijgt automatisch een nieuwe speeldag 1. Spelers die niet meer bij de ploegen staan, krijgen een melding bij Spelers; de historiek blijft bewaard.

## Back-up

Meer > Back-up > Back-up downloaden geeft een JSON-bestand met alle gegevens. Met Bestand terugzetten zet je het terug (gegevens met dezelfde naam worden overschreven).

## Problemen

| Melding | Oplossing |
| --- | --- |
| Nog geen toegang | De beheerder voegt het e-mailadres toe bij Meer > Toegang. Voor de eigenaar: controleer het adres in de Firestore-regels. |
| Deze website staat nog niet bij de toegelaten domeinen | Stap 3 van de installatie. |
| Vandaag zijn er al 5 inloglinks verstuurd | Limiet van het gratis plan, morgen opnieuw proberen. |
| RBFA niet bereikbaar | Later opnieuw proberen. Blijft het, dan is de RBFA-website mogelijk gewijzigd. |
| Ploeg U11 A niet gevonden | Kies de juiste ploeg bij Meer > RBFA. |
| Rijtijd ontbreekt | Tik op de melding en vul de rijtijd in bij de tegenstander. |

## Technisch

- `index.html`, `app.js`, `app.css`: de app, zonder framework.
- `config.js`: Firebase-instellingen.
- `firestore.rules`: beveiligingsregels (sjabloon).
- `handleiding.html` en `hl-*.png`: handleiding voor de trainers, met screenshots uit een testomgeving met fictieve namen.
- `firebase-*-compat.js` en `jspdf.umd.min.js`: Firebase JS SDK 10.12.2 (compat) en jsPDF 2.5.1, zelf gehost.
- Collecties in Firestore: `config/main`, `players`, `opponents`, `matches`, `weeks` (titel en exportdatum per week, sleutel = maandag), `members` (sleutel = e-mailadres, `role`: `trainer` of `admin`).
- RBFA: GraphQL op `datalake-prod2018.rbfa.be` (clubTeams, teamCalendar, matchDetail, teamMembers). Club 1416, stamnummer 02662.
