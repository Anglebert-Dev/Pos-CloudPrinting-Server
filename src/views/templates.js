// src/views/templates.js

const renderPrinterInfo = (printers, lastUpdate) => {
  return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Printer Information</title>
                <style>
                    body { 
                        font-family: Arial; 
                        margin: 40px; 
                        line-height: 1.6; 
                    }
                    .info { 
                        background: #f0f0f0; 
                        padding: 20px; 
                        border-radius: 5px; 
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                    }
                    .printer-card { 
                        background: white; 
                        padding: 15px; 
                        margin: 10px 0; 
                        border-radius: 5px; 
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
                    }
                    .printer-id { 
                        color: #666; 
                        font-family: monospace; 
                    }
                    .error { 
                        color: #dc3545; 
                    }
                    .timestamp { 
                        color: #666; 
                        font-size: 0.9em; 
                    }
                    .api-info {
                        background: #e9ecef;
                        padding: 15px;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    code {
                        background: #f8f9fa;
                        padding: 2px 5px;
                        border-radius: 3px;
                    }
                </style>
            </head>
            <body>
                <div class="info">
                    <h1>Printer Information</h1>
                    <p class="timestamp">Last Updated: ${lastUpdate.toLocaleString()}</p>
                    ${
                      printers
                        ? printers
                            .map(
                              (printer) => `
                            <div class="printer-card">
                                <h3>${
                                  printer.name
                                } <span class="printer-id">(ID: ${
                                printer.id
                              })</span></h3>
                                <pre>${JSON.stringify(printer, null, 2)}</pre>
                            </div>
                        `
                            )
                            .join("")
                        : `<div class="error">
                            <p>No printer information available</p>
                            <p>Please check your connection and try again later.</p>
                        </div>`
                    }
                    <div class="api-info">
                        <h3>API Status</h3>
                        <p>Connection Status: <code>${
                          printers ? "Connected" : "Disconnected"
                        }</code></p>
                    </div>
                </div>
            </body>
        </html>
    `;
};

module.exports = { renderPrinterInfo };
