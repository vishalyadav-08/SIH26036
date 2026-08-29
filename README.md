# MapanSetu — SIH26036

Digital lifecycle management for regulated weighing and measuring instruments:
registration, verification applications, officer assignment and scheduling,
field inspection with evidence, certificate issuance, and public verification.

The engineering specification lives in [docs/](docs/). Start with
[docs/README.md](docs/README.md).

> Prototype scope. Synthetic data only. The software records and coordinates
> verification work — it does not perform statutory verification, grant legal
> approval, or claim live government integration.

## Layout

```text
backend/     Django + DRF API, one modular monolith
frontend/    Next.js + TypeScript web portal (business, admin, public lookup)
docs/        Active specification and ADRs
```

## Backend

```bash
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
cp .env.example .env
venv/bin/python manage.py migrate
venv/bin/python manage.py createsuperuser
venv/bin/python manage.py runserver 8000
```

- API base path: `http://localhost:8000/api/v1`
- Interactive API docs: `http://localhost:8000/api/v1/docs/`
- Django admin: `http://localhost:8000/admin/`

Modules under `backend/` follow `docs/ARCHITECTURE.md` §3. Each one owns
`models.py`, `serializers.py` (JSON shape and field validation), `services.py`
(domain rules and state transitions), `views.py` (thin), and `urls.py`.

PostgreSQL is the system of record. Set `DATABASE_URI` in `.env` to use it;
without that variable the project falls back to SQLite so a fresh clone runs.

## Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Runs on `http://localhost:3000`.

- `src/services/` owns HTTP calls, `src/schemas/` owns client validation,
  `src/hooks/` owns TanStack Query state, `src/types/` owns API types.
- Route guards in `src/components/auth/` are a UX convenience only. The API is
  the authority on authorization.

## Routes

| Audience | Routes |
|---|---|
| Public | `/`, `/verify/:certNo` |
| Auth | `/login` |
| Business | `/app`, `/app/instruments`, `/app/applications`, `/app/certificates`, `/app/notifications`, `/app/profile` |
| Admin | `/admin`, `/admin/applications`, `/admin/instruments`, `/admin/officers`, `/admin/schedules`, `/admin/certificates`, `/admin/notifications`, `/admin/audit`, `/admin/settings` |
