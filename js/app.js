const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const toggleConnectionButton = document.getElementById("toggleConnectionButton");
const sendButton = document.getElementById("sendButton");

let socketClient = null;
let connectionState = "disconnected";
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

const parseIncomingMessage = (rawMessage) => {
  if (typeof rawMessage !== "string") {
    return { messageType: "received", text: "" };
  }

  const trimmedMessage = rawMessage.trim();

  try {
    const parsedMessage = JSON.parse(trimmedMessage);

    if (parsedMessage && typeof parsedMessage === "object") {
      const messageText =
        typeof parsedMessage.texto === "string"
          ? parsedMessage.texto
          : typeof parsedMessage.message === "string"
            ? parsedMessage.message
            : trimmedMessage;

      const messageType = parsedMessage.tipo === "sistema" ? "system" : "received";

      return { messageType, text: messageText };
    }
  } catch (_error) {
    return { messageType: "received", text: trimmedMessage };
  }

  return { messageType: "received", text: trimmedMessage };
};

const renderConnectionState = () => {
  if (!statusDot || !statusText || !toggleConnectionButton || !messageInput || !sendButton) {
    return;
  }

  if (connectionState === "connected") {
    statusDot.classList.add("connected");
    statusText.textContent = "Conectado";
    toggleConnectionButton.textContent = "Desconectar";
    messageInput.disabled = false;
    sendButton.disabled = false;
  } else if (connectionState === "connecting") {
    statusDot.classList.remove("connected");
    statusText.textContent = "Conectando...";
    toggleConnectionButton.textContent = "Conectando...";
    messageInput.disabled = true;
    sendButton.disabled = true;
  } else {
    statusDot.classList.remove("connected");
    statusText.textContent = "Desconectado";
    toggleConnectionButton.textContent = "Conectar";
    messageInput.disabled = false;
    sendButton.disabled = false;
  }
};

const disconnectRealtime = () => {
  if (socketClient) {
    socketClient.close(1000, "Client disconnected");
    socketClient = null;
  }

  connectionState = "disconnected";
  renderConnectionState();
};

const connectRealtime = async () => {
  if (connectionState === "connected" || connectionState === "connecting") {
    return;
  }

  try {
    connectionState = "connecting";
    renderConnectionState();

    socketClient = new WebSocket(socketServerUrl);

    socketClient.addEventListener("open", () => {
      connectionState = "connected";
      renderConnectionState();
      appendMessage(`Conectado en tiempo real a ${socketServerUrl}`, "system");
    });

    socketClient.addEventListener("message", (event) => {
      const rawMessage = typeof event.data === "string" ? event.data : "";

      if (!rawMessage.trim()) {
        return;
      }

      const incomingMessage = parseIncomingMessage(rawMessage);

      if (!incomingMessage.text) {
        return;
      }

      appendMessage(incomingMessage.text, incomingMessage.messageType);
    });

    socketClient.addEventListener("close", () => {
      connectionState = "disconnected";
      renderConnectionState();
      appendMessage("Conexion cerrada.", "system");
      socketClient = null;
    });

    socketClient.addEventListener("error", () => {
      connectionState = "disconnected";
      renderConnectionState();
      appendMessage("Error de conexion con el servidor websocket.", "system");
    });
  } catch (error) {
    disconnectRealtime();
    appendMessage(`No se pudo conectar: ${error.message}`, "system");
  }
};

if (toggleConnectionButton) {
  toggleConnectionButton.addEventListener("click", async () => {
    if (connectionState === "connected" || connectionState === "connecting") {
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

    if (connectionState !== "connected") {
      appendMessage("No hay conexion activa. Conectate primero.", "system");
      return;
    }

    if (!socketClient || socketClient.readyState !== WebSocket.OPEN) {
      appendMessage("Aun conectando. Intenta de nuevo en un momento.", "system");
      return;
    }

    appendMessage(`Tú: ${message}`, "sent");
    messageInput.value = "";

    try {
      const outgoingMessage = {
        tipo: "mensaje",
        id: Date.now(),
        texto: message,
      };

      socketClient.send(JSON.stringify(outgoingMessage));
    } catch (error) {
      appendMessage(error.message, "system");
    }
  });
}

renderConnectionState();
appendMessage("Frontend structure is ready.", "system");
appendMessage(`Pulsa Conectar para iniciar chat con ${socketServerUrl}`, "system");
