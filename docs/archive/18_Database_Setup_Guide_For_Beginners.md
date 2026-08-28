# Database Setup Guide for Beginners

Welcome to the Mapansetu project! If you're new to backend development, databases can seem a little intimidating, but don't worry—this guide is written specifically for you. By the end of this guide, you will have a fully working PostgreSQL database connected to our application using Prisma.

We will go step-by-step. Let's get started!

---

## Step 1: Install PostgreSQL on Windows

PostgreSQL (often just called "Postgres") is the database engine that will store all of Mapansetu's data.

1. **Download PostgreSQL:**
   - Go to the official download page: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Click on **"Download the installer"**.
   - Download the latest version for your version of Windows.

2. **Run the Installer:**
   - Double-click the downloaded `.exe` file.
   - Keep clicking **Next** to accept the default settings (it will install the PostgreSQL Server, pgAdmin 4, Stack Builder, and Command Line Tools—you want all of these except maybe Stack Builder, but it's fine to leave it checked).

3. **Set Your Password:**
   - During the installation, it will ask you for a password for the database superuser (postgres).
   - **Important:** Set this password to exactly: `password`
   - *Why?* For local development, keeping it simple means you won't forget it, and our default configuration files will work automatically.

4. **Port Number:**
   - It will ask for a port number. Leave it as the default: **5432**.

5. **Finish Installation:**
   - Complete the installation process.

---

## Step 2: Create the Database using pgAdmin

pgAdmin is a graphical tool (a GUI) that installed alongside PostgreSQL. It lets you interact with your database using a visual interface instead of typing code.

1. **Open pgAdmin:**
   - Search for "pgAdmin 4" in your Windows Start Menu and open it.

2. **Connect to Your Server:**
   - In the left sidebar under "Servers", double-click on "PostgreSQL [version number]".
   - It will ask for the password you created earlier (`password`). Enter it and check "Save Password".

3. **Create the Database:**
   - Right-click on the **"Databases"** folder.
   - Go to **Create** > **Database...**
   - In the "Database" field, type exactly: `mapansetu_db`
   - Leave everything else as is and click **Save**.

Congratulations! You now have an empty database ready to be filled.

---

## Step 3: What is Prisma?

Before we jump back to the code, you need to know about **Prisma**.

Databases speak a language called SQL. Writing SQL manually can be tedious and prone to errors. Prisma is an ORM (Object-Relational Mapper). In simple terms, Prisma is a tool that writes the complex SQL code for us. We just define what our database should look like in a single file (`schema.prisma`), and Prisma handles the rest!

---

## Step 4: Install Prisma

Now we need to add Prisma to our project.

1. Open your terminal (e.g., VS Code Terminal, Command Prompt, or PowerShell).
2. Navigate into the `services/api` directory:
   ```bash
   cd services/api
   ```
3. Run the following commands to install Prisma and its client:
   ```bash
   # This installs the code that our app uses to talk to the database
   npm install @prisma/client
   
   # This installs the command-line tools we need to manage the database
   npm install -D prisma
   ```

---

## Step 5: Configure the Database Connection

Our app needs to know how to connect to the database you just created.

1. In your code editor, open the `services/api` folder.
2. Look for a file named `.env` (create it if it doesn't exist).
3. Add the following line to the `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mapansetu_db?schema=public"
   ```

**What does this URL mean?**
- `postgresql://` -> We are connecting to a PostgreSQL database.
- `postgres:` -> The default username.
- `password` -> The password you set during installation.
- `@localhost:` -> The database is running on your own computer.
- `5432` -> The default port number.
- `/mapansetu_db` -> The name of the database we created in pgAdmin.
- `?schema=public` -> The default schema inside the database.

---

## Step 6: Run Migrations (Create the Tables)

Right now, your `mapansetu_db` database is completely empty. We need to create the tables (like users, businesses, etc.) based on our code. This process is called a "Migration".

1. Make sure you are still in the `services/api` directory in your terminal.
2. Run this exact command:
   ```bash
   npx prisma migrate dev --name init
   ```
   
**What does this do?**
- It looks at our Prisma schema file.
- It generates the SQL commands needed to create the tables.
- It sends those commands to your PostgreSQL database.
- It names this migration "init" (short for initialization).

If it succeeds, your database is now structured correctly!

---

## Step 7: View Your Database with Prisma Studio

Instead of going back to pgAdmin, Prisma gives us an even better tool to view and manually edit our data.

1. In your terminal (inside `services/api`), run:
   ```bash
   npx prisma studio
   ```
2. A new tab will automatically open in your web browser (usually at `http://localhost:5555`).
3. You will see a list of all your database tables. You can click on any table to view, add, edit, or delete records. Keep this tool in mind; it is extremely useful for debugging!

---

## Step 8: Database Seeding (Adding Initial Data)

Your tables exist, but they are empty. For the application to work, we need some initial data (like an Admin account, LMO accounts, and Business accounts) so your team can log in and test things.

Adding initial placeholder data is called "seeding".

1. You may need to stop Prisma Studio first (click in your terminal and press `Ctrl+C`).
2. Run the seeder script by typing:
   ```bash
   npm run db:seed
   ```
   
*(Note: This command runs a script defined in our `package.json` that uses Prisma to insert predefined users and data into the database).*

**Success!**
You have installed PostgreSQL, created a database, configured Prisma, created your tables, and added test data. You are completely done with the database setup and ready to start coding!
