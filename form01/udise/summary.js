const scriptURL = 'https://script.google.com/macros/s/AKfycbxLCb71EVu0SHnRxugM2RF_22ZhppyoP5jngOT7en4fHNTLXJ_RggvAY4TRcG1ADXf2/exec';
const buttonContainer = document.getElementById('buttonContainer');
const tableContainer = document.getElementById('tableContainer');
const selectedValTitle = document.getElementById('selectedVal');
const loader = document.getElementById('loader');

// Fetch all data when the page loads
window.addEventListener('DOMContentLoaded', () => {
    loader.style.display = 'block';
    
    // Requesting all data. Ensure your Google Script handles 'action=getAll'
    fetch(`${scriptURL}?action=getAll`)
        .then(res => res.json())
        .then(response => {
            loader.style.display = 'none';
            // Expecting response format: { data: [ [row1], [row2], ... ] }
            if (response.data && Array.isArray(response.data)) {
                createButtons(response.data);
            } else {
                buttonContainer.innerText = "No data found or invalid response format.";
            }
        })
        .catch(err => {
            loader.style.display = 'none';
            buttonContainer.innerText = "Error loading data. Please check console.";
            console.error(err);
        });
});

function createButtons(rows) {
    // Column J is index 9 (0-based index: A=0, B=1, ... J=9)
    const colJIndex = 9;
    
    // Extract unique values from Column J, filtering out empty cells
    const uniqueValues = [...new Set(rows.map(r => r[colJIndex]).filter(v => v))];

    if (uniqueValues.length === 0) {
        buttonContainer.innerText = "No unique values found in Column J.";
        return;
    }

    uniqueValues.forEach(val => {
        const btn = document.createElement('button');
        btn.innerText = val;
        btn.addEventListener('click', () => showData(val, rows));
        buttonContainer.appendChild(btn);
    });
}

function showData(value, rows) {
    selectedValTitle.innerText = `Results for: ${value}`;
    
    // Filter rows where Column J (index 9) matches the clicked button value
    const filtered = rows.filter(r => r[9] === value);

    // Build table for Column A (0), Column B (1), and Column D (3)
    let html = `<table><thead><tr><th>Column A</th><th>Column B</th><th>Column D</th></tr></thead><tbody>`;

    filtered.forEach(r => {
        html += `<tr><td>${r[0] || ''}</td><td>${r[1] || ''}</td><td>${r[3] || ''}</td></tr>`;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}