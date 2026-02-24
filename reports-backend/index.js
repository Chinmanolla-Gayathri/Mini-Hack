const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const upload = multer();
const cors = require("cors");
require("dotenv").config();

const IQNorm = require("./models/tqNorms");
const iqNormRoutes = require("./routes/tqRoutes");
const validateRawScoreRoutes = require("./routes/validateRawScore");
const classifyTQ = require("./helpers/tqClassifier");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Hardcoded or ENV connection logic
mongoose
  .connect(process.env.MONGO_URI ? process.env.MONGO_URI.trim() : "mongodb://localhost:27017/internHack")
  .then(() => console.log("✅ MongoDB connected via ENV"))
  .catch((err) => console.error("❌ Mongo error:", err));

const normalize = (v) => {
  const s = (v ?? "").toString().trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower === "undefined" || lower === "null") return "";
  return s;
};

const getPronouns = (gender, overrides = {}) => {
  const o = overrides || {};
  return {
    he_she: o.he_she || (gender === "female" ? "she" : gender === "other" ? "they" : "he"),
    him_her: o.him_her || (gender === "female" ? "her" : gender === "other" ? "them" : "him"),
    his_her: o.his_her || (gender === "female" ? "her" : gender === "other" ? "their" : "his"),
  };
};

// Helper for Requirement 7: Consistent Updated Terminology
const getUpdatedLevel = (score) => {
  if (!score) return "N/A";
  const classification = classifyTQ(Number(score));
  let level = classification.old; // Adjust this in your tqClassifier helper if possible

  // Requirement 7 Mapping
  if (level === "Low performance") return "Low level of intelligence";
  if (level === "Average of performance") return "Average level of intelligence";
  if (level.includes("Borderline")) return "Borderline level of intellectual functioning";

  return level;
};

const buildReplacements = (body) => {
  const gender = (body.gender || "").toLowerCase();
  const pronouns = getPronouns(gender, body);

  // Requirement 1 & 2: Handling "Other" choices
  const finalInformant = body.informant === "Other" ? body.otherInformant : body.informant;
  const finalSchool = body.school === "Other" ? body.otherSchool : body.school;

  return {
    "«Name»": body.name || "",
    "«Gender»": body.gender || "",
    "«Date_of_Testing»": body.dateOfTesting || "",
    "«Class»": body.class || "",
    "«Date_of_Birth»": body.dob || "",
    "«Informant»": finalInformant || "",
    "«Age»": body.age || "",
    "«School_Name»": finalSchool || "",
    "«Tests_Administered»": body.testsadministered || "",
    "«Other_Test»": body.otherTest || "",
    "«Verbal_quotient»": body.verbalQuotient || "",

    // Scores and Updated Terminology (Req 7)
    "«Information»": normalize(body.Information) || "N/A",
    "«Information_Level»": getUpdatedLevel(body.Information),
    "«Comprehension»": normalize(body.Comprehension) || "N/A",
    "«Comprehension_Level»": getUpdatedLevel(body.Comprehension),
    "«Arithmetic»": normalize(body.Arithmetic) || "N/A",
    "«Arithmetic_Level»": getUpdatedLevel(body.Arithmetic),
    "«Similarities»": normalize(body.Similarities) || "N/A",
    "«Similarities_Level»": getUpdatedLevel(body.Similarities),
    "«DigitVocabScore»": normalize(body.Vocabulary || body.DigitSpan) || "N/A",
    "«DigitVocabLabel»": body.verbalChoice === "vocabulary" ? "Vocabulary" : "Digit Span",
    "«Digit_Span_Level»": getUpdatedLevel(body.Vocabulary || body.DigitSpan),

    "«Picture_Completion»": normalize(body.Picture_Completion) || "N/A",
    "«Picture_Completion_Level»": getUpdatedLevel(body.Picture_Completion),
    "«Block_Design»": normalize(body.Block_Design) || "N/A",
    "«Block_Design_Level»": getUpdatedLevel(body.Block_Design),
    "«Object_Assembly»": normalize(body.Object_Assembly) || "N/A",
    "«Object_Assembly_Level»": getUpdatedLevel(body.Object_Assembly),
    "«Coding»": normalize(body.Coding) || "N/A",
    "«Coding_Level»": getUpdatedLevel(body.Coding),
    "«Mazes»": normalize(body.Mazes) || "N/A",
    "«Mazes_Level»": getUpdatedLevel(body.Mazes),

    "«suggests»": getUpdatedLevel(body.verbalQuotient),
    "«Points»": Math.abs(Number(body.performanceQuotient || 0) - Number(body.verbalQuotient || 0)),
    "«Overall_Level»": getUpdatedLevel(body.overallQuotient),
    "«performance_quotient_Level»": getUpdatedLevel(body.performanceQuotient),

    // Requirement 6: Display Rules (Ensure raw totals are handled/omitted in template)
    "«Overall_Quotient»": normalize(body.overallQuotient) || "",
    "«performance_quotient»": normalize(body.performanceQuotient) || "",

    // Requirement 5 & 8: NIMHANS Display & Summary
    "«nimhans_display»": body.showNimhans === "true" || body.showNimhans === true ? "block" : "none",
    "«Summery»": body.summary || "",
    "«Recomodations»": body.recommend1 || "",
    "«Recomodations_2»": body.recommend2 || "",
    "«Recomodations_3»": body.recommend3 || "",
    "«Final_Level»": getUpdatedLevel(body.overallQuotient),

    // Pronouns
    "«he_she»": pronouns.he_she,
    "«him_her»": pronouns.him_her,
    "«his_her»": pronouns.his_her,
  };
};

