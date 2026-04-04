
# NEXTJS - Library Web Portal

### Getting Started NEXTJS

#### 1. Clone the repository:

```bash
git clone https://github.com/developer6540/groupfour-library-portal.git
```

#### 2. Install dependencies
Install latest version of `node` and `npm`, then run the following command in the project directory to install the required dependencies:
```bash
npm install
```

#### 3. env file:
In local development mode:

- Copy `.env.local.example` and rename to `.env.local`
- Make sure to set the environment variables in the `.env.local` file before running the application

```bash
.env.local
```

In production development mode:

- Copy `.env.production.example` and rename to `.env.production`
- Make sure to set the environment variables in the `.env.production` file before running the application.
- When running in production mode, remove `env.local` file to avoid conflicts with `env.production` file.

```bash
.env.production
```

#### 4. Run the application:

In local development mode, run the following command to start the application

```bash
npm run dev
```

In production development mode, run the following command to start the application

```bash
npm run build
npm start
```
#### 5. Open the application:

```bash
Open http://localhost:3000 in your browser to see the result.
```