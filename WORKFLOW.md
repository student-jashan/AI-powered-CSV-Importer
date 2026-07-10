# CRM AI CSV Mapper — Full Workflow

## Architecture Overview

```
Frontend (Next.js)  --POST /api/upload-->  Backend (Express.js)  --Groq API-->  AI (Llama 3.3-70B)
     :5000                                    :5000
```

---

## 1. File Upload (Frontend)

**Component:** `frontend/components/UploadSection.jsx`

### 1.1 File Selection
- User selects a `.csv` file via the file input (`<input type="file" accept=".csv">`) or drags & drops a file onto the upload card.
- `handleFileChange(e)` or `handleDrop(e)` sets `file` state with the selected `File` object.
- Non-CSV drops trigger an error message via `setMessage()` + `setIsError(true)`.
- The upload card visually highlights green (`border-green-500 bg-gray-600`) when a file is dragged over.

### 1.2 Upload Trigger
- User clicks **Upload & Map CSV** button.
- `handleUpload()` validates that a file is selected. If not, shows `"Please select a CSV file."`.
- Creates a `FormData` object appending the file under the key `"file"`.
- Sets `loading = true`, clears any previous message.

### 1.3 Loading Steps (Simulated)
The frontend displays sequential status messages with 300ms delays (except the AI step which waits for the actual response):

| Step | Message |
|------|---------|
| 1 | `"Uploading CSV..."` |
| 2 | `"Parsing CSV..."` |
| 3 | `"Cleaning Data..."` |
| 4 | `"Validating Records..."` |
| 5 | `"AI Mapping Records..."` (actual API call happens here) |
| 6 | `"Preparing Results..."` |

### 1.4 API Call
```
POST http://localhost:5000/api/upload
Content-Type: multipart/form-data
Body: file=<csv_file>
```
Axios client configured in `frontend/services/api.jsx` with `baseURL: "http://localhost:5000"`.

### 1.5 Response Handling
**Success (200):**
- Sets `summary` with `totalRecords`, `validRecords`, `invalidRecords` from response.
- Sets `records` array from `response.data.data`.
- Sets `currentPage = 1`.
- Displays green success message (auto-hides after 4 seconds).

**Error:**
- Displays red error message using `error.response?.data?.message` or `error.message`.
- Message auto-hides after 4 seconds.

---

## 2. Backend Processing

**Route:** `POST /api/upload` → `uploadController.uploadCSV`

### 2.1 Multer Middleware (`backend/src/config/multer.js`)
- Handles `multipart/form-data` parsing.
- Saves uploaded file to `uploads/` directory with timestamp prefix.
- **File filter:** Only `.csv` extensions allowed.
- **Size limit:** 10 MB maximum.

### 2.2 Controller — `uploadController.uploadCSV`

#### Step 1 — Parse CSV
```javascript
const csvData = await parseCSV(req.file.path);
// Uses csv-parser to read CSV into array of objects
// Each row becomes { columnName: value }
```

#### Step 2 — Clean Data
```javascript
const cleanedData = cleanCSVData(csvData);
// - Trims whitespace from all column names
// - Trims whitespace from all values
// - Removes rows where ALL values are empty strings
```

#### Step 3 — Validate Records
```javascript
const validationResult = validateCSVData(cleanedData);
// For each row:
//   - Finds email field (any column containing "email" case-insensitive)
//   - Finds mobile field (any column containing "mobile", "phone", or "contact")
//   - If BOTH email AND mobile are missing/empty → invalidRecords
//   - Otherwise → validRecords
//
// Returns: { validRecords: [...], invalidRecords: [...], totalRecords: N }
```

#### Step 4 — Create Batches
```javascript
const BATCH_SIZE = 10;
const batches = createBatches(validationResult.validRecords, 10);
// Splits validRecords into chunks of 10 for AI processing
```

#### Step 5 — AI Mapping (per batch)
```javascript
for (const batch of batches) {
    const mappedBatch = await mapCRMFields(batch);
    mappedData.push(...mappedBatch);
}
```
Each batch is sent to **Groq API** with the `llama-3.3-70b-versatile` model.
See Section 3 for AI prompt details.

#### Step 6 — Normalize Dates
```javascript
mappedData = mappedData.map((record) => ({
    ...record,
    created_at: formatCreatedAt(record.created_at)
}));
// Handles formats:
//   - DD/MM/YYYY → ISO 8601
//   - YYYY-MM-DD → ISO 8601
//   - YYYY-MM-DD HH:mm:ss → ISO 8601
```

#### Step 7 — Response
```javascript
// Success:
{
    success: true,
    message: "CSV mapped successfully",
    totalRecords: N,
    validRecords: N,
    invalidRecords: N,
    data: [ /* mapped records */ ]
}

// Error:
{
    success: false,
    message: "error description"
}
```

#### Step 8 — Cleanup
- Uploaded CSV file is deleted from disk via `fs.unlink()`.

---

## 3. AI Prompt & Mapping (Groq)

**Component:** `backend/src/services/aiService.js`  
**Model:** `llama-3.3-70b-versatile`  
**Temperature:** `0` (deterministic output)  
**Retries:** Up to 3 attempts with 3-second delay between failures.

### 3.1 Target Schema
Each record is mapped to this 15-field structure:

| Field | Description |
|-------|-------------|
| `created_at` | Original date value (normalized to ISO) |
| `name` | Customer/Full Name |
| `email` | Primary email address |
| `country_code` | Dialing code (e.g., +1, +91) |
| `mobile_without_country_code` | Phone number without country code |
| `company` | Organization/Business name |
| `city` | City name |
| `state` | State/Province |
| `country` | Country name |
| `lead_owner` | Sales person responsible |
| `crm_status` | AI-classified lead status |
| `crm_note` | Remarks, comments, extra contacts |
| `data_source` | Campaign/source identifier |
| `possession_time` | Visit/possession time |
| `description` | Extra details only |

