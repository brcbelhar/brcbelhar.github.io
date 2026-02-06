const scriptURL = 'https://script.google.com/macros/s/AKfycbxLCb71EVu0SHnRxugM2RF_22ZhppyoP5jngOT7en4fHNTLXJ_RggvAY4TRcG1ADXf2/exec';
const form = document.getElementById('dataForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('statusMessage');
const loader = document.getElementById('loader');
const popup = document.getElementById('successPopup');
const closePopupBtn = document.getElementById('closePopupBtn');
const popupTitle = popup.querySelector('h3');
const popupMessage = popup.querySelector('p');

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
                form.name.value = r[1];
                form.father_name.value = r[2];
                form.dob.value = formatDate(r[3]);
                form.adhaar.value = r[4];
                form.mobile.value = r[5];
                form.email.value = r[6];
                form.gender.value = r[7];
                form.school_name.value = r[8];
                form.udise.value = r[9];
                form.teacher_type.value = r[10];
                form.class_level.value = r[11];
                form.subject.value = r[12];
                form.doj.value = formatDate(r[13]);
                form.account_number.value = r[14];
                form.bank_name.value = r[15];
                form.ifsc.value = r[16];
                form.village.value = r[17];
                form.panchayat.value = r[18];
                form.block.value = r[19];
                form.district.value = r[20];
                form.state.value = r[21];
                form.pincode.value = r[22];
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

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
}

form.addEventListener('submit', e => {
    e.preventDefault();

    // Convert text input values to uppercase before submission
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
