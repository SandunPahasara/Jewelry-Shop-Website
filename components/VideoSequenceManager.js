/**
 * VideoSequenceManager - Manages sequential playback of background videos
 */
class VideoSequenceManager {
    constructor(videoId, videoPaths) {
        this.videoElement = document.getElementById(videoId);
        this.videoPaths = videoPaths;
        this.currentIndex = 0;

        if (this.videoElement && this.videoPaths.length > 0) {
            this.init();
        }
    }

    init() {
        // Set initial video
        this.videoElement.src = this.videoPaths[this.currentIndex];

        // Listen for when the video ends
        this.videoElement.addEventListener('ended', () => {
            this.playNext();
        });

        // Initial play
        this.videoElement.play().catch(error => {
            console.log("Autoplay was prevented. Waiting for user interaction.", error);
        });
    }

    playNext() {
        // Increment index and loop if necessary
        this.currentIndex = (this.currentIndex + 1) % this.videoPaths.length;

        // Apply a brief fade transition if possible
        this.videoElement.style.opacity = '0';

        setTimeout(() => {
            this.videoElement.src = this.videoPaths[this.currentIndex];
            this.videoElement.load();
            this.videoElement.onloadeddata = () => {
                this.videoElement.play();
                this.videoElement.style.opacity = '1';
            };
        }, 500); // 500ms fade transition
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    const videoPaths = [
        'images/intro-videos/intro-1.mp4',
        'images/intro-videos/intro-2.mp4',
        'images/intro-videos/intro-3.mp4',
        'images/intro-videos/intro-4.mp4',
        'images/intro-videos/intro-5.mp4',
        'images/intro-videos/intro-6.mp4'
    ];

    window.videoManager = new VideoSequenceManager('heroVideo', videoPaths);
});