### 3.2 Column Mapping Rules
AI intelligently maps similar column names:

| Input Column Examples | Target Field |
|----------------------|--------------|
| Customer Name, Full Name, Name | `name` |
| Email, Email Address, Primary Email | `email` |
| Phone, Mobile, Contact Number | `mobile_without_country_code` |
| Country Code | `country_code` |
| Organization, Company, Business Name | `company` |
| Town, City | `city` |
| Province, State | `state` |
| Nation, Country | `country` |
| Sales Person, Lead Owner, Owner | `lead_owner` |
| Created Date, Created At, Date | `created_at` |
| Visit Time, Time, Possession Time | `possession_time` |
| Extra Details, Description | `description` |
| Remarks, Notes, Comments | `crm_note` |

### 3.3 CRM Status Classification
AI determines status from remarks/comments/notes/description:

| Status | Triggers |
|--------|----------|
| `GOOD_LEAD_FOLLOW_UP` | interested, requested demo, wants pricing, follow up, reconnect later, schedule meeting, call again, positive response |
| `DID_NOT_CONNECT` | no answer, switched off, unreachable, busy, not connected, voicemail |
| `BAD_LEAD` | not interested, fake lead, wrong number, rejected, spam |
| `SALE_DONE` | deal closed, purchased, payment completed, onboarding completed, converted customer |

If unsure, returns empty string.

### 3.4 Data Source Rules
Allowed values (copied exactly from CSV if present, otherwise empty):
- `leads_on_demand`
- `meridian_tower`
- `eden_park`
- `varah_swamy`
- `sarjapur_plots`

### 3.5 CRM Note Handling
- Contains remarks, comments, follow-up notes.
- If multiple email addresses exist: first goes to `email`, rest appended in `crm_note`.
- If multiple mobile numbers exist: first goes to `mobile`, rest appended in `crm_note`.

---

## 4. Results Display (Frontend)

### 4.1 Summary Cards
**Component:** `frontend/components/SummaryCards.jsx`

Three cards displayed when `summary` is available:

| Card | Data Source | Color |
|------|-------------|-------|
| Total Records | `summary.totalRecords` | Blue |
| Valid Records | `summary.validRecords` | Green |
| Invalid Records | `summary.invalidRecords` | Red |

Each card shows title, value, and description. Cards have hover lift effect (`hover:-translate-y-1`).

### 4.2 Records Table
**Component:** `frontend/components/RecordsTable.jsx`

- Displays mapped records in a dark-themed table.
- Alternating row colors (`bg-gray-800` / `bg-gray-700`).
- **Columns:** `#`, `Created At`, `Name`, `Email`, `Mobile`, `Company`, `Status`, `Source`.
- **Status badges** use color-coded pills:
  - `GOOD_LEAD_FOLLOW_UP` → green
  - `SALE_DONE` → blue
  - `BAD_LEAD` → red
  - `DID_NOT_CONNECT` → yellow
  - Default → gray

### 4.3 Search
- Appears when records exist.
- Filters records by `name`, `email`, `company`, or `mobile_without_country_code` (case-insensitive).
- Resets pagination to page 1 on search.
- Shows "Showing X records" count.

### 4.4 Pagination
- 10 records per page.
- Shows "Previous" / "Page X / Y" / "Next" controls.
- Controls disabled at boundaries (`currentPage === 1` or `currentPage === totalPages`).

### 4.5 Download
- **Download CSV** button exports all mapped records as a CSV file (`crm_records.csv`).
- Button is disabled during upload processing.

---

## 5. Data Flow Summary

```
User drags/drops CSV
       │
       ▼
Frontend: handleDrop / handleFileChange → setFile(file)
       │
       ▼
User clicks "Upload & Map CSV"
       │
       ▼
Frontend: POST /api/upload (FormData with file)
       │
       ▼
Multer: saves CSV to uploads/ folder (filter: .csv, max: 10MB)
       │
       ▼
Controller: parseCSV() → array of row objects
       │
       ▼
Controller: cleanCSVData() → trim whitespace, remove empty rows
       │
       ▼
Controller: validateCSVData() → separate valid/invalid by email+mobile presence
       │
       ▼
Controller: createBatches(validRecords, 10) → chunks of 10
       │
       ▼
For each batch:
    └─ aiService.mapCRMFields(batch)
         └─ Groq API (Llama 3.3-70B) → mapped JSON array
         └─ Up to 3 retries with 3s delay
       │
       ▼
Controller: formatCreatedAt() → normalize dates to ISO
       │
       ▼
Controller: return JSON response with summary + mapped data
       │
       ▼
Controller: delete uploaded CSV file
       │
       ▼
Frontend: setSummary() + setRecords()
       │
       ▼
Display: SummaryCards + RecordsTable + Search + Pagination + Download
```

---

## 6. Key Technical Details

| Item | Value |
|------|-------|
| **Frontend Port** | 3000 (Next.js default) |
| **Backend Port** | 5000 |
| **AI Model** | `llama-3.3-70b-versatile` via Groq |
| **Batch Size** | 10 records per AI call |
| **Max Retries** | 3 per batch |
| **Max File Size** | 10 MB |
| **Allowed File** | `.csv` only |
| **Theme** | Dark mode (`bg-gray-900` body, `bg-gray-800` cards) |
| **File Cleanup** | CSV deleted from disk after processing |
