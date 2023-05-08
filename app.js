const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('#chatInput');
const chatButton = document.querySelector('.chat-input button');

chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = chatInput.value.trim();
    displayMessage(message, 'user');

    console.log('user sent message');
    console.log(message);

    // Clear input field
    chatInput.value = '';

    if (message !== '') {
        // Send message to server
        const response = await fetch('http://localhost:8008/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        // Display response from server
        const data = await response.text();
        console.log('bot sent message');
        console.log(data);

        // Generate text response from bot message
        let botMessage = data;

        // Display text response from bot message
        displayMessage(botMessage, 'bot');
    }
}


function displayMessage(message, sender) {
    const messageElement = document.createElement('p');
    messageElement.classList.add('chat-message');
    messageElement.classList.add(sender === 'bot' ? 'bot-message' : 'user-message');
    messageElement.innerText = message;
    chatMessages.appendChild(messageElement);

    // Scroll to bottom of messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
