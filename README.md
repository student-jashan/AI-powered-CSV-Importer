# AI-powered CSV Importer

An AI-powered CSV Importer that intelligently maps CSV files with different column names and structures into the GrowEasy CRM format using Groq.

## Live Demo

- **Frontend:** https://ai-powered-csv-importer-4.onrender.com/
- **Backend:** https://ai-powered-csv-importer-2-2trn.onrender.com/

## Features

- Upload CSV files via file picker or drag & drop
- Preview CSV data before importing
- AI-powered intelligent column mapping (handles varying column names)
- Batch processing (10 records per API call)
- Record validation (requires email or mobile)
- Multiple email/mobile handling (extras stored in crm_note)
- CRM status classification (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE)
- Date normalization (DD/MM/YYYY, YYYY-MM-DD, ISO 8601 -> YYYY-MM-DD HH:mm:ss)
- Data cleaning (trim whitespace, remove empty rows)
- Import summary cards (Total, Imported, Skipped)
- Search records by name, email, company, or mobile
- Paginated records table (10 per page)
- Download mapped records as CSV

## Tech Stack

- **Frontend:** Next.js 16, Tailwind CSS
- **Backend:** Node.js, Express, Multer, csv-parser
- **AI:** Groq
- **Deployment:** Render (Docker)
- **Containerization:** Docker, Docker Compose

## Project Structure

```
AI-powered-CSV-Importer/
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── server.js                   
│       ├── app.js                       
│       ├── config/
│       │   ├── groq.js                  
│       │   └── multer.js                
│       ├── controllers/
│       │   └── uploadController.js     
│       ├── middlewares/
│       │   └── errorMiddleware.js       
│       ├── prompts/
│       │   └── crmPrompt.js             
│       ├── routes/
│       │   └── uploadRoutes.js        
│       ├── services/
│       │   ├── aiService.js            
│       │   ├── crmMapper.js            
│       │   └── csvService.js            
│       └── utils/
│           ├── batchHelper.js           
│           ├── csvCleaner.js            
│           ├── dateFormatter.js         
│           └── validation.js            
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── next.config.ts
    ├── package.json
    ├── app/
    │   ├── layout.tsx                   
    │   ├── page.tsx                    
    │   └── globals.css                  
    ├── components/
    │   ├── UploadSection.jsx           
    │   ├── PreviewTable.jsx            
    │   ├── RecordsTable.jsx             
    │   ├── SummaryCards.jsx            
    │   ├── TestConnection.jsx           
    │   ├── EmptyState.jsx               
    │   ├── Header.jsx                   
    │   └── Loader.jsx                  
    ├── services/
    │   └── api.jsx                      
    └── utils/
        ├── csvParser.js                 
        └── download.js                 
```

## Getting Started

### Prerequisites

- Node.js 20+
- A [Groq API key](https://console.groq.com/)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` in the `backend/` directory:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

Start the backend:

```bash
npm start        # production
npm run dev      # development (with nodemon)
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000` and the backend at `http://localhost:5000`.

## API Endpoints

### Health Check

```
GET /
```

Response:
```json
{
  "success": true,
  "message": "GrowEasy Backend is Running"
}
```

## How It Works

```
User uploads CSV
       |
       v
Frontend: POST /api/upload (multipart/form-data)
       |
       v
Multer: saves CSV to uploads/ (filter: .csv, max: 10MB)
       |
       v
Parse: csv-parser reads CSV into array of objects
       |
       v
Clean: trim whitespace, remove empty rows
       |
       v
Validate: skip rows missing both email AND mobile
       |
       v
Batch: split valid records into chunks of 10
       |
       v
For each batch:
  +-- Try AI mapping
  +-- On failure: fallback to deterministic crmMapper
       |
       v
Normalize dates to YYYY-MM-DD HH:mm:ss
       |
       v
Return JSON response with summary + mapped data
       |
       v
Delete uploaded CSV file from disk
       |
       v
Frontend: display SummaryCards + RecordsTable + Search + Pagination + Download
```

## CRM Fields

| Field | Description |
|-------|-------------|
| `created_at` | Date (normalized to YYYY-MM-DD HH:mm:ss) |
| `name` | Customer / Full Name |
| `email` | Primary email address |
| `country_code` | Dialing code (e.g., +1, +91) |
| `mobile_without_country_code` | Phone number without country code |
| `company` | Organization / Business name |
| `city` | City name |
| `state` | State / Province |
| `country` | Country name |
| `lead_owner` | Sales person responsible |
| `crm_status` | AI-classified lead status |
| `crm_note` | Remarks, comments, extra contacts |
| `data_source` | Campaign / source identifier |
| `possession_time` | Visit / possession time |
| `description` | Extra details only |

## CRM Status Classification

| Status | Trigger Keywords |
|--------|-----------------|
| `GOOD_LEAD_FOLLOW_UP` | interested, requested demo, wants pricing, follow up, schedule meeting, call again, positive response |
| `DID_NOT_CONNECT` | no answer, switched off, unreachable, busy, not connected, voicemail |
| `BAD_LEAD` | not interested, fake lead, wrong number, rejected, spam |
| `SALE_DONE` | deal closed, purchased, payment completed, onboarding completed, converted customer |

## Data Source Rules

Allowed values (matched from CSV if present):

- `leads_on_demand`
- `meridian_tower`
- `eden_park`
- `varah_swamy`
- `sarjapur_plots`

## Column Mapping Examples

The AI intelligently maps varying column names:

| Input Column | Target Field |
|-------------|--------------|
| Customer Name, Full Name | `name` |
| Email Address, Primary Email | `email` |
| Phone, Contact Number | `mobile_without_country_code` |
| Organization, Business Name | `company` |
| Town, City | `city` |
| Province, State | `state` |
| Sales Person, Owner | `lead_owner` |
| Created Date, Date | `created_at` |
| Remarks, Notes, Comments | `crm_note` |
| Extra Details, Description | `description` |

## Docker

### Using Docker Compose

```bash
docker-compose up --build
```

This starts both frontend (port 3000) and backend (port 5000).

### Individual Docker Builds

Backend:
```bash
cd backend
docker build -t crm-backend .
docker run -p 5000:5000 --env-file .env crm-backend
```

Frontend:
```bash
cd frontend
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000 -t crm-frontend .
docker run -p 3000:3000 crm-frontend
```

ISC
