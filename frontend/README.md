# Weather App

A full-stack weather app built with Next.js (frontend & API) and MySQL (backend database).

## Features
- Search for current and historical weather by location (city, zip, or coordinates)
- Fetches weather data from Tomorrow.io API
- Stores and manages weather data in a MySQL database
- View, delete, and export weather data
- Info modal about the PM Accelerator program

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd frontend
```

### 2. Install dependencies
```sh
npm install
```

### 3. Set up the MySQL database
- Make sure you have MySQL running.
- Create the database and table:

```sql
CREATE DATABASE data;
USE data;
CREATE TABLE weather_measurements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  measurement_date DATE NOT NULL,
  temp_c FLOAT NOT NULL
);
```

### 4. Configure environment variables (if not hardcoded)
Create a `.env.local` file in the `frontend` directory with:
```
MYSQL_HOST=localhost
MYSQL_USER=data
MYSQL_PASSWORD=niniKai5619
MYSQL_DATABASE=data
```

> **Note:** If credentials are hardcoded in the API route, this step is not required, but it is best practice to use environment variables.

### 5. Run the development server
```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## Additional Notes
- All required Node.js dependencies are managed in `package.json`.
- For PDF export, `jspdf` and `jspdf-autotable` are included as dependencies.
- If you use any images or assets, ensure they are included in the repo.

## License
MIT
