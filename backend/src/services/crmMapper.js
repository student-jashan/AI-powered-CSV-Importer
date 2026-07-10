const FIELD_ALIASES = {
  createdAt: ["created date", "created at", "date", "created_date", "created_at", "created"],
  name: ["name", "customer name", "full name", "first name", "customer_name", "full_name", "customer"],
  secondaryEmail: ["secondary email", "alternate email", "other email", "secondary_email", "alternate_email", "alt email", "email2", "email 2", "email_2", "personal email", "home email", "extra email", "cc email"],
  alternateMobile: ["alternate mobile", "alternate phone", "secondary phone", "other phone", "alternate_mobile", "alternate_phone", "alt phone", "alt mobile", "phone2", "phone 2", "phone_2", "mobile2", "mobile 2", "mobile_2", "home phone", "work phone", "extra mobile", "extra phone", "office phone"],
  countryCode: ["country code", "dial code", "phone code", "country_code", "dial_code", "phone_code", "area code", "code"],
  leadOwner: ["sales person", "lead owner", "owner", "sales_person", "lead_owner", "assigned to", "assignee", "representative", "rep"],
  source: ["source", "data source", "data_source", "lead source", "lead_source"],
  visitTime: ["visit time", "possession time", "time", "visit_time", "possession_time", "appointment"],
  description: ["extra details", "description", "customer summary", "extra_details", "summary", "notes", "additional info"],
  email: ["email", "email address", "primary email", "email_address", "primary_email", "e mail", "mail"],
  mobile: ["mobile", "phone", "contact number", "phone number", "contact", "mobile number", "contact_no", "mobile_no", "phone_no", "telephone", "tel", "cell", "cell number"],
  company: ["company", "organization", "business name", "business_name", "company_name", "firm", "employer"],
  city: ["city", "town", "location"],
  state: ["state", "province", "region"],
  country: ["country", "nation"],
  remarks: ["remarks", "notes", "comments", "remark", "note", "comment", "feedback"],
};

const ALLOWED_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
];

const CRM_STATUS_RULES = [
  {
    status: "SALE_DONE",
    keywords: ["deal closed", "purchased", "payment completed", "onboarding completed", "converted customer", "purchase", "payment received", "annual subscription", "contract signed"],
  },
  {
    status: "DID_NOT_CONNECT",
    keywords: ["no answer", "switched off", "unreachable", "busy", "not connected", "voicemail", "did not answer", "not answering"],
  },
  {
    status: "BAD_LEAD",
    keywords: ["not interested", "fake lead", "wrong number", "rejected", "spam", "do not call", "remove from campaign", "not interested right now"],
  },
  {
    status: "GOOD_LEAD_FOLLOW_UP",
    keywords: ["interested", "requested demo", "wants pricing", "follow up", "reconnect later", "schedule meeting", "call again", "positive response", "callback", "demo", "pricing", "quotation", "meeting", "follow-up", "followup"],
  },
];

const splitValues = (value) => {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "");
};

const cleanMobileStr = (value) => {
  return value.replace(/[\s\-\+\(\)]/g, "");
};

const isValidMobile = (value) => {
  if (!value) return false;
  const cleaned = cleanMobileStr(value);
  return /^\d{6,15}$/.test(cleaned);
};

const extractCountryCode = (value) => {
  if (!value || typeof value !== "string") return { countryCode: "", number: value || "" };
  const trimmed = value.trim();
  const match = trimmed.match(/^\+(\d{1,3})[\s\-]?(.*)/);
  if (match) {
    return { countryCode: `+${match[1]}`, number: match[2].trim() };
  }
  return { countryCode: "", number: trimmed };
};

const normalizeCountryCode = (code) => {
  if (!code) return "";
  const trimmed = code.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\s/g, "");
  if (/^\d{1,4}$/.test(digits)) return `+${digits}`;
  return trimmed;
};

const isEmail = (value) => {
  if (!value || typeof value !== "string") return false;
  const email = value.trim();
  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;
  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (!localPart || !domain) return false;
  if (localPart.includes(" ")) return false;
  if (localPart.startsWith(".") || localPart.includes("..")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (domain.includes("..") || domain.includes(" ")) return false;
  const dotIndex = domain.indexOf(".");
  if (dotIndex <= 0) return false;
  const tld = domain.slice(domain.lastIndexOf(".") + 1);
  if (tld.length < 2) return false;
  return true;
};

const validateMobileValue = (value) => {
  if (!value) return { type: "empty", cleaned: "" };
  if (isEmail(value)) return { type: "email", cleaned: value };
  const cleaned = cleanMobileStr(value);
  if (/^\d{6,15}$/.test(cleaned)) return { type: "mobile", cleaned };
  return { type: "invalid", cleaned: value };
};

const determineCRMStatus = (text) => {
  if (!text) return "";
  const lower = text.toLowerCase();
  for (const rule of CRM_STATUS_RULES) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        return rule.status;
      }
    }
  }
  return "";
};

