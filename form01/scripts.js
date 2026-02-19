const scriptURL = 'https://script.google.com/macros/s/AKfycbwryzOsBQioofy2Ls91Vcg6ADGx1pGoH2_w7OBpRR7Yww0iXFdyI8eCWAf23gWXTijj/exec';
const form = document.getElementById('dataForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('statusMessage');
const loader = document.getElementById('loader');
const popup = document.getElementById('successPopup');
const closePopupBtn = document.getElementById('closePopupBtn');
const popupTitle = popup.querySelector('h3');
const popupMessage = popup.querySelector('p');

// Search by Aadhaar
function searchData() {
    const adhaar = document.getElementById('searchAdhaar').value;
    if (adhaar.length !== 12) { alert("Enter 12-digit Adhaar"); return; }

    status.innerText = "Searching...";
    status.style.color = "blue";
    loader.style.display = 'flex';

    fetch(`${scriptURL}?action=read&adhaar=${adhaar}`)
        .then(res => res.json())
        .then(data => {
            loader.style.display = 'none';
            if (data.result === "found") {
                const r = data.row;
                populateFormFromRow(r);
                status.innerText = "Data found! You can now edit and re-submit.";
                status.style.color = "green";
                popupTitle.innerText = "Record Found";
                popupMessage.innerText = "Data found! You can now edit and re-submit.";
                popup.style.display = 'flex';
            } else {
                status.innerText = "No record found. Please fill as new.";
                status.style.color = "red";
                popupTitle.innerText = "No Record";
                popupMessage.innerText = "No record found. Please fill as new.";
                popup.style.display = 'flex';
            }
        })
        .catch(err => {
            loader.style.display = 'none';
            alert("Error searching data.");
        });
}

// Search by UDISE
function searchByUDISE() {
    const udise = document.getElementById('searchUdise').value;
    if (!udise.match(/^102328[0-9]{5}$/)) {
        alert("Enter a valid 11-digit UDISE code starting with 102328");
        return;
    }

    status.innerText = "Searching...";
    status.style.color = "blue";
    loader.style.display = 'flex';

    fetch(`${scriptURL}?action=readByUDISE&udise=${udise}`)
        .then(res => res.json())
        .then(data => {
            loader.style.display = 'none';
            const listDiv = document.getElementById('udiseResultList');
            if (data.result === "found" && data.rows && data.rows.length > 0) {
                let html = '<ul style="list-style:none; padding:0; margin:0;">';
                data.rows.forEach((row, index) => {
                    const name = row[1] || "Unknown";
                    html += `<li style="display:flex; justify-content:space-between; align-items:center; padding:5px; border-bottom:1px solid #eee;">
                        <span>${name}</span>
                        <button type="button" style="width:auto; padding:5px 15px; margin:0; background:#28a745;" onclick="editRecordFromRow(${index})">Edit</button>
                    </li>`;
                });
                html += '</ul>';
                listDiv.innerHTML = html;
                window.udiseSearchRows = data.rows; // store globally
                status.innerText = `${data.rows.length} record(s) found.`;
                status.style.color = "green";
            } else {
                listDiv.innerHTML = '<p style="color:red; text-align:center;">No records found for this UDISE.</p>';
                status.innerText = "No records found.";
                status.style.color = "red";
            }
        })
        .catch(err => {
            loader.style.display = 'none';
            alert("Error searching by UDISE.");
        });
}

// Edit a specific record from UDISE list
function editRecordFromRow(index) {
    const rows = window.udiseSearchRows;
    if (!rows || index >= rows.length) return;
    const row = rows[index];
    populateFormFromRow(row);
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

// Fill form with row data (indices updated for PAN at 23)
function populateFormFromRow(r) {
    form.name.value = r[1] || '';
    form.father_name.value = r[2] || '';
    form.dob.value = formatDate(r[3]);
    form.adhaar.value = r[4] || '';
    form.mobile.value = r[5] || '';
    form.email.value = r[6] || '';
    
    // Gender radio
    const gender = r[7];
    if (gender) {
        const radios = form.gender;
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].value === gender) {
                radios[i].checked = true;
                break;
            }
        }
    }

    form.school_name.value = r[8] || '';
    form.udise.value = r[9] || '';
    form.teacher_type.value = r[10] || '';
    
    // Class level radio
    const classLevel = r[11];
    if (classLevel) {
        const radios = form.class_level;
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].value === classLevel) {
                radios[i].checked = true;
                break;
            }
        }
    }

    form.subject.value = r[12] || '';
    form.doj.value = formatDate(r[13]);
    form.account_number.value = r[14] || '';
    form.bank_name.value = r[15] || '';
    form.ifsc.value = r[16] || '';
    form.village.value = r[17] || '';
    form.panchayat.value = r[18] || '';
    form.block.value = r[19] || '';
    form.district.value = r[20] || '';
    form.state.value = r[21] || '';
    form.pincode.value = r[22] || '';

    // NEW: PAN at index 23
    form.pan.value = r[23] || '';

    status.innerText = "Record loaded. You can edit and re-submit.";
    status.style.color = "green";
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
}

form.addEventListener('submit', e => {
    e.preventDefault();

    // Convert text inputs to uppercase (PAN included)
    const textInputs = form.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.value = input.value.toUpperCase();
    });

    btn.disabled = true;
    btn.innerText = "Saving...";
    loader.style.display = 'flex';

    fetch(scriptURL, { method: 'POST', body: new FormData(form), keepalive: true })
        .then(res => {
            loader.style.display = 'none';
            popupTitle.innerText = "Success!";
            popupMessage.innerText = "Data submitted successfully.";
            popup.style.display = 'flex';
            form.reset();
            btn.disabled = false;
            btn.innerText = "Submit Data Securely";
        })
        .catch(err => {
            loader.style.display = 'none';
            status.innerText = "Error saving data.";
            btn.disabled = false;
        });
});

closePopupBtn.addEventListener('click', () => {
    popup.style.display = 'none';
});
