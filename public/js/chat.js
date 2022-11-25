const socket = io();

// event listener for Welcome! message
socket.on('message', (message) => {
    console.log(message);
});

// event listener for clients messages
document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message);
});

// event listener for sharing users location
document.querySelector('#share-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
        socket.emit('shareLocation', userLocation);
    });
});