const mapDataSource = (value) => {
  if (!value) return "";
  const lower = value.toLowerCase().trim();
  const match = ALLOWED_SOURCES.find((s) => lower.includes(s) || s.includes(lower));
  return match || "";
};

export const mapCRMFields = (records) => {
  if (records.length > 0) {
    console.log("CSV Columns Found:", Object.keys(records[0]));
  }

  const output = [];

  for (const row of records) {
    const pool = Object.fromEntries(
      Object.entries(row)
        .filter(([_, v]) => v && v.trim() !== "" && v.trim() !== "--")
        .map(([k, v]) => [k.toLowerCase().trim(), v.trim()])
    );

    const consume = (aliases, avoidIfContains = []) => {
      const sorted = [...aliases].sort((a, b) => b.length - a.length);

      const matchKey = (predicate) => {
        for (const alias of sorted) {
          const key = Object.keys(pool).find((k) => predicate(k, alias));
          if (key) return key;
        }
        return null;
      };

      let key = matchKey((k, alias) => k === alias);
      if (!key) key = matchKey((k, alias) => {
        if (!k.includes(alias)) return false;
        return !avoidIfContains.some((ex) => k.includes(ex));
      });
      if (!key) key = matchKey((k, alias) => k.includes(alias));

      if (key) {
        const value = pool[key];
        delete pool[key];
        return value;
      }

      return "";
    };

    const createdAt = consume(FIELD_ALIASES.createdAt);
    const name = consume(FIELD_ALIASES.name);
    const secondaryEmail = consume(FIELD_ALIASES.secondaryEmail, ["mobile", "phone"]);
    const alternateMobile = consume(FIELD_ALIASES.alternateMobile, ["email"]);
    const leadOwner = consume(FIELD_ALIASES.leadOwner);
    const source = consume(FIELD_ALIASES.source);
    const visitTime = consume(FIELD_ALIASES.visitTime);
    const description = consume(FIELD_ALIASES.description);
    const email = consume(FIELD_ALIASES.email, ["mobile", "phone"]);
    const mobile = consume(FIELD_ALIASES.mobile, ["email"]);
    const countryCodeField = consume(FIELD_ALIASES.countryCode);
    const company = consume(FIELD_ALIASES.company);
    const city = consume(FIELD_ALIASES.city);
    const state = consume(FIELD_ALIASES.state);
    const country = consume(FIELD_ALIASES.country);
    const remarks = consume(FIELD_ALIASES.remarks);

    let allEmails = [...splitValues(email), ...splitValues(secondaryEmail)];
    let allMobiles = [...splitValues(mobile), ...splitValues(alternateMobile)];

    // Extract country code from separated field or from first mobile number
    let countryCode = normalizeCountryCode(countryCodeField);
    if (!countryCode && allMobiles.length > 0) {
      const extracted = extractCountryCode(allMobiles[0]);
      if (extracted.countryCode) {
        countryCode = extracted.countryCode;
        allMobiles[0] = extracted.number;
      }
    }

    const recoveredEmails = [];
    const cleanedMobiles = [];

    allMobiles.forEach((m) => {
      const result = validateMobileValue(m);
      if (result.type === "email") {
        recoveredEmails.push(m);
      } else if (result.type === "mobile") {
        cleanedMobiles.push(result.cleaned);
      }
    });

    if (recoveredEmails.length > 0) {
      allEmails.push(...recoveredEmails);
    }

    allMobiles = cleanedMobiles;

    allEmails = allEmails.filter((e) => isEmail(e));

    const hasEmail = allEmails.length > 0;
    const hasMobile = allMobiles.length > 0;
    if (!hasEmail && !hasMobile) continue;

    const crmNoteParts = [];
    if (remarks) crmNoteParts.push(remarks);

    if (allEmails.length > 1) {
      crmNoteParts.push(`Extra Emails: ${allEmails.slice(1).join(", ")}`);
    }
    if (allMobiles.length > 1) {
      crmNoteParts.push(`Extra Mobiles: ${allMobiles.slice(1).join(", ")}`);
    }

    const statusText = remarks || description || "";
    const crmStatus = determineCRMStatus(statusText);

    const primaryMobile = allMobiles[0] || "";
    output.push({
      created_at: createdAt,
      name,
      email: allEmails[0] || "",
      country_code: "",
      mobile_without_country_code: countryCode ? `${countryCode}${primaryMobile}` : primaryMobile,
      company,
      city,
      state,
      country,
      lead_owner: leadOwner,
      crm_status: crmStatus || "",
      crm_note: crmNoteParts.join(" | "),
      data_source: mapDataSource(source),
      possession_time: visitTime,
      description,
    });
  }

  const skipped = records.length - output.length;
  if (skipped > 0) {
    console.log(`Skipped ${skipped} record(s) with no valid email or mobile`);
  }

  return { records: output, skippedCount: skipped };
};
