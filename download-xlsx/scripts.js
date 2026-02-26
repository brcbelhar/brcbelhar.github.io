// ===== CONFIGURATION =====
const scriptURL = 'https://script.google.com/macros/s/AKfycbyUqIzVwEFLHzjGBcgLvVVlr8sZ5id3uEEJr-doim7nLMOpM7vl8rucIybUjr-8FfRT/exec';
// For development only – set to true to use a CORS proxy (not for production)
const USE_CORS_PROXY = false;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; // public proxy, may be rate-limited

// ===== DOM Elements =====
const loader = document.getElementById('loader');
const statusEl = document.getElementById('statusMessage');

// ===== Helper Functions =====
function showLoader(show) {
    loader.style.display = show ? 'flex' : 'none';
}

// Convert array of objects to CSV
function jsonToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(',')); // header row
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] || '';
            return `"${val.toString().replace(/"/g, '""')}"`; // escape double quotes
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

// Trigger file download
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ===== Main Download Function =====
async function downloadAllData() {
    showLoader(true);
    statusEl.innerText = 'Fetching data...';

    // Build fetch URL (optionally with CORS proxy)
    let url = `${scriptURL}?action=readAll`;
    if (USE_CORS_PROXY) {
        url = CORS_PROXY + url;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors', // explicitly request CORS
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            statusEl.innerText = 'No data found.';
            alert('No records to download.');
            return;
        }

        const csv = jsonToCSV(data);
        downloadCSV(csv, 'teachers_data.csv');
        statusEl.innerText = 'Download complete.';
    } catch (error) {
        console.error('Download error:', error);
        statusEl.innerText = 'Error downloading data.';

        // CORS error detection (heuristic)
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            alert(
                'CORS error: The server does not allow requests from this origin.\n\n' +
                'To fix this:\n' +
                '1. Modify your Google Apps Script to include the header:\n' +
                '   ContentService.createTextOutput(JSON.stringify(data))\n' +
                '     .setMimeType(ContentService.MimeType.JSON)\n' +
                '     .setHeader("Access-Control-Allow-Origin", "*");\n' +
                '2. Or for testing only, set USE_CORS_PROXY = true in scripts.js\n' +
                '   (uses a public proxy, not for production).'
            );
        } else {
            alert('Failed to download data. Check console for details.');
        }
    } finally {
        showLoader(false);
    }
}

// ===== Event Listener =====
document.getElementById('downloadExcelBtn').addEventListener('click', downloadAllData);