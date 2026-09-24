// 効果音（Web Audio で合成。音声ファイルは使わない）

const Sound = {
  ctx: null,
  enabled: true,

  init() {
    try {
      this.enabled = localStorage.getItem('sound') !== 'off';
    } catch {
      this.enabled = true;
    }
  },

  setEnabled(on) {
    this.enabled = on;
    try {
      localStorage.setItem('sound', on ? 'on' : 'off');
    } catch {
      // 保存できなくても切り替え自体は効く
    }
  },

  // スマホではユーザー操作の中で AudioContext を作る・再開する必要がある
  context() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  // 1 音鳴らす。start は今からの秒数。
  tone(freq, start, duration, { type = 'square', volume = 0.12, slideTo = null } = {}) {
    const ctx = this.ctx;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  },

  play(name) {
    if (!this.enabled || !this.context()) return;
    const n = (note) => 440 * Math.pow(2, (note - 69) / 12); // MIDI ノート番号 → 周波数
    switch (name) {
      case 'tap':
        this.tone(n(84), 0, 0.05, { volume: 0.05 });
        break;
      case 'start':
        [72, 76, 79, 84].forEach((m, i) => this.tone(n(m), i * 0.07, 0.12, { volume: 0.08 }));
        break;
      case 'correct':
        this.tone(n(88), 0, 0.12, { type: 'triangle', volume: 0.2 });
        this.tone(n(93), 0.1, 0.3, { type: 'triangle', volume: 0.2 });
        break;
      case 'wrong':
        this.tone(220, 0, 0.35, { type: 'sawtooth', volume: 0.1, slideTo: 110 });
        break;
      case 'result':
        [72, 76, 79].forEach((m, i) => this.tone(n(m), i * 0.12, 0.14, { volume: 0.08 }));
        this.tone(n(84), 0.36, 0.5, { volume: 0.08 });
        break;
      case 'best':
        [79, 84, 88, 91, 96].forEach((m, i) => this.tone(n(m), i * 0.08, 0.2, { type: 'triangle', volume: 0.15 }));
        break;
    }
  },
};

Sound.init();
