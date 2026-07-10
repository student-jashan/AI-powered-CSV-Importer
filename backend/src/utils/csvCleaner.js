export const cleanCSVData = (rows) => {

    return rows
        .map((row) => {

            const cleanedRow = {};

            for (const key in row) {

                // Remove extra spaces from column names
                const cleanedKey = key.trim();

                // Remove extra spaces from values
                const cleanedValue =
                    typeof row[key] === "string"
                        ? row[key].trim()
                        : row[key];

                cleanedRow[cleanedKey] = cleanedValue;
            }

            return cleanedRow;
        })

        // Remove completely empty rows
        .filter((row) =>
            Object.values(row).some(
                (value) => value !== ""
            )
        );
};