document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            document.getElementById('loader').hidden = true;
            return response.json();
        })
        .then(data => {
            document.getElementById('loader').hidden = true;
            document.getElementById('progress-bar').hidden = true;
            const convertButton = document.querySelector('button[type="submit"]');
            if (data.message.includes('Conversion finished')) {
                document.getElementById('status').textContent = 'Converted';
                convertButton.style.display = 'none';  // Hide the convert button
            } else {
                document.getElementById('status').textContent = data.message;
            }
        })
        .catch(error => {
            console.log(document.getElementById('loader'));
            console.log(document.getElementById('progress-bar'));

            console.error('Error:', error);
        });

    document.getElementById('loader').hidden = false;
    document.getElementById('progress-bar').hidden = false;
    document.getElementById('status').textContent = '';
});


// Function to update the progress bar
function updateProgress(progress) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.value = progress;
}

// Establish a WebSocket connection to receive progress updates
const socket = new WebSocket('ws://localhost:3000');
socket.addEventListener('message', (event) => {
    updateProgress(JSON.parse(event.data).progress);
});
