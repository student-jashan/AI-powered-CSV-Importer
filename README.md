# AI-powered CSV Importer

An AI-powered CSV Importer that intelligently maps CSV files with
different column names and structures into the GrowEasy CRM format.

## Live Demo

-   Frontend: https://ai-powered-csv-importer-4.onrender.com/
-   Backend: https://ai-powered-csv-importer-2-2trn.onrender.com/

## Features

-   Upload CSV files
-   AI-powered column mapping
-   Preview mapped fields
-   Import valid records
-   Skip invalid records
-   Import summary (Total, Imported, Skipped)

## Tech Stack

**Frontend:** Next.js

**Backend:** Node.js, Express.js

## Project Structure

```text
AI-powered-CSV-Importer/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md

```

### Backend

``` bash
cd backend
npm install
npm start
```

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

## Working

1.  Upload a CSV.
2.  Backend parses the CSV.
3.  AI maps CSV columns to CRM fields.
4.  Review detected mappings.
5.  Valid records are imported.
6.  Invalid records are skipped.
7.  View the import summary.

## CRM Fields

-   created_at
-   name
-   email
-   country_code
-   mobile_without_country_code
-   company
-   city
-   state
-   country
-   lead_owner
-   crm_status
-   crm_note
-   data_source
-   possession_time
-   description
