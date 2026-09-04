# MapanSetu Deployment Guide (Render + Vercel)

The backend is fully built and tested. Here is how you can host the database and backend for free on Render, and connect it to your Vercel frontend.

## 1. Hosting PostgreSQL on Render (Free Tier)
1. Go to [Render.com](https://render.com) and create an account.
2. Click **New +** and select **PostgreSQL**.
3. Name it `mapansetu-db` (or anything you like).
4. Select the **Free** instance type.
5. Click **Create Database**.
6. Once created, scroll down to the **Connections** section. Look for the **Internal Database URL** (for when you deploy the backend on Render) and **External Database URL** (if you want to connect from your local PC). 
   - Note: The URL looks like this: `postgresql://user:password@hostname/dbname`.

## 2. Connect Your Local Backend to PostgreSQL (Optional but Recommended)
If you want to use the Render database locally to verify:
1. Open `d:\Projects\Mapansetu\backend\.env`.
2. Find `DATABASE_URI` and set it to your **External Database URL**:
   ```env
   DATABASE_URI=postgresql://<user>:<password>@<external-host>/<dbname>
   ```
3. Run migrations on the new database:
   ```powershell
   d:\Projects\Mapansetu\backend\venv\Scripts\python.exe manage.py migrate
   ```

## 3. Deploying the Django Backend on Render (Free Tier)
1. In Render, click **New +** and select **Web Service**.
2. Connect your GitHub repository containing the backend code (`mapansetu`).
3. Set the following details:
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn root.wsgi:application`
   - **Instance Type**: Free
4. Add the following **Environment Variables** (in the Advanced section):
   - `PYTHON_VERSION`: `3.11.0` (or whatever matches your local)
   - `DATABASE_URI`: (Paste the **Internal Database URL** from step 1)
   - `SECRET_KEY`: (Generate a long random string or copy the one from your `.env`)
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `mapansetu-backend.onrender.com` (replace with your actual render URL)
   - `FRONTEND_URL`: `https://mapansetu.vercel.app`
   - `CORS_ALLOWED_ORIGINS`: `https://mapansetu.vercel.app`
5. Click **Create Web Service**. 
6. Once it deploys, copy the backend URL (e.g., `https://mapansetu-backend.onrender.com`).

## 4. Connecting Vercel Frontend to the Deployed Backend
1. Go to your project settings in [Vercel](https://vercel.com).
2. Navigate to **Environment Variables**.
3. Add a new variable:
   - **Key**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: (The URL you copied from Render, e.g., `https://mapansetu-backend.onrender.com`)
4. **Important**: Since we turned off `USE_MOCK_API = true` locally, make sure to push that change to GitHub so Vercel builds the frontend using the real API!
5. Redeploy your Vercel app.

## 5. Seed the Render Database
After the backend is deployed, you'll need the initial demo data:
1. In your Render Web Service dashboard, go to the **Shell** tab.
2. Run this command to execute the seed script:
   ```bash
   python manage.py shell < seed_demo.py
   ```
   *(Alternatively, log in as admin and create records from the UI).*

Now your full stack is deployed and communicating!
