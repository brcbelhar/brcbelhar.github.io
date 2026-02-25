const scriptURL = 'https://script.google.com/macros/s/AKfycbyUqIzVwEFLHzjGBcgLvVVlr8sZ5id3uEEJr-doim7nLMOpM7vl8rucIybUjr-8FfRT/exec';
const form = document.getElementById('searchForm');
const resultsDiv = document.getElementById('results');
const loaderOverlay = document.getElementById('loaderOverlay');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const udise = document.getElementById('udiseInput').value.trim();
    resultsDiv.innerHTML = ''; // Clear previous results

    // Basic validation: 11-digit number (adjust pattern if needed)
    if (!/^\d{11}$/.test(udise)) {
        resultsDiv.textContent = 'Please enter a valid 11‑digit UDISE code.';
        return;
    }

    // Show loader
    loaderOverlay.style.display = 'flex';

    try {
        const response = await fetch(`${scriptURL}?action=readByUDISE&udise=${udise}`);
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.result === 'found' && Array.isArray(data.rows) && data.rows.length) {
            // Create a container with the result-list class for styling
            const container = document.createElement('div');
            container.className = 'result-list';

            const list = document.createElement('ul');
            data.rows.forEach(row => {
                const li = document.createElement('li');
                // Use textContent to avoid XSS – row[1] = name, row[2] = other info
                const strong = document.createElement('strong');
                strong.textContent = row[1] || 'Unknown';
                li.appendChild(strong);
                li.appendChild(document.createTextNode(` ${row[2] || ''}`));
                list.appendChild(li);
            });

            container.appendChild(list);
            resultsDiv.appendChild(container);
        } else {
            resultsDiv.textContent = 'No teacher data found for the entered UDISE.';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        resultsDiv.textContent = `Error: ${error.message}`;
    } finally {
        // Hide loader
        loaderOverlay.style.display = 'none';
    }
});