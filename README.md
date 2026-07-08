# ZangConnect — Platforma de integrare Bolt Food + Glovo

Platforma care centralizeaza comenzile venite de la **Bolt Food** si **Glovo**
intr-un singur dashboard (**ZangConnect**), cu status unificat pentru fiecare
comanda, autentificare, un app shell (sidebar + topbar), o pagina de prezentare
generala cu statistici in timp real si venituri, o vedere de management a
comenzilor, o pagina de curieri, flote cu statistici, reguli de rutare
configurabile, o pagina de setari si tema intunecata.

## Stack tehnic

- **Backend**: Node.js 20 LTS, TypeScript, NestJS, PostgreSQL (TypeORM), Swagger,
  `@nestjs/schedule` (polling), `class-validator` (validare DTO)
- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, React Router (`react-router-dom`)

## Functionalitati

- **Autentificare mock** — pagina de login, sesiune pastrata in `localStorage`
  (persista la refresh), rute protejate, deconectare
- **App shell** — sidebar colapsabil cu navigatie grupata (iconite + etichete) si
  topbar cu titlu derivat din ruta, cautare, notificari si meniu de utilizator
- **Prezentare generala (Overview)** — aterizarea dupa login: KPI-uri calculate in
  timp real din comenzi (active, livrate azi, in livrare, timp mediu livrare), feed
  de activitate recenta si un panou de **venituri din intermediere** (calculat doar
  din costul de livrare, cu detaliu extensibil pe fiecare comanda)
- **Management comenzi** — tabel cu coloane (id, client, platforma, valoare, status,
  ora), cautare dupa client / numar comanda, filtre pe platforma si status, iar la
  click pe un rand se deschide un panou lateral (drawer) cu detaliile comenzii
- **Masina de stari a comenzii** — tranzitii controlate (noua -> acceptata ->
  in preparare -> gata de ridicare -> ridicata -> livrata; anulare pe parcurs),
  indicator de pasi (stepper), istoric status cu timestamp si cost de livrare
- **Notificari mock interactive** — badge cu numarul de necitite, text ingrosat cat
  sunt necitite (stare pastrata per utilizator), iar la click te duc la comanda
  relevanta (cu numarul ei) sau la pagina potrivita
- **Control distributie comenzi** — doua slidere legate (Glovo / Bolt Food) care
  regleaza proportia comenzilor generate; suma e mereu 100% (in pagina Flote, cu
  shortcut din pagina Comenzi)
- **Curieri** — tabel cu curieri mock, cautare dupa nume, filtre clicabile pe
  status (online / ocupat / offline) si pe tip de vehicul, comutare rapida a
  statusului
- **Flote** — statistici agregate (livratori activi, timp estimativ de livrare,
  cost mediu) si pe fiecare flota, plus fiabilitate in timp real
- **Reguli de rutare configurabile** — 4 criterii reglabile (SLA, pret livrare,
  distanta, fiabilitate flota), fiecare cu activare/dezactivare, slider de valoare
  si pondere in decizie; setarile se pastreaza local (`localStorage`)
- **Fundaluri per pagina** — ilustratii SVG reprezentative, estompate in spate, cu
  carduri/tabele semi-transparente ca fundalul sa se vada fara sa afecteze textul
- **Setari** — pagina cu doua tab-uri tip pill (fara reincarcare): Profil (nume /
  email editabile, avatar cu initiale, buton de salvare care se reflecta si in
  topbar) si Preferinte (comutatoare pentru notificari, tema intunecata, rezumat
  pe email); preferintele se pastreaza in `localStorage`
- **Tema intunecata** — comutabila din Setari, aplicata pe toata aplicatia si
  pastrata la refresh; la delogare revine automat la tema deschisa, iar la
  re-logare se restaureaza preferinta salvata
- **Simulator de comenzi** — generator de comenzi false pentru testare, fara API-uri reale

## Autentificare

Autentificarea este **mock** (nu exista backend real de auth). Credentiale demo:

```
email:  admin@hio.ro
parola: password123
```

La login se salveaza un obiect user + un token fals in `localStorage`; rutele
autentificate sunt protejate si redirectioneaza catre `/login` fara sesiune.

## Cum functioneaza integrarea

| Platforma | Mecanism | De ce |
|---|---|---|
| **Bolt Food** | *Polling* — un job programat (`@nestjs/schedule`) interogheaza periodic API-ul Bolt Food pentru comenzi noi | Multe integrari Bolt Food nu garanteaza webhook-uri publice; pollingul e mecanismul sigur, configurabil din `BOLT_FOOD_POLL_INTERVAL_MS` |
| **Glovo** | *Webhook* — Glovo trimite comenzile catre `POST /integrations/glovo/webhook` | Glovo suporta notificari push; se verifica o semnatura HMAC pe payload |

Ambele surse sunt transformate (prin `bolt-food.mapper.ts` / `glovo.mapper.ts`)
intr-un format intern comun (`UnifiedOrder`), astfel incat restul aplicatiei
(baza de date, API, frontend) sa nu depinda de particularitatile fiecarei platforme.

**Important**: nu ai inca acces la credentialele Bolt Food / Glovo, asa ca
toate apelurile catre ele sunt izolate in `bolt-food.client.ts` si `glovo.client.ts`,
cu logica de tip placeholder (loghezi un warning si continui, in loc sa crape).
Cand primesti acces de partener, trebuie doar sa completezi `.env` si sa verifici
formatul exact al payload-urilor in DTO-uri/mappers — restul codului ramane neschimbat.

## Structura proiectului

