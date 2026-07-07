# Platforma de integrare Bolt Food + Glovo

Platforma care centralizeaza comenzile venite de la **Bolt Food** si **Glovo**
intr-un singur dashboard, cu status unificat pentru fiecare comanda.

## Stack tehnic

- **Backend**: Node.js 20 LTS, TypeScript, NestJS, PostgreSQL (TypeORM)
- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **Faza 1**: doar primire comenzi + actualizare status (fara sincronizare meniu / analytics — se pot adauga ulterior)

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
│       ├── orders/                # entitati, service, controller (CRUD comenzi)
│       └── integrations/
│           ├── bolt-food/         # client, mapper, service (polling)
│           └── glovo/             # client, mapper, service, controller (webhook)
└── frontend/                     # React + Vite + Tailwind
    └── src/
        ├── api/                   # apeluri catre backend
        ├── hooks/                 # polling comenzi (useOrders)
        └── components/            # OrderCard, OrderList, FilterBar, badges
```

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
npm run start:dev
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

Frontend-ul porneste pe `http://localhost:5173`.

## Endpoint-uri principale

| Metoda | Ruta | Descriere |
|---|---|---|
| GET | `/orders?platform=&status=` | Listeaza comenzi, cu filtre optionale |
| GET | `/orders/:id` | Detaliu comanda |
| PATCH | `/orders/:id/status` | Actualizeaza statusul unei comenzi |
| POST | `/integrations/glovo/webhook` | Endpoint pentru notificari Glovo (configurat in panoul lor de partener) |
| POST | `/simulator/start` | Porneste generarea automata de comenzi false (pentru testare) |
| POST | `/simulator/stop` | Opreste generarea automata de comenzi |
| GET | `/simulator/status` | Starea curenta a simulatorului (pornit/oprit, cate comenzi a generat) |

## Simulator de comenzi (pentru testare, fara credentiale reale)

Din dashboard, butoanele **"Start comenzi" / "Stop comenzi"** pornesc/opresc un
generator care creeaza comenzi false, dar plauzibile (nume, adrese, produse de
meniu cu preturi reale, timp estimativ de livrare), direct in baza de date -
util pentru a vedea fluxul complet inainte sa ai acces la Bolt Food / Glovo.
Cand pornesti simulatorul, o comanda noua apare la fiecare 8-18 secunde,
alternand intre cele doua platforme. Codul e in `backend/src/simulator/` si
poate fi sters usor cand nu mai e nevoie de el.

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

## Urmatorii pasi posibili (nu sunt inclusi in aceasta faza)

- Sincronizare meniu/produse cu ambele platforme
- Notificari in timp real catre frontend (WebSocket) in loc de polling
- Rapoarte/analytics (volum comenzi, timp mediu de preparare, etc.)
- Autentificare/roluri pentru dashboard
