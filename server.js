const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos (incluyendo controles y reproductor)
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Recibir comandos desde la pantalla de controles y reenviar al reproductor
  socket.on('control', (data) => {
    console.log('Comando recibido desde controles:', data);
    io.emit('reproductor', data);
  });

  // Reenviar el estado del video a todos los clientes (controles)
  socket.on('video-status', (data) => {
    socket.broadcast.emit('video-status', data);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor listo en puerto ${PORT}`);
}); 