import fs from "fs";
import { parseCSV } from "../services/csvService.js";
import { cleanCSVData } from "../utils/csvCleaner.js";
import { validateCSVData } from "../utils/validation.js";
import { mapCRMFields as aiMapCRMFields } from "../services/aiService.js";
import { mapCRMFields as deterministicMapCRMFields } from "../services/crmMapper.js";
import { createBatches } from "../utils/batchHelper.js";
import { formatCreatedAt } from "../utils/dateFormatter.js";

export const uploadCSV = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No CSV uploaded"
            });

        }

        // Parse CSV
        const csvData = await parseCSV(req.file.path);

        // Clean CSV
        const cleanedData = cleanCSVData(csvData);

        // Validate CSV
        const validationResult = validateCSVData(cleanedData);

        // Debug Logs
        console.log("====================================");
        console.log("Total Records   :", validationResult.totalRecords);
        console.log("Valid Records   :", validationResult.validRecords.length);
        console.log("Invalid Records :", validationResult.invalidRecords.length);
        console.log("====================================");

        console.log("Mapping records with AI...");

        const BATCH_SIZE = 10;
        const batches = createBatches(validationResult.validRecords, BATCH_SIZE);
        const mappedData = [];
        let mappingSkipped = 0;
        let aiBatchesSucceeded = 0;
        let aiBatchesFailed = 0;

        console.log(`Processing ${batches.length} batch(es) with AI...`);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`Batch ${i + 1}/${batches.length} (${batch.length} records)`);

            try {
                const aiResult = await aiMapCRMFields(batch);
                mappedData.push(...aiResult);
                aiBatchesSucceeded++;
                console.log(`Batch ${i + 1} mapped successfully by AI`);
            } catch (error) {
                console.error(`AI mapping failed for batch ${i + 1}, using deterministic fallback:`, error.message);
                const { records, skippedCount } = deterministicMapCRMFields(batch);
                mappedData.push(...records);
                mappingSkipped += skippedCount;
                aiBatchesFailed++;
                console.log(`Batch ${i + 1} mapped via fallback (${records.length} records, ${skippedCount} skipped)`);
            }
        }

        console.log(`AI Succeeded: ${aiBatchesSucceeded}, Fallback: ${aiBatchesFailed}, Total mapped: ${mappedData.length}`);

        // Normalize created_at field
        const finalData = mappedData.map((record) => ({

            ...record,

            created_at: formatCreatedAt(record.created_at)

        }));

        console.log("====================================");
        console.log("Processing Completed");
        console.log("Total Mapped Records :", finalData.length);
        console.log("====================================");

        return res.status(200).json({

            success: true,

            message: "CSV mapped successfully",

            totalRecords: validationResult.totalRecords,

            validRecords: validationResult.validRecords.length,

            invalidRecords: validationResult.invalidRecords.length,

            mappingSkipped,

            data: finalData

        });

    } catch (error) {

        console.error("Upload Error:", error.message);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    } finally {

        // Delete uploaded CSV file after processing
        if (req.file) {

            fs.unlink(req.file.path, (err) => {

                if (err) {

                    console.error("Failed to delete uploaded CSV:", err.message);

                } else {

                    console.log("Uploaded CSV deleted successfully.");

                }

            });

        }

    }

};