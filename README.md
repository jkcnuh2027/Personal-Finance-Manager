# Personal Finance Manager

An interactive web application to visualize personal financial transactions over time.  
The app provides **dynamic charting** and **filtering capabilities**, helping users quickly understand spending patterns and trends at a glance.

---

## Features
- Visualize income and expenses over time with interactive charts
- Dynamic filtering and chart switching (Area, Bar, Line, Pie)
- Manual transaction entry and CSV upload
- Transaction data stored in PostgreSQL, with automatic fallback to `transactions.csv` if PostgreSQL is unavailable
- Planned integration with **Plaid API** for live financial data
- Future enhancements: advanced analytics, financial health feedback, and expanded income/expense insights

---

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Uvicorn  
- **Frontend**: React, Axios, Tailwind  
- **Database**: PostgreSQL (primary), SQLite (local debugging fallback)  
- **Other**: Pandas, Plotly, Docker (optional for deployment)

---

## Installation

### 1) Clone the repository
```bash
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

### 2) Backend Setup
Install Python dependencies:
```bash
pip install -r requirements.txt
```

Run the backend server:
```bash
uvicorn backend.main:app --reload --port 8000
```

The backend will be available at:  
👉 http://localhost:8000

---

### 3) Frontend Setup
Install Node.js dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

The frontend will be available at:  
👉 http://localhost:3000

---

## Database Setup

By default, the app connects to a local PostgreSQL database.

1. Ensure PostgreSQL is installed and running.  
2. Create the database:
   ```bash
   createdb finance_db
   ```
3. Update the connection string in `process_data.py` if needed  
   (default assumes `postgres:password@localhost:5432/finance_db`).

If PostgreSQL is not available, the app will automatically fall back to using a local `transactions.csv` file.

---

## Usage

1. Upload a CSV of transactions **or** enter transactions via the input form.  
2. The app will automatically generate visualizations of **income** and **expenses** over time.  
3. Use chart filters to explore different views (e.g., monthly trends, category breakdowns).

---

## Roadmap

- ✅ CSV upload & manual transaction entry  
- ✅ PostgreSQL/SQLite storage  
- 🔜 Plaid API integration for live bank data  
- 🔜 Advanced analytics and spending insights  
- 🔜 Personalized financial health recommendations

---

## License
This project is licensed under the MIT License.  
See the `LICENSE` file for details.
