const scriptURL = 'https://script.google.com/macros/s/AKfycbyUqIzVwEFLHzjGBcgLvVVlr8sZ5id3uEEJr-doim7nLMOpM7vl8rucIybUjr-8FfRT/exec';
const form = document.getElementById('dataForm');
const btn = document.getElementById('submitBtn');
const loader = document.getElementById('loader');
const popup = document.getElementById('successPopup');
const popupTitle = popup.querySelector('h3');
const popupMessage = popup.querySelector('p');

// Handle form submission
form.addEventListener('submit', e => {
    e.preventDefault();

    // Convert all text inputs to uppercase
    form.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = input.value.toUpperCase();
    });

    btn.disabled = true;
    btn.innerText = "Saving...";
    loader.style.display = 'flex';

    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(res => res.text())
        .then(response => {
            loader.style.display = 'none';
            btn.disabled = false;
            btn.innerText = "Submit Data Securely";

            if (response === "SUCCESS") {
                popupTitle.innerText = "Success!";
                popupMessage.innerText = "Data submitted successfully.";
                popup.style.display = 'flex';
                form.reset();
            } else {
                // Show error in popup instead of alert
                popupTitle.innerText = "Error";
                popupMessage.innerText = "Server responded: " + response;
                popup.style.display = 'flex';
            }
        })
        .catch(err => {
            loader.style.display = 'none';
            btn.disabled = false;
            btn.innerText = "Submit Data Securely";
            // Show network error in popup
            popupTitle.innerText = "Network Error";
            popupMessage.innerText = "Could not connect to server. Please check your internet connection.";
            popup.style.display = 'flex';
        });
});

// Close popup
popup.querySelector('button').addEventListener('click', () => {
    popup.style.display = 'none';
});
