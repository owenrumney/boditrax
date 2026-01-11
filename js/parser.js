/**
 * Boditrax CSV Parser
 * 
 * Handles parsing the specific multi-section CSV format exported from Boditrax.
 */

export class BoditraxParser {
    constructor() {
        this.reset();
    }

    reset() {
        this.userDetails = null;
        this.physiqueDetails = null;
        this.scans = [];
        this.availableMetrics = new Set();
    }

    /**
     * Parse the raw CSV string
     * @param {string} csvString 
     * @returns {Object} Parsed data containing userDetails, physiqueDetails, and scans
     */
    parse(csvString) {
        this.reset();
        console.log('Starting parse of CSV string (length:', csvString.length, ')');
        
        const cleanCSV = csvString.replace(/^\uFEFF/, '').trim();
        const lines = cleanCSV.split(/\r?\n/).map(l => l.trim());
        
        let currentSection = '';
        let headers = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (!line) continue;

            const lowerLine = line.toLowerCase();

            // Section detection - case insensitive and startsWith
            if (lowerLine.startsWith('user details')) {
                currentSection = 'userDetails';
                if (i + 1 < lines.length) {
                    headers = lines[++i].split(',').map(h => h.trim());
                    console.log('Found User Details headers:', headers);
                }
                continue;
            } else if (lowerLine.startsWith('user physique details')) {
                currentSection = 'physiqueDetails';
                if (i + 1 < lines.length) {
                    headers = lines[++i].split(',').map(h => h.trim());
                }
                continue;
            } else if (lowerLine.startsWith('user scan details')) {
                currentSection = 'scanDetails';
                if (i + 1 < lines.length) {
                    headers = lines[++i].split(',').map(h => h.trim());
                    console.log('Found Scan Details headers:', headers);
                }
                continue;
            } else if (lowerLine.includes('login details') || lowerLine.startsWith('username,ipaddress')) {
                currentSection = 'ignored';
                continue;
            }

            if (!currentSection || currentSection === 'ignored') continue;
            
            try {
                const values = this.parseCSVLine(line);
                
                if (currentSection === 'userDetails') {
                    this.userDetails = this.mapToHeaders(headers, values);
                } else if (currentSection === 'physiqueDetails') {
                    this.physiqueDetails = this.mapToHeaders(headers, values);
                } else if (currentSection === 'scanDetails') {
                    const row = this.mapToHeaders(headers, values);
                    this.processScanRow(row);
                }
            } catch (err) {
                console.warn(`Error parsing line ${i} in section ${currentSection}:`, err);
            }
        }

        const scanArray = this.finalizeScans();
        console.log(`Parse complete. Found ${scanArray.length} scans.`);

        return {
            userDetails: this.userDetails,
            physiqueDetails: this.physiqueDetails,
            scans: scanArray,
            metrics: Array.from(this.availableMetrics)
        };
    }

    /**
     * Robust CSV line parser handles quoted values and special characters
     */
    parseCSVLine(line) {
        const result = [];
        let curValue = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(curValue.trim());
                curValue = '';
            } else {
                curValue += char;
            }
        }
        result.push(curValue.trim());
        return result;
    }

    mapToHeaders(headers, values) {
        if (!headers || !headers.length) return {};
        
        const obj = {};
        // Special case for Boditrax "FirstName LastName" header mismatch with 2 columns
        let vIndex = 0;
        headers.forEach((h) => {
            if (h === 'FirstName LastName' && values.length > headers.length) {
                obj[h] = `${values[vIndex] || ''} ${values[vIndex + 1] || ''}`.trim();
                vIndex += 2;
            } else if (values[vIndex] !== undefined) {
                obj[h] = values[vIndex];
                vIndex++;
            }
        });
        return obj;
    }

    processScanRow(row) {
        const { BodyMetricTypeId, Value, CreatedDate } = row;
        if (!BodyMetricTypeId || !CreatedDate) return;

        const date = this.parseDate(CreatedDate);
        if (isNaN(date.getTime())) return; // Skip rows with invalid dates

        const dateKey = CreatedDate; 
        if (!this.tempScans) this.tempScans = {};
        if (!this.tempScans[dateKey]) {
            this.tempScans[dateKey] = {
                date: date,
                rawDate: CreatedDate
            };
        }

        const numericValue = parseFloat(Value);
        this.tempScans[dateKey][BodyMetricTypeId] = isNaN(numericValue) ? Value : numericValue;
        this.availableMetrics.add(BodyMetricTypeId);
    }

    finalizeScans() {
        if (!this.tempScans) return [];
        
        const finalized = Object.values(this.tempScans)
            .filter(s => s.date && !isNaN(s.date.getTime()))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        delete this.tempScans;
        return finalized;
    }

    /**
     * Parses the Boditrax date format: M/D/YYYY H:MM:SS AM/PM
     * Handles the narrow no-break space sometimes found in exports
     */
    parseDate(dateString) {
        // Replace non-standard spaces if any
        const cleanDate = dateString.replace(/[\u202F\u00A0]/g, ' ');
        return new Date(cleanDate);
    }
}
