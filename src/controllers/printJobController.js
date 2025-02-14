const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const printJobService = require("../services/printJobService");
const printerService = require("../services/printerService");
const config = require("../config");

async function submitPrintJob(req, res) {
  const printerId = req.url.split("/api/print/")[1];

  // Debugging logs
  console.log("Received request for printer ID:", printerId);
  console.log("Current Printer Cache:", printerService.printerCache.data);

  // Verify printer exists
  const printerExists = printerService.printerCache.data.some(
    (p) =>
      p.name.toLowerCase() === printerId.toLowerCase() ||
      p.id.toLowerCase() === printerId.toLowerCase()
  );

  if (!printerExists) {
    return {
      status: 404,
      data: { error: "Printer not found" },
    };
  }

  // Ensure uploads directory exists
  if (!fs.existsSync(config.uploadPath)) {
    fs.mkdirSync(config.uploadPath, { recursive: true });
  }

  const form = new formidable.IncomingForm({
    uploadDir: config.uploadPath,
    keepExtensions: true,
    maxFileSize: config.maxFileSize,
  });

  try {
    // Correct way to use `form.parse()`
    const result = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = result.files.document;

    // Debugging logs
    console.log("Uploaded files:", result.files);

    if (!file) {
      return {
        status: 400,
        data: { error: "No document provided" },
      };
    }

    // Handle single and multiple file uploads
    const uploadedFile = Array.isArray(file) ? file[0] : file;

    // Validate file type
    const ext = path.extname(uploadedFile.originalFilename).toLowerCase();
    if (!config.allowedFileTypes.includes(ext)) {
      // Clean up invalid file
      fs.unlink(uploadedFile.filepath, () => {});
      return {
        status: 400,
        data: { error: "Unsupported file type" },
      };
    }

    const jobInfo = await printJobService.handlePrintJob(
      printerId,
      uploadedFile.filepath,
      uploadedFile.originalFilename
    );

    return {
      status: 200,
      data: jobInfo,
    };
  } catch (error) {
    console.error("Print job error:", error);
    return {
      status: 500,
      data: {
        error: "Print job failed",
        details: error.message,
      },
    };
  }
}

function getJobStatus(req, res) {
  const jobId = req.url.split("/api/job/")[1];
  const job = printJobService.getJob(jobId);

  if (!job) {
    return {
      status: 404,
      data: { error: "Job not found" },
    };
  }

  return {
    status: 200,
    data: job,
  };
}

function getAllJobs(req, res) {
  // Clean up old jobs before returning the list
  printJobService.cleanupOldJobs();
  const jobs = printJobService.getAllJobs();
  return {
    status: 200,
    data: jobs,
  };
}

module.exports = { submitPrintJob, getJobStatus, getAllJobs };
