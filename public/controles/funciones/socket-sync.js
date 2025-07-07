// Lógica de sincronización por socket
export function syncToMenuPrincipal() {
    if (window.socket) {
        window.socket.emit('control', { action: 'backToMenu' });
        window.socket.emit('video-status', { playing: false });
    }
}
export function syncToSubmenu() {
    if (window.socket) {
        window.socket.emit('video-status', { playing: false });
    }
}
export function syncToPregunta() {
    if (window.socket) {
        window.socket.emit('video-status', { playing: false });
    }
}
export function syncToReproductor() {
    if (window.socket) {
        window.socket.emit('video-status', { playing: true });
    }
} 