'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sliders, Volume1 } from 'lucide-react';

export type SoundStyle = 'mechanical' | 'typewriter' | 'carriage' | 'fishing';

const AUDIO_FILES: Record<SoundStyle, string> = {
  mechanical: '/sounds/mechanical-key.wav',
  typewriter: '/sounds/typewriter-key.wav',
  carriage: '/sounds/typewriter-carriage.wav',
  fishing: '/sounds/fishing-reel.wav',
};

export default function ScrollSoundEffect() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.35); // 35% rich volume default
  const [soundStyle, setSoundStyle] = useState<SoundStyle>('mechanical'); // Mechanical Switch finalized default
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<SoundStyle, AudioBuffer | null>>({
    mechanical: null,
    typewriter: null,
    carriage: null,
    fishing: null,
  });

  const lastScrollYRef = useRef<number>(0);
  const accumulatedDistanceRef = useRef<number>(0);
  const lastPlayTimeRef = useRef<number>(0);

  // Restore user preferences on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;

    const savedEnabled = localStorage.getItem('nyx_scroll_sound_enabled');
    if (savedEnabled !== null) {
      setIsEnabled(savedEnabled === 'true');
    }

    const savedVolume = localStorage.getItem('nyx_scroll_sound_volume');
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume));
    }

    const savedStyle = localStorage.getItem('nyx_scroll_sound_style') as SoundStyle;
    if (savedStyle && ['mechanical', 'typewriter', 'carriage', 'fishing'].includes(savedStyle)) {
      setSoundStyle(savedStyle);
    } else {
      setSoundStyle('mechanical');
    }

    lastScrollYRef.current = window.scrollY;
  }, []);

  // Initialize AudioContext & load real WAV audio samples
  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }

    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Load sample files into AudioBuffer cache
    if (ctx && !audioBuffersRef.current.mechanical) {
      const loadSample = async (key: SoundStyle, url: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const arrayBuf = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arrayBuf);
          audioBuffersRef.current[key] = buf;
        } catch {
          // Graceful fallback
        }
      };

      loadSample('mechanical', AUDIO_FILES.mechanical);
      loadSample('typewriter', AUDIO_FILES.typewriter);
      loadSample('carriage', AUDIO_FILES.carriage);
      loadSample('fishing', AUDIO_FILES.fishing);
    }

    return ctx;
  };

  // Play mechanical switch sound with organic pitch variation & velocity dynamics
  const playScrollSound = (direction: 'down' | 'up', speed: number) => {
    if (!isEnabled || volume <= 0) return;

    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const buffer = audioBuffersRef.current[soundStyle];
    const now = ctx.currentTime;

    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Humanized micro-pitch variation for natural tactile key clicks
      const basePitch = direction === 'down' ? 1.0 : 0.94;
      const speedBoost = Math.min(speed * 0.08, 0.22);
      const pitchJitter = Math.random() * 0.08 - 0.04;
      source.playbackRate.value = Math.max(0.75, Math.min(1.45, basePitch + speedBoost + pitchJitter));

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 1.3, now);

      source.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
    } else {
      // Fallback click while sample decodes
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const freq = direction === 'down' ? 2400 : 2100;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.018);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.022);
    }
  };

  // Scroll listener logic (65px threshold for tactile mechanical switch feel)
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    const unlockAudio = () => {
      getAudioContext();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);

    const DISTANCE_THRESHOLD = soundStyle === 'fishing' ? 52 : 65;
    const MIN_INTERVAL_MS = soundStyle === 'fishing' ? 45 : 55;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollYRef.current;
      const absDelta = Math.abs(deltaY);

      if (absDelta === 0) return;

      const direction = deltaY > 0 ? 'down' : 'up';
      accumulatedDistanceRef.current += absDelta;
      lastScrollYRef.current = currentY;

      const now = Date.now();
      const timeSinceLastPlay = now - lastPlayTimeRef.current;

      if (
        accumulatedDistanceRef.current >= DISTANCE_THRESHOLD &&
        timeSinceLastPlay >= MIN_INTERVAL_MS
      ) {
        const speed = absDelta / Math.max(1, timeSinceLastPlay);
        playScrollSound(direction, speed);
        accumulatedDistanceRef.current = 0;
        lastPlayTimeRef.current = now;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [isEnabled, volume, soundStyle]);

  const toggleEnabled = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    localStorage.setItem('nyx_scroll_sound_enabled', String(next));
    if (next) {
      getAudioContext();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    localStorage.setItem('nyx_scroll_sound_volume', String(val));
  };

  const handleStyleChange = (style: SoundStyle) => {
    setSoundStyle(style);
    localStorage.setItem('nyx_scroll_sound_style', style);
    if (isEnabled) {
      setTimeout(() => playScrollSound('down', 1), 50);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-[calc(82px+env(safe-area-inset-bottom,0px))] left-3.5 md:bottom-6 md:left-6 z-50 flex flex-col items-start gap-2 text-white font-headline selection:bg-[#D83C14] selection:text-white">
      {/* NYX Styled Expanded Control Panel */}
      {isExpanded && (
        <div className="bg-[#0E0E0E]/95 backdrop-blur-md border-2 border-[#D83C14] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-3.5 min-w-[250px] animate-in fade-in slide-in-from-bottom-2 duration-150 rounded-none">
          <div className="flex items-center justify-between border-b-2 border-white/10 pb-2">
            <span className="font-headline font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <Volume1 className="w-4 h-4 text-[#D83C14]" /> NYX SCROLL AUDIO
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-neutral-400 hover:text-[#D83C14] transition-colors font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-headline uppercase font-bold text-neutral-300 tracking-wider">
              <span>VOLUME</span>
              <span className="text-[#D83C14]">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-[#D83C14] h-2 bg-neutral-900 rounded-none cursor-pointer border border-white/20"
              disabled={!isEnabled}
            />
          </div>

          {/* Audio Profile Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-headline uppercase font-bold text-neutral-300 tracking-wider">
              PROFILE
            </span>
            <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 border border-white/10 text-xs font-headline uppercase font-bold">
              {(['mechanical', 'typewriter', 'carriage', 'fishing'] as SoundStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  disabled={!isEnabled}
                  className={`py-1.5 px-2 text-center transition-all border ${
                    soundStyle === style
                      ? 'bg-[#D83C14] text-white border-[#D83C14] shadow-sm'
                      : 'text-neutral-400 border-transparent hover:text-white hover:bg-white/10'
                  } ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {style === 'mechanical' ? 'SWITCH' : style === 'typewriter' ? 'TYPEWRITER' : style === 'carriage' ? 'CARRIAGE' : 'REEL'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NYX Branded Floating Control Bar */}
      <div className="flex items-center bg-[#0E0E0E] border-2 border-black shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
        <button
          onClick={toggleEnabled}
          title={isEnabled ? 'Mute Scroll Sound' : 'Unmute Scroll Sound'}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-headline uppercase tracking-wider font-bold transition-all duration-100 min-h-[42px] touch-manipulation active:scale-95 ${
            isEnabled
              ? 'bg-[#D83C14] text-white shadow-[0_0_15px_rgba(216,60,20,0.35)] hover:bg-[#F5C518] hover:text-black'
              : 'bg-[#121212] text-neutral-400 hover:text-white border-r border-white/10'
          }`}
        >
          {isEnabled ? (
            <>
              <Volume2 className="w-4 h-4 animate-pulse text-current" />
              <span>SOUND ON</span>
              {/* NYX Animated Equalizer Bars */}
              <span className="flex items-end gap-0.5 h-3 ml-1">
                <span className="w-0.5 bg-current animate-[bounce_0.6s_infinite_100ms] h-full" />
                <span className="w-0.5 bg-current animate-[bounce_0.6s_infinite_300ms] h-2/3" />
                <span className="w-0.5 bg-current animate-[bounce_0.6s_infinite_200ms] h-full" />
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-neutral-500" />
              <span>MUTED</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title="Audio Settings"
          aria-label="Audio Settings"
          className="px-2.5 py-2 min-h-[42px] min-w-[42px] flex items-center justify-center bg-[#0E0E0E] text-neutral-300 hover:text-white hover:bg-[#D83C14] transition-all duration-100 border-l border-white/10 touch-manipulation"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
