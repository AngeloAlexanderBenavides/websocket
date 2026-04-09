const networkCanvas = document.getElementById("networkCanvas");
const networkContext = networkCanvas ? networkCanvas.getContext("2d") : null;

if (networkCanvas && networkContext) {
  let canvasWidth = 0;
  let canvasHeight = 0;
  const particles = [];

  const particleCount = 80;
  const maxDistance = 150;
  const mouse = { x: null, y: null };

  const resizeCanvas = () => {
    canvasWidth = networkCanvas.width = window.innerWidth;
    canvasHeight = networkCanvas.height = window.innerHeight;
  };

  class Particle {
    constructor() {
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.radius = 2.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvasWidth) {
        this.vx *= -1;
      }

      if (this.y < 0 || this.y > canvasHeight) {
        this.vy *= -1;
      }
    }

    draw() {
      networkContext.beginPath();
      networkContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      networkContext.fillStyle = "rgba(0, 98, 255, 0.4)";
      networkContext.fill();
    }
  }

  const drawConnections = () => {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          networkContext.beginPath();
          networkContext.strokeStyle = `rgba(0, 98, 255, ${opacity * 0.3})`;
          networkContext.lineWidth = 1;
          networkContext.moveTo(particles[i].x, particles[i].y);
          networkContext.lineTo(particles[j].x, particles[j].y);
          networkContext.stroke();
        }
      }

      if (mouse.x !== null && mouse.y !== null) {
        const dxMouse = particles[i].x - mouse.x;
        const dyMouse = particles[i].y - mouse.y;
        const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distanceMouse < maxDistance) {
          const opacity = 1 - distanceMouse / maxDistance;
          networkContext.beginPath();
          networkContext.strokeStyle = `rgba(0, 98, 255, ${opacity * 0.5})`;
          networkContext.lineWidth = 1.5;
          networkContext.moveTo(particles[i].x, particles[i].y);
          networkContext.lineTo(mouse.x, mouse.y);
          networkContext.stroke();
        }
      }
    }
  };

  const animateNetwork = () => {
    networkContext.clearRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    drawConnections();
    requestAnimationFrame(animateNetwork);
  };

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();

  for (let i = 0; i < particleCount; i += 1) {
    particles.push(new Particle());
  }

  animateNetwork();
}
