# GrowEasy CRM AI Importer

AI-powered CSV importer that intelligently maps CRM lead data from any CSV format into GrowEasy CRM format.

## Architecture

```
Frontend (Next.js)  --POST /api/upload-->  Backend (Express.js)  --AI--> Llama 3.3-70B (Groq)
     :3000                                    :5000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI | Groq (Llama 3.3-70B) with deterministic fallback |
| Upload | Multer (CSV, max 10MB) |

## Setup

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# PORT=5000
# GROQ_API_KEY=your_groq_api_key

# Start development server
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Features

- **Drag & Drop CSV Upload** — intuitive file upload with drag-and-drop support
- **Smart CSV Preview** — parse and display CSV data before import with scrollable/sticky header table
- **AI-Powered Field Mapping** — intelligently maps any CSV column names to CRM fields using Llama 3.3-70B
- **Deterministic Fallback** — rule-based mapper activates if AI fails
- **Batch Processing** — records processed in batches of 10 with retry mechanism
- **Intelligent Field Extraction** — auto-detects country codes from phone numbers
- **Multi-value Handling** — splits multiple emails/phones across CRM note field
- **Search & Paginate** — filter and browse mapped results
- **CSV Download** — export mapped records as CSV

## API

### POST /api/upload

Upload a CSV file for AI-powered CRM mapping.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "message": "CSV mapped successfully",
  "totalRecords": 100,
  "validRecords": 95,
  "invalidRecords": 5,
  "mappingSkipped": 0,
  "data": [
    {
      "created_at": "2026-05-13 14:20:48",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "country_code": "+91",
      "mobile_without_country_code": "9876543210",
      "company": "GrowEasy",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "lead_owner": "test@gmail.com",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "crm_note": "",
      "data_source": "",
      "possession_time": "",
      "description": ""
    }
  ]
}
```

## CRM Fields

| Field | Description |
|-------|------------|
| `created_at` | Lead creation date |
| `name` | Lead name |
| `email` | Primary email |
| `country_code` | Country code (e.g., +91) |
| `mobile_without_country_code` | Mobile number |
| `company` | Company name |
| `city` | City |
| `state` | State |
| `country` | Country |
| `lead_owner` | Lead owner |
| `crm_status` | Lead status (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE) |
| `crm_note` | Notes/remarks |
| `data_source` | Source |
| `possession_time` | Property possession time |
| `description` | Additional description |
