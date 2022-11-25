const socket = io();

// elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $shareLocationButton = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;

// event listener for receiving a message
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message,
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

// event listener for clients messages
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // disable the form
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        // enable the form
        $messageFormButton.removeAttribute('disabled');
        // resetting the value of the message input field
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('Message delivered.');
    });
});

// event listener for sharing users location
$shareLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    $shareLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
        socket.emit('shareLocation', userLocation, () => {
            console.log('Location shared.');
            $shareLocationButton.removeAttribute('disabled');
        });
    });
});