```
integration-platform/
├── backend/                     # NestJS + TypeORM + PostgreSQL
│   └── src/
│       ├── common/               # enums + interfata UnifiedOrder
│       ├── orders/               # entitati, service, controller (CRUD comenzi)
│       ├── simulator/            # generator comenzi false + distributie pe provider
│       └── integrations/
│           ├── bolt-food/        # client, mapper, service (polling)
│           └── glovo/            # client, mapper, service, controller (webhook)
└── frontend/                    # React + Vite + Tailwind + React Router
    └── src/
        ├── api/                  # apeluri catre backend (orders, simulator)
        ├── context/              # AuthContext (autentificare mock)
        ├── hooks/                # useOrders, useSimulator, useClickOutside
        ├── lib/                  # orderTransitions (masina de stari) + theme (tema light/dark)
        ├── pages/                # Login, Overview, Orders, OrderDetails, Drivers, Fleets, RoutingRules, Settings
        └── components/
            ├── layout/           # Layout (<Outlet>), Sidebar, Topbar, navConfig, icons
            ├── ProtectedRoute    # gardian pentru rutele autentificate
            ├── ProviderMixControl# slidere distributie comenzi
            ├── OrderTable        # tabelul de comenzi (randuri clicabile)
            ├── OrderDetailPanel  # panou lateral (drawer) cu detaliile unei comenzi
            ├── OrderStatusStepper# indicator de pasi pentru statusul comenzii
            └── FilterBar, StatusBadge, PlatformBadge
```

Shell-ul (sidebar + topbar) e aplicat tuturor paginilor autentificate prin
**rute imbricate**: paginile sunt copii ai componentei `Layout`, care le randeaza
in `<Outlet>`.

## Instalare & rulare

### 1. Baza de date

Ai nevoie de un server PostgreSQL local sau in cloud. Creeaza baza:

```bash
createdb delivery_integration
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# editeaza .env cu datele tale de PostgreSQL (si, cand le ai, credentialele Bolt Food / Glovo)
npm install
npm run dev        # echivalent cu start:dev (pornire cu auto-reload)
```

Backend-ul porneste pe `http://localhost:3000`, iar documentatia Swagger e disponibila
pe `http://localhost:3000/docs`. `synchronize: true` (setat implicit in `.env.example`)
creeaza automat tabelele in dev — **dezactiveaza-l in productie** si foloseste migratii.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend-ul porneste pe `http://localhost:5173`. Autentifica-te cu credentialele
demo de mai sus.

## Endpoint-uri principale

| Metoda | Ruta | Descriere |
|---|---|---|
| GET | `/orders?platform=&status=` | Listeaza comenzi, cu filtre optionale |
| GET | `/orders/:id` | Detaliu comanda |
| PATCH | `/orders/:id/status` | Actualizeaza statusul unei comenzi |
| POST | `/integrations/glovo/webhook` | Endpoint pentru notificari Glovo (configurat in panoul lor de partener) |
| POST | `/simulator/start` | Porneste generarea automata de comenzi false (pentru testare) |
| POST | `/simulator/stop` | Opreste generarea automata de comenzi |
| GET | `/simulator/status` | Starea simulatorului (pornit/oprit, cate comenzi a generat, distributia curenta) |
| POST | `/simulator/mix` | Seteaza distributia comenzilor generate (procent Glovo; Bolt Food = restul) |

## Simulator de comenzi (pentru testare, fara credentiale reale)

Din dashboard, butoanele **"Start comenzi" / "Stop comenzi"** pornesc/opresc un
generator care creeaza comenzi false, dar plauzibile (nume, adrese, produse de
meniu cu preturi reale, timp estimativ de livrare, cost de livrare), direct in baza de date -
util pentru a vedea fluxul complet inainte sa ai acces la Bolt Food / Glovo.
Cand pornesti simulatorul, o comanda noua apare la fiecare 8-18 secunde.

Proportia dintre platforme e controlata din pagina **Comenzi**, prin cele doua
slidere **Glovo / Bolt Food** (suma mereu 100%). Backend-ul alege platforma
fiecarei comenzi ponderat, dupa distributia setata. Codul e in
`backend/src/simulator/` si poate fi sters usor cand nu mai e nevoie de el.

## Ce trebuie completat cand ai acces la API-urile reale

1. **Bolt Food** (`backend/src/integrations/bolt-food/`):
   - `bolt-food.client.ts`: endpoint-urile reale + modul de autentificare
   - `dto/bolt-order-payload.dto.ts`: forma reala a payload-ului
   - `bolt-food.mapper.ts`: maparea corecta a statusurilor Bolt Food -> `OrderStatus`

2. **Glovo** (`backend/src/integrations/glovo/`):
   - `glovo.client.ts`: endpoint-urile reale pentru trimiterea statusurilor
   - `dto/glovo-webhook-payload.dto.ts`: forma reala a payload-ului webhook
   - `glovo.service.ts`: numele exact al header-ului de semnatura si algoritmul de verificare
   - `glovo.mapper.ts`: maparea corecta a statusurilor Glovo -> `OrderStatus`

3. **Autentificare**: inlocuieste logica mock din `frontend/src/context/AuthContext.tsx`
   cu un flux real (verificare pe backend, token emis de server).

## Urmatorii pasi posibili

- Continut real pentru paginile Flote si Reguli de rutare (acum au date mock)
- Sincronizare meniu/produse cu ambele platforme
- Notificari in timp real catre frontend (WebSocket) in loc de polling
- Rapoarte/analytics (volum comenzi, timp mediu de preparare, etc.)
- Roluri si permisiuni pentru dashboard
