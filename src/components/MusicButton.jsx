import { useEffect, useRef, useState } from 'react';
import { music } from '../content';
import '../styles/music.css';

/**
 * Fixed at the foot of every page. The three bars only move while something
 * is actually playing, so the motion reports state instead of decorating a
 * button. If the song isn't in place yet it says so once, rather than
 * failing silently on a click.
 */
export default function MusicButton() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      setMissing(false);
    } catch {
      // No file at that path, or the browser refused to start it.
      setMissing(true);
      setPlaying(false);
    }
  }

  return (
    <div className="music">
      {missing ? <p className="music-missing">{music.missing}</p> : null}

      <div className="music-controls">
        <button
          className={`music-button${playing ? ' is-playing' : ''}`}
          type="button"
          aria-pressed={playing}
          onClick={toggle}
        >
          <span className="music-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {playing ? music.pauseAction : music.playAction}
        </button>

        <label className="music-volume">
          <span className="visually-hidden">{music.volumeLabel}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>
      </div>

      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="none"
        onEnded={() => setPlaying(false)}
        onError={() => setMissing(true)}
      />
    </div>
  );
}
