/**
 * Syntezator proceduralnego dźwięku silnika dwusuwowego (2T) na bazie Web Audio API.
 * Odtwarza realistyczny terkot na wolnych obrotach, rezonans wydechu ("braaap")
 * oraz charakterystyczne czterosuwowanie (stuttering) przy zbyt bogatej mieszance.
 */

class CarbAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning = false;
  private isMuted = true;

  // Węzły audio
  private oscMain: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private gainMain: GainNode | null = null;
  private filterExhaust: BiquadFilterNode | null = null;
  private filterIntake: BiquadFilterNode | null = null;
  private distortion: WaveShaperNode | null = null;
  private masterGain: GainNode | null = null;
  private fourStrokeLfo: OscillatorNode | null = null;
  private fourStrokeGain: GainNode | null = null;

  public init() {
    if (this.ctx || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      console.warn("Web Audio API nie jest obsługiwane w tej przeglądarce.");
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.start();
    } else if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private start() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isRunning) return;

    const t = this.ctx.currentTime;

    // Główny oscylator impulsów zapłonu 2T
    this.oscMain = this.ctx.createOscillator();
    this.oscMain.type = "sawtooth";

    // Podharmoniczny oscylator dołu
    this.oscSub = this.ctx.createOscillator();
    this.oscSub.type = "triangle";

    // Modulator czterosuwowania (zalewanie silnika)
    this.fourStrokeLfo = this.ctx.createOscillator();
    this.fourStrokeLfo.type = "square";
    this.fourStrokeLfo.frequency.setValueAtTime(15, t);

    this.fourStrokeGain = this.ctx.createGain();
    this.fourStrokeGain.gain.setValueAtTime(0, t);

    // Kształtowanie przesterowania (charakterystyka wydechu 2T)
    this.distortion = this.ctx.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve(18) as unknown as Float32Array<ArrayBuffer>;

    // Filtr rezonansowy dyfuzora wydechu (rezonans komory rozprężnej)
    this.filterExhaust = this.ctx.createBiquadFilter();
    this.filterExhaust.type = "bandpass";
    this.filterExhaust.frequency.setValueAtTime(850, t);
    this.filterExhaust.Q.setValueAtTime(2.8, t);

    // Filtr dolnoprzepustowy dolotu (otwiera się z manetką)
    this.filterIntake = this.ctx.createBiquadFilter();
    this.filterIntake.type = "lowpass";
    this.filterIntake.frequency.setValueAtTime(1200, t);

    // Gain główny toru
    this.gainMain = this.ctx.createGain();
    this.gainMain.gain.setValueAtTime(0.25, t);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, t);

    // Połączenia toru audio:
    // oscMain -> distortion -> filterExhaust -> filterIntake -> gainMain -> masterGain -> destination
    this.oscMain.connect(this.distortion);
    this.oscSub.connect(this.distortion);

    this.distortion.connect(this.filterExhaust);
    this.filterExhaust.connect(this.filterIntake);
    this.filterIntake.connect(this.gainMain);
    this.gainMain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Podłączenie LFO czterosuwowania pod głośność gainMain
    this.fourStrokeLfo.connect(this.fourStrokeGain);
    this.fourStrokeGain.connect(this.gainMain.gain);

    this.oscMain.start();
    this.oscSub.start();
    this.fourStrokeLfo.start();

    this.isRunning = true;
  }

  public update(rpm: number, throttle: number, afr: number, isFourStroking: boolean) {
    if (!this.ctx || !this.isRunning || this.isMuted) return;

    const t = this.ctx.currentTime;

    // W silniku 2T zapłon następuje co 1 obrót wału korbowego:
    // f = RPM / 60 Hz (np. 1800 RPM -> 30 Hz; 9000 RPM -> 150 Hz; 12000 RPM -> 200 Hz)
    const baseFreq = Math.max(18, Math.min(260, rpm / 60));

    if (this.oscMain) {
      this.oscMain.frequency.setTargetAtTime(baseFreq, t, 0.04);
    }
    if (this.oscSub) {
      this.oscSub.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.04);
    }

    // Częstotliwość rezonansowa dyfuzora wydechu rośnie z obrotami (fala rezonansowa)
    if (this.filterExhaust) {
      const exhaustCenter = 600 + (rpm / 13000) * 1100;
      this.filterExhaust.frequency.setTargetAtTime(exhaustCenter, t, 0.06);
    }

    // Filtr dolotu otwiera się szeroko wraz z otwarciem manetki gazu
    if (this.filterIntake) {
      const intakeCutoff = 800 + throttle * 4500;
      this.filterIntake.frequency.setTargetAtTime(intakeCutoff, t, 0.05);
    }

    // Efekt czterosuwowania: modulacja AM gdy silnik zalewa
    if (this.fourStrokeGain && this.fourStrokeLfo) {
      if (isFourStroking) {
        this.fourStrokeLfo.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.03);
        this.fourStrokeGain.gain.setTargetAtTime(0.18, t, 0.05);
      } else {
        this.fourStrokeGain.gain.setTargetAtTime(0.0, t, 0.05);
      }
    }

    // Głośność ogólna
    if (this.masterGain) {
      const targetVol = this.isMuted ? 0 : 0.18 + throttle * 0.18;
      this.masterGain.gain.setTargetAtTime(targetVol, t, 0.05);
    }
  }

  private makeDistortionCurve(amount = 20): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public stop() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
      this.isRunning = false;
    }
  }
}

export const carbAudio = new CarbAudioEngine();

