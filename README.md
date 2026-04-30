# API Patrick

API NestJS che integra TradeDoubler, Zemanta, Adform, RTBHouse, esponendo endpoint REST per autenticazione provider, creazione/lettura di job di importazione dati e gestione utenti.

---

## Stack

- **Runtime:** Node.js 22 LTS (richiesto: ≥ 20.19)
- **Framework:** NestJS 11
- **DB:** PostgreSQL 14+
- **ORM:** Prisma 7
- **Process manager:** PM2 (configurazione in `ecosystem.config.js`)

---

## Indice

- [Setup iniziale](#setup-iniziale)
- [Variabili d'ambiente](#variabili-dambiente)
- [Database](#database)
- [Avvio con PM2](#avvio-con-pm2)
- [Comandi npm utili](#comandi-npm-utili)
- [API Reference](#api-reference)
  - [Convenzioni](#convenzioni)
  - [Users](#users)
  - [TradeDoubler](#tradedoubler)
  - [Zemanta](#zemanta)
  - [Adform](#adform)
  - [RTBHouse](#rtbhouse)
- [Troubleshooting](#troubleshooting)

---

## Setup iniziale

```bash
# 1. Clona e entra
git clone <repo-url> api-patrick
cd api-patrick

# 2. Dipendenze
npm install

# 3. Configura .env (vedi sezione successiva)
cp .env.example .env
nano .env

# 4. Genera il client Prisma e applica le migrazioni
npm run db:generate
npm run db:migrate

# 5. Build
npm run build

# 6. Avvia con PM2
npm run pm2:start
```

> **Server con poca RAM (≤ 2 GB):** assicurati di avere almeno 4 GB di swap. Lo script `build` è già configurato con `NODE_OPTIONS=--max-old-space-size=3072`.

---

## Variabili d'ambiente

File `.env` nella root. Tutte le variabili sotto sono richieste, salvo dove indicato come opzionale.

```bash
# ----- Database -----
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
# Caratteri speciali nella password vanno URL-encoded (es. & → %26, ! → %21)

# ----- App -----
NODE_ENV=production           # 'development' | 'production'
PORT=8000

# ----- Shopify (modulo attualmente disabilitato) -----
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_HOST_NAME=localhost:8000

# ----- Zemanta -----
ZEMANTA_CLIENT_ID=...
ZEMANTA_CLIENT_SECRET=...

# ----- TradeDoubler -----
TRADEDOUBLER_SECRET=...
TRADEDOUBLER_CLIENT_ID=...
TRADEDOUBLER_USERNAME=...
TRADEDOUBLER_PASSWORD=...
TRADEDOUBLER_BASE_URL=https://connect.tradedoubler.com

# ----- Adform -----
ADFORM_CLIENT_ID=...
ADFORM_CLIENT_SECRET=...

# ----- Sicurezza -----
TOKEN_ENCRYPTION_KEY=<32 caratteri>   # AES-256, obbligatoria in produzione
```

---

## Database

### Creazione utente e DB

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE myndo;
CREATE USER myndo_user WITH ENCRYPTED PASSWORD 'una_password';
GRANT ALL PRIVILEGES ON DATABASE myndo TO myndo_user;
\c myndo
GRANT ALL ON SCHEMA public TO myndo_user;
ALTER DATABASE myndo OWNER TO myndo_user;
ALTER SCHEMA public OWNER TO myndo_user;
\q
```

### Applicazione delle migrazioni

```bash
npm run db:migrate     # prisma migrate deploy — applica le migrazioni mancanti
npm run db:generate    # rigenera il client Prisma
```

> **Nota:** non usare `npm run db:push` se hai migrazioni già presenti in `prisma/migrations/`. Mescolare `db push` e `migrate` causa l'errore `P3005`. Se ti capita, fai il **baseline**:
>
> ```bash
> npx prisma migrate resolve --applied <nome_migrazione>
> ```

---

## Avvio con PM2

Il file `ecosystem.config.js` definisce **4 processi**:

| Nome | Script | Ruolo |
|------|--------|-------|
| `api` | `dist/src/main.js` | Server REST principale |
| `tradedoubler-worker` | `dist/src/workers/tradedoubler-job.worker.js` | Worker job TradeDoubler |
| `rtbhouse-worker` | `dist/src/workers/rtbhouse-job.worker.js` | Worker job RTBHouse |
| `zemanta-worker` | `dist/src/workers/zemanta-job.worker.js` | Worker job Zemanta |

> I worker hanno `autorestart: false`: se crashano, **non vengono riavviati** automaticamente. Verifica periodicamente lo stato con `npm run pm2:status`.

### Primo avvio

```bash
npm run pm2:start            # avvia tutti i processi
npm run pm2:status           # verifica
npm run pm2:logs:api         # tail dei log dell'API
```

### Avvio automatico al boot del server

```bash
npm run pm2:save             # salva lo stato corrente
npm run pm2:startup          # stampa un comando 'sudo env PATH=...'
# → copia e lancia il comando 'sudo env PATH=...' che ti viene stampato
```

Da quel momento, `sudo reboot` riavvia automaticamente PM2 con i processi salvati.

### Aggiornamenti del codice

```bash
npm run deploy
# = git pull && npm install && db:migrate && build && pm2:reload && pm2:save
```

---

## Comandi npm utili

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Avvio in watch-mode (sviluppo) |
| `npm run build` | Build production con heap limitato a 3 GB |
| `npm run start:prod` | Avvio diretto del build (senza PM2) |
| `npm run db:generate` | Genera il client Prisma |
| `npm run db:migrate` | Applica migrazioni Prisma |
| `npm run db:push` | Sincronizza lo schema senza migrazioni *(usare solo in dev)* |
| `npm run db:seed` | Esegue `prisma/seed.ts` |
| `npm run lint` / `npm run format` | Lint / Prettier |
| `npm run test` | Test unit |
| `npm run pm2:start` | Avvia tutti i processi PM2 |
| `npm run pm2:start:api` | Avvia solo l'API |
| `npm run pm2:start:workers` | Avvia solo i worker |
| `npm run pm2:restart` | Restart con `--update-env` (rilegge il `.env`) |
| `npm run pm2:reload` | Reload graceful con `--update-env` |
| `npm run pm2:status` | Stato di tutti i processi |
| `npm run pm2:logs` | Log aggregati |
| `npm run pm2:logs:api` | Log della sola API |
| `npm run pm2:monit` | Dashboard CPU/RAM live |
| `npm run pm2:save` | Salva stato per startup automatico |
| `npm run pm2:startup` | Configura avvio automatico al boot |
| `npm run deploy` | Pipeline completa: git pull + install + migrate + build + reload + save |

---

## API Reference

### Convenzioni

- **Base URL:** `http://<host>:<PORT>/api/v1`
- **Content-Type:** `application/json` per tutti i body
- **Validazione:** ogni endpoint con DTO usa `class-validator` con `whitelist: true`. Campi extra vengono ignorati silenziosamente.
- **CORS:** abilitato su origini definite in `config.url.allowedOrigins` (default `http://localhost:3000`)
- **Sicurezza:** Helmet attivo, cookie-parser attivo

#### Formato risposta standard

Tutte le risposte di successo hanno la forma:

```json
{
  "status": 200,
  "results": { ... }
}
```

Le risposte di errore sono `HttpException` standard di NestJS:

```json
{
  "statusCode": 400,
  "message": "Descrizione errore",
  "error": "Bad Request"
}
```

#### Autenticazione

| Tipo | Dove si applica | Come |
|---|---|---|
| `UserAuthGuard` (cookie JWT) | Endpoint Users marcati 🔒 | Cookie `nameLogin` impostato dopo login |
| Bearer Token | TradeDoubler `/jobs/status`, `/jobs/data` | Header `Authorization: Bearer <token>` |
| Nessuna | Tutti gli altri | Endpoint pubblici |

> **Attenzione:** il controller `users.auth.controller.ts` (register, login, confirm-email, reset-password, logout) è **interamente commentato** in questa versione del codice. Gli endpoint marcati 🔒 quindi al momento non hanno un flusso di login pubblico per ottenere il cookie. Da reintrodurre prima del go-live.

---

### Users

Base path: `/api/v1/users`

#### `GET /users/me` 🔒
Ritorna il profilo dell'utente autenticato.

**Auth:** richiesta (cookie)
**Response:** oggetto `User` con relazioni.

---

#### `GET /users`
Lista paginata utenti.

**Query params:**
| Nome | Tipo | Default | Note |
|---|---|---|---|
| `search` | string | — | Filtro testuale |
| `take` | number | — | Risultati per pagina |
| `page` | number | — | Pagina (1-based) |
| `sort` | string | — | Campo di ordinamento |

**Response:** lista paginata utenti.

---

#### `PUT /users/:userId/change-status` 🔒
Cambia lo status dell'utente con id `userId`.

**Path:** `userId` (UUID)
**Auth:** richiesta
**Response:** `"Status changed successfully"`

---

#### `PUT /users/change-password` 🔒
Aggiorna la password dell'utente autenticato.

**Body:**
```json
{
  "password": "vecchia_password",
  "newPassword": "nuova_password",
  "passwordConfirm": "nuova_password"
}
```
Tutte le password ≥ 8 caratteri. `passwordConfirm` deve coincidere con `newPassword`.

**Response:** `"Password Updated successfully"`

---

#### `PUT /users/confirmation/:token`
Conferma l'invito di un contributor impostando la password.

**Path:** `token` (JWT)
**Body:**
```json
{
  "password": "min8char",
  "passwordConfirm": "min8char"
}
```
**Response:** `"Password confirmed"`

---

#### `PUT /users/invitation/confirmation/:token`
Conferma una richiesta di collaborazione.

**Path:** `token` (JWT)
**Response:** `"Invitation confirmed"`

---

#### `PUT /users/rejection/:token`
Rifiuta una richiesta di collaborazione.

**Path:** `token` (JWT)
**Response:** `"Collaboration rejected"`

---

#### `PUT /users/change-email` 🔒
Aggiorna l'email dell'utente autenticato.

**Body:**
```json
{
  "email": "nuova@email.com",
  "password": "password_corrente"
}
```
**Response:** `"Email updated successfully"`

---

#### `GET /users/:userId/show`
Dettaglio di un utente.

**Path:** `userId` (UUID)
**Response:** oggetto `User` o 404.

---

#### `GET /users/:userId/profiles/:provider`
Profilo provider (es. `tradedoubler`, `zemanta`, `adform`, `rtbhouse`) di un utente.

**Path:** `userId` (UUID), `provider` (string)
**Response:** oggetto `ProviderProfile` o 404.

---

#### `DELETE /users/:userId/delete` 🔒
Soft-delete dell'utente (imposta `deletedAt`) e clear del cookie.

**Path:** `userId` (UUID)
**Auth:** richiesta
**Response:** `"User deleted successfully"`

---

#### `GET /users/statistics` 🔒
Statistiche aggregate sulle transazioni utente.

**Auth:** richiesta
**Response:** oggetto statistiche.

---

### TradeDoubler

Base path: `/api/v1/trade_doubler`

#### `POST /trade_doubler/users/register`
Esegue login OAuth verso TradeDoubler (`/uaa/oauth/token` con grant `password`), salva il token, recupera l'account advertiser, crea/aggiorna utente e provider profile.

**Body:**
```json
{
  "username": "td_user",
  "password": "td_password",
  "clientId": "td_client_id",
  "secret": "td_secret"
}
```

**Response:**
```json
{
  "id": "<providerProfileId>",
  "user_id": "<userId>",
  "message": "Login successful. ..."
}
```

---

#### `POST /trade_doubler/jobs/create`
Crea un job di importazione TradeDoubler. Il job viene processato dal worker `tradedoubler-worker`.

**Body:**
```json
{
  "fromDate": "2025-01-01",
  "toDate": "2025-01-31",
  "reportCurrencyCode": "EUR",
  "profileId": "<providerProfileId>",
  "reportType": "<opzionale>",
  "intervalType": "<opzionale>"
}
```

**Response:** oggetto job con id.

---

#### `GET /trade_doubler/jobs/status`
Stato di un job TradeDoubler.

**Auth:** Bearer token
**Query:** `job_Id` (string, **obbligatorio** — nota la `J` maiuscola)
**Response:** oggetto status.

---

#### `GET /trade_doubler/jobs/data`
Dati salvati di un job completato.

**Auth:** Bearer token
**Query:** `job_Id` (string, obbligatorio)
**Response:** array di record importati.

---

#### `GET /trade_doubler/users/profiles`
Provider profile TradeDoubler di un utente.

**Query:** `userId` (UUID, obbligatorio)
**Response:** oggetto profilo o 400 se manca `userId`.

---

### Zemanta

Base path: `/api/v1/zemanta`

#### `POST /zemanta/users/register`
Genera access token Zemanta con `clientId/clientSecret`, recupera la lista degli account, crea/aggiorna user e provider profile, salva le credenziali in `IntegrationToken`.

**Body:**
```json
{
  "clientId": "...",
  "clientSecret": "..."
}
```

**Response:** oggetto con `user_id`, `id` e `message`.

---

#### `POST /zemanta/jobs/create`
Crea e mette in coda un job Zemanta.

**Body:**
```json
{
  "fromDate": "2025-01-01",
  "toDate": "2025-01-31",
  "profileId": "<providerProfileId>",
  "accountId": "<opzionale>"
}
```

**Response:** oggetto job.

---

#### `GET /zemanta/jobs/status`
Stato job.

**Query:** `job_Id` (string, obbligatorio)

---

#### `GET /zemanta/jobs/data`
Dati job.

**Query:** `job_Id` (string, obbligatorio)

---

#### `GET /zemanta/users/profiles`
Provider profile Zemanta di un utente.

**Query:** `userId` (UUID, obbligatorio)

---

### Adform

Base path: `/api/v1/adform`

#### `POST /adform/users/register`
Login Adform e setup di user, provider profile, integration token.

**Body:**
```json
{
  "clientId": "...",
  "clientSecret": "..."
}
```
Entrambi i campi sono opzionali a livello di validazione, ma in pratica servono per autenticarsi.

**Response:** oggetto con `user_id`, `id`, `message`.

---

#### `GET /adform/users/profiles`
Provider profile Adform.

**Query:** `userId` (UUID, obbligatorio)

---

#### `GET /adform/campaigns`
Lista campagne Adform per l'account configurato.

**Response:** array campagne.

---

#### `POST /adform/jobs/create`
Crea un job di importazione Adform.

**Body:**
```json
{
  "fromDate": "2025-01-01",
  "toDate": "2025-01-31",
  "profileId": "<providerProfileId>",
  "reportCurrencyCode": "EUR"
}
```

**Response:** oggetto job.

---

#### `POST /adform/stats`
Recupera statistiche Adform sincrone (non passa per worker).

**Body:**
```json
{
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31",
  "dimensions": ["campaign", "date"],
  "metrics": ["impressions", "clicks", "cost"],
  "campaignIds": [123, 456],
  "advertiserIds": [789]
}
```
- `dateFrom` / `dateTo`: formato `YYYY-MM-DD` obbligatorio
- Tutti gli altri campi opzionali

**Response:** dataset statistiche.

---

### RTBHouse

Base path: `/api/v1/rtbhouse`

#### `POST /rtbhouse/users/register`
Login RTBHouse: genera un token JWT locale (`type: rtbhouse-platform-auth`, scadenza 30 giorni), recupera advertiser/client info, salva user, provider profile, integration token.

**Body:**
```json
{
  "username": "...",
  "password": "..."
}
```

**Response:**
```json
{
  "user_id": "<uuid>",
  "id": "<providerProfileId>",
  "message": "Login successful. ..."
}
```

---

#### `POST /rtbhouse/jobs/create`
Mette in coda un job di importazione RTBHouse.

**Body:**
```json
{
  "dayFrom": "2025-01-01",
  "dayTo": "2025-01-31",
  "profileId": "<providerProfileId>",
  "userId": "<opzionale>"
}
```

> Attenzione ai nomi campo: qui sono `dayFrom`/`dayTo` (≠ TradeDoubler/Zemanta/Adform che usano `fromDate`/`toDate`).

**Response:** oggetto job.

---

#### `GET /rtbhouse/jobs/status`
Stato job.

**Query:** `job_Id` (string, obbligatorio)

---

#### `GET /rtbhouse/jobs/data`
Dati job.

**Query:** `job_Id` (string, obbligatorio)

---

#### `GET /rtbhouse/users/profiles`
Provider profile RTBHouse.

**Query:** `userId` (UUID, obbligatorio)

---

## Troubleshooting

### Build OOM (out of memory)

Se durante `npm run build` vedi `JavaScript heap out of memory`:
1. Verifica swap: `free -h` (consigliati ≥ 4 GB)
2. Ferma temporaneamente Postgres: `sudo systemctl stop postgresql`
3. Aumenta heap: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`

### Errore Prisma `P3005`

`The database schema is not empty`. Significa che il DB ha tabelle ma non la tabella `_prisma_migrations`. Tipico dopo un `db push`.

**Soluzione (se schema coerente):**
```bash
npx prisma migrate resolve --applied <nome_migrazione>
```

**Soluzione (reset, in dev):**
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO <user>;
ALTER SCHEMA public OWNER TO <user>;
```
Poi `npm run db:migrate`.

### Cambi al `.env` non hanno effetto

PM2 fa caching delle variabili d'ambiente. Usa sempre:
```bash
npm run pm2:restart   # già configurato con --update-env
```

### Porta già in uso

```bash
lsof -ti:8000
kill -9 $(lsof -ti:8000)
```
oppure cambia `PORT` nel `.env` e fai `npm run pm2:restart`.

### Build artefatto sporco

```bash
rm -rf dist/ node_modules/
npm install
npm run build
```

### `geoip-lite` warning su Node 22

Warning innocuo: la libreria dichiara `engines: node >=24` ma funziona correttamente da Node 18 in poi. Ignorabile.

---

## Note di sicurezza

- `TOKEN_ENCRYPTION_KEY` deve essere esattamente di 32 caratteri (AES-256). In produzione il fallback a chiave debole è disabilitato.
- Le credenziali provider (TradeDoubler, Zemanta, Adform, RTBHouse) sono salvate cifrate nella tabella `IntegrationToken`.
- Il token RTBHouse generato dal `/users/register` è un JWT firmato con `config.cookieKey` e include username/password in chiaro nel payload: **non esporlo a client non fidati**.
- L'`npm audit` segnala vulnerabilità note in dipendenze transitive. **Non lanciare `npm audit fix --force`** senza valutazione: rischia di rompere le versioni di Nest e Prisma.
