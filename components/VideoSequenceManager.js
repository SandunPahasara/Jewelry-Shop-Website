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

        // Trigger Golden Rain effect
        this.triggerGoldenRain();

        // Apply cinematic fade transition
        this.videoElement.style.opacity = '0';

        setTimeout(() => {
            this.videoElement.src = this.videoPaths[this.currentIndex];
            this.videoElement.load();
            this.videoElement.onloadeddata = () => {
                this.videoElement.play();
                this.videoElement.style.opacity = '1';
            };
        }, 800); // Wait for golden rain peak
    }

    triggerGoldenRain() {
        const container = document.getElementById('goldenRain');
        if (!container) return;

        // Clear previous particles
        container.innerHTML = '';
        container.classList.add('active');

        // Create new particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'gold-particle';

            // Randomize position and animation
            const left = Math.random() * 100 + '%';
            const duration = (Math.random() * 2 + 1) + 's';
            const delay = (Math.random() * 0.5) + 's';

            particle.style.left = left;
            particle.style.animationDuration = duration;
            particle.style.animationDelay = delay;

            container.appendChild(particle);
        }

        // Deactivate after transition finishes
        setTimeout(() => {
            container.classList.remove('active');
        }, 3000);
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
