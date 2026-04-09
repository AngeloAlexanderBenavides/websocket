const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const toggleConnectionButton = document.getElementById("toggleConnectionButton");

let isConnected = true;

const appendMessage = (text, messageType = "system") => {
  if (!chatBox) {
    return;
  }

  const rowElement = document.createElement("div");
  rowElement.classList.add("msgRow");

  if (messageType === "sent") {
    rowElement.classList.add("msgSent");
  } else if (messageType === "received") {
    rowElement.classList.add("msgReceived");
  } else {
    rowElement.classList.add("msgSystem");
  }

  const bubbleElement = document.createElement("div");
  bubbleElement.classList.add("msgBubble");
  bubbleElement.textContent = text;

  rowElement.appendChild(bubbleElement);
  chatBox.appendChild(rowElement);
  chatBox.scrollTop = chatBox.scrollHeight;
};

const renderConnectionState = () => {
  if (!statusDot || !statusText || !toggleConnectionButton) {
    return;
  }

  if (isConnected) {
    statusDot.classList.add("connected");
    statusText.textContent = "Conectado";
    toggleConnectionButton.textContent = "Desconectar";
  } else {
    statusDot.classList.remove("connected");
    statusText.textContent = "Desconectado";
    toggleConnectionButton.textContent = "Conectar";
  }
};

if (toggleConnectionButton) {
  toggleConnectionButton.addEventListener("click", () => {
    isConnected = !isConnected;
    renderConnectionState();
    appendMessage(
      isConnected
        ? "Conectado a ws://localhost:8080"
        : "Conexion cerrada por el cliente",
      "system"
    );
  });
}

if (messageForm && messageInput) {
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();
    if (!message) {
      return;
    }

    appendMessage(message, "sent");
    messageInput.value = "";

    if (isConnected) {
      setTimeout(() => {
        appendMessage("Mensaje recibido por el servidor", "received");
      }, 400);
    } else {
      appendMessage("No hay conexion activa", "system");
    }
  });
}

renderConnectionState();
appendMessage("Frontend structure is ready.", "system");
appendMessage("Conectado a ws://localhost:8080", "system");
appendMessage("Hola, soy el servidor. En que te puedo ayudar hoy?", "received");