// --- Routes ---

app.use("/report_template", express.static(path.join(__dirname, "template")));

app.post("/generate-preview", upload.none(), (req, res) => {
  try {
    const templatePath = path.join(__dirname, "template", "complete_report.html");
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    const replacements = buildReplacements(req.body);

    for (const key in replacements) {
      htmlContent = htmlContent.replace(new RegExp(key, "g"), replacements[key]);
    }
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send("Error generating preview");
  }
});

app.post("/download-preview-pdf", upload.none(), async (req, res) => {
  try {
    const templatePath = path.join(__dirname, "template", "complete_report.html");
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    const replacements = buildReplacements(req.body);

    for (const key in replacements) {
      htmlContent = htmlContent.replace(new RegExp(key, "g"), replacements[key]);
    }

    const isWindows = process.platform === "win32";
    let execPath = null;
    if (isWindows) {
      execPath = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
    } else {
      execPath = await chromium.executablePath();
    }

    const browser = await puppeteer.launch({
      args: isWindows ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args,
      executablePath: execPath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=Clinical_Report.pdf",
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send("Failed to generate PDF: " + error.message);
  }
});

// Requirement 11: BONUS - Convert to DOC file
app.post("/download-preview-doc", upload.none(), (req, res) => {
  try {
    const templatePath = path.join(__dirname, "template", "complete_report.html");
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    const replacements = buildReplacements(req.body);

    for (const key in replacements) {
      htmlContent = htmlContent.replace(new RegExp(key, "g"), replacements[key]);
    }

    // Word can read HTML if structured with correct headers
    const docHeader = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head><body>
    `;
    const docFooter = "</body></html>";
    const fullDocContent = docHeader + htmlContent + docFooter;

    res.set({
      "Content-Type": "application/msword",
      "Content-Disposition": "attachment; filename=Clinical_Report.doc",
    });
    res.send(fullDocContent);
  } catch (error) {
    res.status(500).send("Failed to generate DOC: " + error.message);
  }
});

app.use("/api", iqNormRoutes);
app.use("/api", validateRawScoreRoutes);

app.listen(8000, () => console.log("🚀 Server running on port 8000"));