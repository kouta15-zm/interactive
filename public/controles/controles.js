const socket = io();

// --- NUEVO: sincronización de progreso y tiempo ---
const progressControl = document.getElementById('progressControl');
const timeIndicator = document.getElementById('timeIndicator');

// Recibir actualizaciones de tiempo desde el reproductor
socket.on('video-status', ({ current, total }) => {
    progressControl.value = total > 0 ? (current / total) * 100 : 0;
    timeIndicator.textContent = `${formatTime(current)} / ${formatTime(total)}`;
});

progressControl.oninput = (e) => {
    socket.emit('control', { action: 'seek', value: e.target.value });
};

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
// --- FIN NUEVO ---

document.getElementById('playBtn').onclick = () => {
    socket.emit('control', { action: 'play' });
};

document.getElementById('pauseBtn').onclick = () => {
    socket.emit('control', { action: 'pause' });
};

document.getElementById('stopBtn').onclick = () => {
    socket.emit('control', { action: 'stop' });
};

document.getElementById('nextBtn').onclick = () => {
    socket.emit('control', { action: 'next' });
};

document.getElementById('volumeControl').oninput = (e) => {
    socket.emit('control', { action: 'volume', value: e.target.value });
};

const homeBtn = document.getElementById('homeBtn');
homeBtn.onclick = () => {
  socket.emit('control', { action: 'backToMenu' });
}; 