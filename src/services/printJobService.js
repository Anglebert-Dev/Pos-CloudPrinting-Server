const crypto = require("crypto");
const os = require("os");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config");
const printerService = require("./printerService");

class PrintJobService {
  constructor() {
    this.jobs = new Map();
  }

  generateJobId() {
    return crypto.randomBytes(4).toString("hex");
  }

  async handlePrintJob(printerId, filePath, originalFilename) {
    const jobId = this.generateJobId();

    // Retrieve printer details using printerId
    const printer = printerService.printerCache.data.find(
      (p) => p.id.toLowerCase() === printerId.toLowerCase()
    );
    if (!printer) {
      throw new Error("Invalid printer ID");
    }
    const printerName = printer.name;

    const job = {
      id: jobId,
      printerId,
      printerName,
      filename: originalFilename,
      status: "processing",
      submittedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    try {
      let command;
      if (os.platform() === "win32") {
        command = `powershell -command \"Get-Content '${filePath}' | Out-Printer '${printerName}'\"`;
      } else {
        command = `lp -d \"${printerName}\" \"${filePath}\"`;
      }

      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          // Clean up the temporary file after printing
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting temporary file:", err);
          });

          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        });
      });

      job.status = "completed";
      job.completedAt = new Date().toISOString();
      return job;
    } catch (error) {
      job.status = "failed";
      job.error = error.message;
      throw error;
    }
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getAllJobs() {
    return Array.from(this.jobs.values());
  }

  cleanupOldJobs() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [jobId, job] of this.jobs.entries()) {
      if (
        job.status !== "processing" &&
        new Date(job.submittedAt).getTime() < oneHourAgo
      ) {
        this.jobs.delete(jobId);
      }
    }
  }
}

module.exports = new PrintJobService();
