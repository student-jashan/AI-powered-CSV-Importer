const EMAIL_ALIASES = ["email", "email address", "primary email", "email_address", "primary_email", "e mail", "mail"];

const MOBILE_ALIASES = ["mobile", "phone", "contact number", "phone number", "contact", "mobile number", "contact_no", "mobile_no", "phone_no", "telephone", "tel", "cell", "cell number"];

const isEmpty = (value) => {
  return !value || value.trim() === "" || value.trim() === "--";
};

const findField = (row, aliases) => {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const key = keys.find((k) => k.toLowerCase().trim() === alias);
    if (key) return row[key];
  }
  for (const alias of aliases) {
    const key = keys.find((k) => k.toLowerCase().trim().includes(alias) || alias.includes(k.toLowerCase().trim()));
    if (key) return row[key];
  }
  return "";
};

export const validateCSVData = (rows) => {

    let validRecords = [];
    let invalidRecords = [];

    rows.forEach((row) => {

        // Check if row has any data
        const hasData = Object.values(row).some(
            (value) => value !== "" && value !== "--"
        );

        if (!hasData) {
            invalidRecords.push(row);
            return;
        }

        // Find email and mobile fields using same aliases as crmMapper
        const email = findField(row, EMAIL_ALIASES);
        const mobile = findField(row, MOBILE_ALIASES);

        // Skip if BOTH email and mobile are missing
        if (isEmpty(email) && isEmpty(mobile)) {

            invalidRecords.push(row);

        } else {

            validRecords.push(row);

        }

    });

    return {

        validRecords,

        invalidRecords,

        totalRecords: rows.length

    };

};