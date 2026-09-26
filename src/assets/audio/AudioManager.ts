import type * as Phaser from 'phaser';
import { progression } from '../../state';
import { AUDIO_FILES } from '../manifest';
import { skin } from '../../skins/registry';
import type { SfxEvent } from './events';
import { MusicPlayer } from './Music';
import { Synth } from './Synth';

/**
 * Central audio: procedural synth by default, file overrides (AUDIO_FILES) played through Phaser.
 * Volume/mute settings live in the progression store so they serialize with everything else.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private synth!: Synth;
  private music!: MusicPlayer;
  private phaser: Phaser.Sound.BaseSoundManager | null = null;
  private fileMusic: Phaser.Sound.BaseSound | null = null;
  private lastPlayed = new Map<string, number>();
  private currentMusic: string | null = null;

  constructor() {
    progression.events.on('change', () => this.applySettings());
  }

  /** Must be called from a user gesture (browser autoplay policy). */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.synth = new Synth(this.ctx);
      this.music = new MusicPlayer(this.ctx, this.synth, this.musicBus);
      this.applySettings();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  attachPhaser(sound: Phaser.Sound.BaseSoundManager): void {
    this.phaser = sound;
    this.applySettings();
  }

  get muted(): boolean {
    return progression.data.settings.muted;
  }

  toggleMute(): void {
    progression.updateSettings({ muted: !this.muted });
  }

  setMusicVolume(v: number): void {
    progression.updateSettings({ musicVolume: Math.min(1, Math.max(0, v)) });
  }

  setSfxVolume(v: number): void {
    progression.updateSettings({ sfxVolume: Math.min(1, Math.max(0, v)) });
  }

  /**
   * Play a sound effect by event name. The recipe comes from the active skin, so the same event
   * sounds like a laser in one world and a rifle in another. `throttleMs` suppresses rapid repeats.
   */
  play(event: SfxEvent, throttleMs = 45): void {
    if (!this.ctx || this.muted) return;
    const now = performance.now();
    if (now - (this.lastPlayed.get(event) ?? -Infinity) < throttleMs) return;
    this.lastPlayed.set(event, now);

    const fileKey = `sfx_${event}`;
    if (AUDIO_FILES[fileKey] && this.phaser?.game.cache.audio.exists(fileKey)) {
      this.phaser.play(fileKey, { volume: progression.data.settings.sfxVolume });
      return;
    }
    const recipe = skin().sfx[event];
    if (recipe) this.synth.play(recipe, this.sfxBus);
  }

  /** Play a track by its key in the active skin's `tracks` record. */
  playMusic(key: string): void {
    if (this.currentMusic === key || !this.ctx) return;
    this.stopMusic();
    this.currentMusic = key;
    const fileKey = `music_${key}`;
    if (AUDIO_FILES[fileKey] && this.phaser?.game.cache.audio.exists(fileKey)) {
      this.fileMusic = this.phaser.add(fileKey, { loop: true, volume: progression.data.settings.musicVolume });
      this.fileMusic.play();
      return;
    }
    const track = skin().tracks[key];
    if (track) this.music.play(track);
  }

  /** Drop the current-track memo so the next playMusic re-starts under a new skin's recipes. */
  resetMusicMemo(): void {
    this.currentMusic = null;
  }

  stopMusic(): void {
    this.currentMusic = null;
    this.music?.stop();
    if (this.fileMusic) {
      this.fileMusic.stop();
      this.fileMusic.destroy();
      this.fileMusic = null;
    }
  }

  private applySettings(): void {
    const s = progression.data.settings;
    if (this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(s.muted ? 0 : 1, t, 0.02);
      this.sfxBus.gain.setTargetAtTime(s.sfxVolume, t, 0.02);
      this.musicBus.gain.setTargetAtTime(s.musicVolume * 0.6, t, 0.02);
    }
    if (this.phaser) this.phaser.mute = s.muted;
  }
}

export const audio = new AudioManager();
