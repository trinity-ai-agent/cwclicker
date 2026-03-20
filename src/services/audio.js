/**
 * Service to manage Web Audio API and play morse code tones.
 */
export class AudioService {
  /**
   * Initializes the audio service properties without starting the AudioContext.
   */
  constructor() {
    this.context = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isInitialized = false;
    this.frequency = 600;
    this.volume = 0.5;
    this.isMuted = false;
  }

  /**
   * Initializes the AudioContext upon user interaction.
   */
  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported in this browser');
      return;
    }
    try {
      this.context = new AudioContext();
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Failed to initialize AudioContext:', e);
    }
  }

  /**
   * Plays a constant morse code tone.
   */
  playTone() {
    if (!this.isInitialized) this.init();
    if (!this.context) return;
    if (this.oscillator) return;
    if (this.isMuted) return;
    
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(this.frequency, this.context.currentTime);
    
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
    
    // Quick fade in to prevent clicks
    const targetVolume = this.volume * 0.3; // Max 0.3 to prevent clipping
    this.gainNode.gain.setTargetAtTime(targetVolume, this.context.currentTime, 0.01);
  }

  /**
   * Stops the morse code tone.
   */
  stopTone() {
    if (!this.oscillator) return

    // Quick fade out
    this.gainNode.gain.setTargetAtTime(0, this.context.currentTime, 0.01)

    const osc = this.oscillator
    this.oscillator = null

    setTimeout(() => {
      osc.stop()
      osc.disconnect()
    }, 50)
  }

  /**
   * Sets the volume level.
   * @param {number} volume - Volume level from 0.0 to 1.0
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.context) {
      const targetVolume = this.isMuted ? 0 : this.volume * 0.3;
      this.gainNode.gain.setTargetAtTime(targetVolume, this.context.currentTime, 0.01);
    }
  }

  /**
   * Sets the frequency of the tone.
   * @param {number} freq - Frequency in Hz (typically 400-1000)
   */
  setFrequency(freq) {
    this.frequency = Math.max(400, Math.min(1000, freq));
    if (this.oscillator && this.context) {
      this.oscillator.frequency.setTargetAtTime(this.frequency, this.context.currentTime, 0.01);
    }
  }

  /**
   * Toggles mute state.
   * @param {boolean} [muted] - Optional explicit mute state
   * @returns {boolean} Current mute state
   */
  toggleMute(muted) {
    if (typeof muted === 'boolean') {
      this.isMuted = muted;
    } else {
      this.isMuted = !this.isMuted;
    }

    if (this.gainNode && this.context) {
      const targetVolume = this.isMuted ? 0 : this.volume * 0.3;
      this.gainNode.gain.setTargetAtTime(targetVolume, this.context.currentTime, 0.01);
    }

    // Stop oscillator if muted while playing
    if (this.isMuted && this.oscillator) {
      this.stopTone();
    }

    return this.isMuted;
  }
}

export const audioService = new AudioService();
