// src/services/videoService.js
class VideoService {
    constructor() {
      this.stream = null;
      this.videoBubbles = new Map();
    }
  
    async startVideo() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        return this.stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        return null;
      }
    }
  
    stopVideo() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  
    createVideoBubble(playerId, isLocal = false) {
      const bubble = document.createElement('div');
      bubble.className = 'video-bubble';
      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.muted = isLocal;
      bubble.appendChild(video);
      document.body.appendChild(bubble);
      
      this.videoBubbles.set(playerId, { bubble, video });
      return { bubble, video };
    }
  
    removeVideoBubble(playerId) {
      const bubbleData = this.videoBubbles.get(playerId);
      if (bubbleData) {
        bubbleData.bubble.remove();
        this.videoBubbles.delete(playerId);
      }
    }
  
    updateBubblePosition(playerId, x, y) {
      const bubbleData = this.videoBubbles.get(playerId);
      if (bubbleData) {
        bubbleData.bubble.style.left = `${x}px`;
        bubbleData.bubble.style.top = `${y}px`;
      }
    }
  
    cleanup() {
      this.stopVideo();
      this.videoBubbles.forEach((bubbleData) => {
        bubbleData.bubble.remove();
      });
      this.videoBubbles.clear();
    }
  }
  
  export default new VideoService();