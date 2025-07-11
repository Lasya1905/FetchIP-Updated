let count = 1;
let user_details = {};

async function displayImage() {
    let image = document.createElement('img');
    image.src = 'shark.jpg';
    let imageContainer = document.getElementById('imageContainer');
    imageContainer.appendChild(image);
    
    user_details = await fetchDetails(); // now properly awaited
    
    // Generate or retrieve a unique user ID
    if (!localStorage.getItem('userId')) {
        // Generate a new UUID if one doesn't exist
        const userId = crypto.randomUUID ? crypto.randomUUID() : 
            'user_' + Math.random().toString(36).substring(2, 15) + 
            Math.random().toString(36).substring(2, 15);
        localStorage.setItem('userId', userId);
    }
    
    // Add the user ID to the user details
    user_details.userId = localStorage.getItem('userId');
    
    console.log(user_details);
    sendDetails();
}

async function fetchDetails() {
    let details = {};

    try {
        const response = await fetch("https://api.ipify.org");
        details.ip = await response.text();
    } catch (error) {
        details.ipError = error.message;
    }
    
    details.timestamp = new Date().toISOString();    let path = location;
    details.url = path.href;
    details.protocol = path.protocol;
    details.host = path.host;
    details.hostname = path.hostname;
    details.port = path.port;
    details.pathname = path.pathname;
    details.search = path.search;
    details.hash = path.hash;

    details.navigation = await navigationDetails(); // ← await this!

    // Check if we have existing details in localStorage
    const existingDetails = localStorage.getItem('user_details');
    if (existingDetails) {
        try {
            const parsedDetails = JSON.parse(existingDetails);
            // Merge existing data with new data, prioritizing new data
            details = { ...parsedDetails, ...details };
        } catch (error) {
            console.error('Error parsing localStorage data:', error);
        }
    }
    
    return details;
}

let navigationDetails = () => {
    return new Promise((resolve, reject) => {
        let navigatorObject = {};
        let navigator = window.navigator;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    navigatorObject.latitude = position.coords.latitude;
                    navigatorObject.longitude = position.coords.longitude;
                    navigatorObject.userAgent = navigator.userAgent;
                    resolve(navigatorObject);
                },
                (error) => {
                    navigatorObject.error = error.message;
                    navigatorObject.userAgent = navigator.userAgent;
                    resolve(navigatorObject);
                }
            );
        } else {
            navigatorObject.error = "Geolocation is not supported.";
            navigatorObject.userAgent = navigator.userAgent;
            resolve(navigatorObject);
        }
    });
};



// send the user details to the server
function sendDetails() {
    localStorage.setItem('user_details', JSON.stringify(user_details));

    fetch('/store_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_details)
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        console.log('Success:', data);
        alert('Details sent successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error sending details: ' + error.message);
    });
    
}



