const os = require("os");
const { exec } = require("child_process");
const crypto = require("crypto");

class PrinterService {
  constructor() {
    this.printerCache = {
      lastUpdate: null,
      data: [],
    };
    this.init(); // Call initialization on startup
  }

  generatePrinterID(printerInfo) {
    const data = Object.values(printerInfo).join("");
    return crypto.createHash("md5").update(data).digest("hex").substring(0, 8);
  }

  parseWindowsPrinters(output) {
    const printers = [];
    let currentPrinter = null;

    output.split("\n").forEach((line) => {
      line = line.trim();

      if (!line) {
        if (currentPrinter && Object.keys(currentPrinter).length > 0) {
          currentPrinter.id = this.generatePrinterID(currentPrinter);
          printers.push(currentPrinter);
          currentPrinter = null;
        }
        return;
      }

      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "");

        if (cleanKey === "name") {
          if (currentPrinter) {
            currentPrinter.id = this.generatePrinterID(currentPrinter);
            printers.push(currentPrinter);
          }
          currentPrinter = { name: value.trim() };
        } else if (currentPrinter) {
          currentPrinter[cleanKey] = value.trim();
        }
      }
    });

    if (currentPrinter && Object.keys(currentPrinter).length > 0) {
      currentPrinter.id = this.generatePrinterID(currentPrinter);
      printers.push(currentPrinter);
    }

    return printers;
  }

  parseLinuxPrinters(output) {
    const printers = [];
    const lines = output.split("\n");

    lines.forEach((line) => {
      if (line.startsWith("device for ")) {
        const name = line.split("device for ")[1].split(":")[0];
        const device = line.split(": ")[1];
        const printer = {
          name: name,
          device: device,
          system: "CUPS",
          timestamp: new Date().toISOString(),
        };
        printer.id = this.generatePrinterID(printer);
        printers.push(printer);
      }
    });

    return printers;
  }

  async getPrinters() {
    return new Promise((resolve) => {
      try {
        if (os.platform() === "win32") {
          const command =
            'powershell -command "Get-Printer | Select-Object Name, PrinterStatus, DriverName, PortName, PrintProcessor | Format-List"';

          exec(command, { encoding: "utf8" }, (error, stdout, stderr) => {
            if (error) {
              console.error("Error fetching printers:", error);
              resolve([]);
              return;
            }
            const printers = this.parseWindowsPrinters(stdout);
            resolve(printers);
          });
        } else {
          exec("lpstat -v", { encoding: "utf8" }, (error, stdout, stderr) => {
            if (error) {
              console.error("Error fetching printers:", error);
              resolve([]);
              return;
            }
            const printers = this.parseLinuxPrinters(stdout);
            resolve(printers);
          });
        }
      } catch (error) {
        console.error("Critical error in getPrinters:", error);
        resolve([]);
      }
    });
  }

  async init() {
    // console.log("Initializing printer service...");
    const printers = await this.getPrinters();
    this.updateCache(printers);
    // console.log("Printers loaded:", this.printerCache.data);
  }

  updateCache(printers) {
    this.printerCache.lastUpdate = new Date();
    this.printerCache.data = printers;
  }
}

module.exports = new PrinterService();
