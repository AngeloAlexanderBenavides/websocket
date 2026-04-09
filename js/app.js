const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const toggleConnectionButton = document.getElementById("toggleConnectionButton");

let isConnected = false;
let socketClient = null;
const socketServerUrl = "wss://websocket-jvqm.onrender.com";

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

const disconnectRealtime = () => {
  if (socketClient) {
    socketClient.close(1000, "Client disconnected");
    socketClient = null;
  }

  isConnected = false;
  renderConnectionState();
};

const connectRealtime = async () => {
  if (isConnected) {
    return;
  }

  try {
    socketClient = new WebSocket(socketServerUrl);

    socketClient.addEventListener("open", () => {
      isConnected = true;
      renderConnectionState();
      appendMessage(`Conectado en tiempo real a ${socketServerUrl}`, "system");
    });

    socketClient.addEventListener("message", (event) => {
      const rawMessage = typeof event.data === "string" ? event.data : "";

      if (!rawMessage.trim()) {
        return;
      }

      appendMessage(rawMessage, "received");
    });

    socketClient.addEventListener("close", () => {
      isConnected = false;
      renderConnectionState();
      appendMessage("Conexion cerrada.", "system");
      socketClient = null;
    });

    socketClient.addEventListener("error", () => {
      appendMessage("Error de conexion con el servidor websocket.", "system");
    });
  } catch (error) {
    disconnectRealtime();
    appendMessage(`No se pudo conectar: ${error.message}`, "system");
  }
};

if (toggleConnectionButton) {
  toggleConnectionButton.addEventListener("click", async () => {
    if (isConnected) {
      disconnectRealtime();
      appendMessage("Conexion cerrada por el cliente.", "system");
      return;
    }

    await connectRealtime();
  });
}

if (messageForm && messageInput) {
  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();
    if (!message) {
      return;
    }

    if (!isConnected) {
      appendMessage("No hay conexion activa. Conectate primero.", "system");
      return;
    }

    if (!socketClient || socketClient.readyState !== WebSocket.OPEN) {
      appendMessage("El socket no esta listo para enviar mensajes.", "system");
      return;
    }

    appendMessage(message, "sent");
    messageInput.value = "";

    try {
      socketClient.send(message);
    } catch (error) {
      appendMessage(error.message, "system");
    }
  });
}

renderConnectionState();
appendMessage("Frontend structure is ready.", "system");
appendMessage(`Pulsa Conectar para iniciar chat con ${socketServerUrl}`, "system");
