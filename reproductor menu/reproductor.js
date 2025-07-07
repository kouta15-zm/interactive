// Lógica para mostrar y controlar el video en index.htm
export function showVideo(videoUrl) {
    const videoContainer = document.getElementById('video-container');
    const videoFrame = document.getElementById('video-frame');
    if (!videoContainer || !videoFrame) return;
    videoContainer.style.display = 'block';
    videoFrame.src = videoUrl;
    videoFrame.play();
}

export function hideVideo() {
    const videoContainer = document.getElementById('video-container');
    const videoFrame = document.getElementById('video-frame');
    if (videoContainer) videoContainer.style.display = 'none';
    if (videoFrame) {
        videoFrame.pause();
        videoFrame.src = '';
    }
} 