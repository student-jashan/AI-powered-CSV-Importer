"use client";

import { useState, useRef } from "react";
import api from "@/services/api";
import SummaryCards from "./SummaryCards";
import RecordsTable from "./RecordsTable";
import PreviewTable from "./PreviewTable";
import { downloadCSV } from "@/utils/download";
import { parseCSVText } from "@/utils/csvParser";

export default function UploadSection() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState("upload"); // upload | preview | result

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const resetState = () => {
    setFile(null);
    setLoading(false);
    setLoadingStep("");
    setMessage("");
    setIsError(false);
    setStep("upload");
    setSummary(null);
    setRecords([]);
    setSearch("");
    setPreviewHeaders([]);
    setPreviewRows([]);
    setCurrentPage(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setMessage("");
      setIsError(false);
      setStep("upload");
      setSummary(null);
      setRecords([]);
      setPreviewHeaders([]);
      setPreviewRows([]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
      setMessage("");
      setIsError(false);
      setStep("upload");
      setSummary(null);
      setRecords([]);
      setPreviewHeaders([]);
      setPreviewRows([]);
    } else {
      setMessage("Please drop a valid .csv file.");
      setIsError(true);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }

    try {
      setMessage("");
      setIsError(false);

      const text = await file.text();
      const { headers, rows } = parseCSVText(text);

      if (headers.length === 0) {
        setMessage("Could not parse CSV headers.");
        setIsError(true);
        return;
      }

      setPreviewHeaders(headers);
      setPreviewRows(rows);
      setStep("preview");
    } catch (err) {
      setMessage("Failed to read CSV file.");
      setIsError(true);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      setLoadingStep("Uploading CSV...");
      await sleep(300);

      setLoadingStep("Parsing CSV...");
      await sleep(300);

      setLoadingStep("Cleaning Data...");
      await sleep(300);

      setLoadingStep("Validating Records...");
      await sleep(300);

      setLoadingStep("Mapping Records...");

      const response = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setLoadingStep("Preparing Results...");
      await sleep(400);

      setSummary({
        totalRecords: response.data.totalRecords,
        validRecords: response.data.validRecords,
        invalidRecords: response.data.invalidRecords,
        mappingSkipped: response.data.mappingSkipped,
        importedRecords: response.data.data.length,
      });

      setRecords(response.data.data);
      setCurrentPage(1);
      setStep("result");
      setLoadingStep("Upload Completed");
      setMessage(response.data.message);
      setIsError(false);

      setTimeout(() => {
        setLoadingStep("");
        setMessage("");
        setIsError(false);
      }, 4000);
    } catch (error) {
      console.error(error);

      setLoadingStep("");

      const errorMessage =
        error.response?.data?.message || error.message;

      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetState();
  };

  const filteredRecords = records.filter((record) => {
    const keyword = search.toLowerCase();
    return (
      (record.name || "").toLowerCase().includes(keyword) ||
      (record.email || "").toLowerCase().includes(keyword) ||
      (record.company || "").toLowerCase().includes(keyword) ||
      (record.mobile_without_country_code || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <div className="bg-gray-800 text-gray-100 shadow rounded-xl p-6 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-100">
          CRM CSV Importer
        </h2>
        <p className="text-gray-400 mt-2">
          Upload a CSV file, preview the data, and import it into the CRM format.
        </p>
      </div>

      {step === "result" && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition"
          >
            Upload New File
          </button>
        </div>
      )}

      {/* Step 1: Upload */}
      {(step === "upload" || step === "preview") && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-colors ${
              dragOver
                ? "border-green-500 bg-gray-600"
                : "border-blue-700 bg-gray-700"
            }`}
          >
            <div className="text-6xl mb-3"></div>
            <h3 className="text-xl font-bold text-gray-100">Upload CRM CSV File</h3>
            <p className="text-gray-400 mt-2">
              {dragOver
                ? "Drop your file here..."
                : "Upload a CSV file to clean, validate and map CRM records."}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-6"
            />
            <p className="text-sm text-gray-400 mt-3">
              Supported: CSV &bull; Maximum Size: 10 MB
            </p>
            {file && (
              <div className="mt-5 inline-block bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 shadow">
                <strong>Selected:</strong> {file.name}
              </div>
            )}
          </div>

          {step === "upload" && file && (
            <div className="flex justify-center">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 transition"
              >
                Preview CSV
              </button>
            </div>
          )}

          {step === "preview" && (
            <>
              <PreviewTable headers={previewHeaders} rows={previewRows} />

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition disabled:opacity-50"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>Confirm Import</>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {loading && (
        <div className="mt-6 rounded-xl border border-blue-700 bg-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-semibold text-blue-300">{loadingStep}</p>
              <p className="text-sm text-gray-400">Please wait while the backend processes your CSV...</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Result messages */}
      {message && (
        <div
          className={`mt-6 rounded-xl border p-4 ${
            isError
              ? "bg-red-900/30 border-red-700 text-red-300"
              : "bg-green-900/30 border-green-700 text-green-300"
          }`}
        >
          {message}
        </div>
      )}

      <SummaryCards summary={summary} />

      {records.length > 0 && step === "result" && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Search CRM Records</h3>
            <p className="text-gray-400">Showing {filteredRecords.length} records</p>
          </div>
          <input
            type="text"
            placeholder="Search by Name, Email, Company or Mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      <RecordsTable records={currentRecords} />

      {records.length > 0 && step === "result" && (
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={() => downloadCSV(records)}
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download CSV
          </button>
        </div>
      )}

      {filteredRecords.length > recordsPerPage && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
