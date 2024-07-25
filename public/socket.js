const socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener('open', (event) => {
  console.log('Connected to WebSocket server');

})


socket.addEventListener('message', (event) => {
  const statusDiv = document.getElementById('status');
  const newMessage = document.createElement('div');
  newMessage.textContent = event.data;
  statusDiv.appendChild(newMessage);
});


socket.addEventListener('close', (event) => {
  console.log('Disconnected from WebSocket server');
});