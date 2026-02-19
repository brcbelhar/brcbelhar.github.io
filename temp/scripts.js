const scriptURL = 'https://script.google.com/macros/s/AKfycbxLCb71EVu0SHnRxugM2RF_22ZhppyoP5jngOT7en4fHNTLXJ_RggvAY4TRcG1ADXf2/exec';
const form = document.getElementById('dataForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('statusMessage');
const loader = document.getElementById('loader');
const popup = document.getElementById('successPopup');
const closePopupBtn = document.getElementById('closePopupBtn');
const popupTitle = popup.querySelector('h3');
const popupMessage = popup.querySelector('p');

// View elements
const initialView = document.getElementById('initialView');
const formView = document.getElementById('formView');
const addNewBtn = document.getElementById('addNewBtn');
const backToSearchBtn = document.getElementById('backToSearchBtn');

// PAN popup elements
const panPopup = document.getElementById('panPopup');
const panInput = document.getElementById('panInput');
const panTeacherName = document.getElementById('panTeacherName');
const savePanBtn = document.getElementById('savePanBtn');
const cancelPanBtn = document.getElementById('cancelPanBtn');

let currentEditAadhaar = null; // Store Aadhaar of teacher being edited in PAN popup

// Toggle functions
function showInitialView() {
    initialView.classList.remove('hidden');
    formView.classList.add('hidden');
    // Clear any search results or messages
    document.getElementById('udiseResultList').innerHTML = '';
    status.innerText = '';
}

function showFormView() {
    initialView.classList.add('hidden');
    formView.classList.remove('hidden');
    // Optionally reset the form
    form.reset();
}

addNewBtn.addEventListener('click', showFormView);
backToSearchBtn.addEventListener('click', showInitialView);

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
                // Automatically switch to form view
                showFormView();
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
                    const pan = row[23] || ''; // PAN is at index 23
                    const hasPan = pan.trim() !== '';
                    // Add green tick if PAN exists
                    const nameDisplay = hasPan ? `${name} <span class="pan-tick">✓</span>` : name;
                    html += `<li style="display:flex; justify-content:space-between; align-items:center; padding:5px; border-bottom:1px solid #eee;">
                        <span>${nameDisplay}</span>
                        <button type="button" style="width:auto; padding:5px 15px; margin:0; background:#28a745;" onclick="openPanPopup('${row[4]}', '${name}')">Edit PAN</button>
                    </li>`;
                });
                html += '</ul>';
                listDiv.innerHTML = html;
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

// Open PAN popup for a specific teacher
function openPanPopup(adhaar, name) {
    currentEditAadhaar = adhaar;
    panTeacherName.innerText = name;
    panInput.value = ''; // Clear previous input
    panPopup.style.display = 'flex';
}

// Save PAN update
function savePAN() {
    const newPan = panInput.value.trim().toUpperCase();
    if (!newPan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
        alert("Please enter a valid PAN (5 letters, 4 numbers, 1 letter)");
        return;
    }
    if (!currentEditAadhaar) {
        alert("No teacher selected.");
        return;
    }

    loader.style.display = 'flex';
    const formData = new URLSearchParams();
    formData.append('action', 'updatePAN');
    formData.append('adhaar', currentEditAadhaar);
    formData.append('pan', newPan);

    fetch(scriptURL, { method: 'POST', body: formData })
        .then(res => res.text())
        .then(response => {
            loader.style.display = 'none';
            if (response === "UPDATED" || response === "SUCCESS") {
                alert("PAN updated successfully.");
                panPopup.style.display = 'none';
                // Optionally refresh the UDISE list to show updated tick
                searchByUDISE(); // Re-run the current UDISE search to refresh list
            } else {
                alert("Error updating PAN.");
            }
        })
        .catch(err => {
            loader.style.display = 'none';
            alert("Error updating PAN.");
        });
}

// Cancel PAN popup
function cancelPan() {
    panPopup.style.display = 'none';
    currentEditAadhaar = null;
}

// Event listeners for PAN popup buttons
savePanBtn.addEventListener('click', savePAN);
cancelPanBtn.addEventListener('click', cancelPan);

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
            // After successful submission, go back to initial view
            showInitialView();
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

// Initialize: ensure form is hidden on page load
showInitialView();
