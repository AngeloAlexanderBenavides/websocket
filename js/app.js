const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const toggleConnectionButton = document.getElementById("toggleConnectionButton");

const clientId = crypto.randomUUID();

let isConnected = false;
let pusherClient = null;
let channelSubscription = null;
let appConfig = null;

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
  if (channelSubscription && pusherClient) {
    pusherClient.unsubscribe(appConfig.channelName);
    channelSubscription = null;
  }

  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }

  isConnected = false;
  renderConnectionState();
};

const connectRealtime = async () => {
  if (isConnected) {
    return;
  }

  if (!window.Pusher) {
    appendMessage("No se pudo cargar Pusher en el navegador.", "system");
    return;
  }

  try {
    if (!appConfig) {
      const configResponse = await fetch("/api/config");
      if (!configResponse.ok) {
        throw new Error("No se pudo obtener la configuracion del servidor");
      }

      appConfig = await configResponse.json();
    }

    pusherClient = new window.Pusher(appConfig.appKey, {
      cluster: appConfig.cluster,
      forceTLS: true,
    });

    channelSubscription = pusherClient.subscribe(appConfig.channelName);
    channelSubscription.bind(appConfig.eventName, (payload) => {
      if (payload.clientId === clientId) {
        return;
      }

      appendMessage(payload.message, "received");
    });

    isConnected = true;
    renderConnectionState();
    appendMessage("Conectado en tiempo real con Vercel + Pusher.", "system");
  } catch (error) {
    disconnectRealtime();
    appendMessage(error.message, "system");
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

    appendMessage(message, "sent");
    messageInput.value = "";

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sender: "Client",
          clientId,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el mensaje al servidor");
      }
    } catch (error) {
      appendMessage(error.message, "system");
    }
  });
}

renderConnectionState();
appendMessage("Frontend structure is ready.", "system");
appendMessage("Pulsa Conectar para iniciar chat en tiempo real.", "system");
