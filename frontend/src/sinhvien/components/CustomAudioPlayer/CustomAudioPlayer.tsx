import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiSettings, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import "./CustomAudioPlayer.css";

interface CustomAudioPlayerProps {
  src: string;
  className?: string;
  forcePlacement?: "up" | "down";
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src, className, forcePlacement }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "speed">("main");
  const [menuPlacement, setMenuPlacement] = useState<"up" | "down">("up");
  const [playbackRate, setPlaybackRate] = useState(1);

  // Sync state with HTML5 Audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset when src changes
    setIsPlaying(false);
    setCurrentTime(0);
    setPlaybackRate(1);
    audio.playbackRate = 1;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  // Click outside listener for settings menu - only closes when clicking OUTSIDE containerRef
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateMenuPlacement = () => {
    const button = settingsButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const availableAbove = rect.top;
    const availableBelow = window.innerHeight - rect.bottom;
    const preferredMenuHeight = menuView === "speed" ? 260 : 120;

    setMenuPlacement(
      availableAbove < preferredMenuHeight && availableBelow > availableAbove ? "down" : "up"
    );
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    updateMenuPlacement();
    window.addEventListener("resize", updateMenuPlacement);
    window.addEventListener("scroll", updateMenuPlacement, true);

    return () => {
      window.removeEventListener("resize", updateMenuPlacement);
      window.removeEventListener("scroll", updateMenuPlacement, true);
    };
  }, [isMenuOpen, menuView]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error("Audio playback error:", err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    setVolume(vol);
    if (vol > 0 && isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMute = !isMuted;
    audio.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleSpeedChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleReload = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.load();
    if (isPlaying) {
      audio.play().catch(err => console.error("Audio playback error:", err));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const getSpeedLabel = (rate: number) => {
    if (rate === 1) return "Normal";
    return `${rate}x`;
  };

  const speeds = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2];

  return (
    <div className={`custom-audio-container ${className || ""}`} ref={containerRef}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="custom-audio-player-bar">
        <button type="button" className="cap-play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>

        <span className="cap-time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="cap-scrubber-wrapper">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="cap-scrubber"
            style={{
              background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(currentTime / (duration || 1)) * 100}%, #e2e8f0 ${(currentTime / (duration || 1)) * 100}%, #e2e8f0 100%)`
            }}
          />
        </div>

        <div className="cap-volume-wrapper">
          <button type="button" className="cap-volume-btn" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="cap-volume-slider"
            style={{
              background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(isMuted ? 0 : volume) * 100}%, #e2e8f0 ${(isMuted ? 0 : volume) * 100}%, #e2e8f0 100%)`
            }}
          />
        </div>

        <div className="cap-settings-wrapper">
          <button
            ref={settingsButtonRef}
            type="button"
            className={`cap-settings-btn ${isMenuOpen ? "active" : ""}`}
            onClick={() => {
              if (!isMenuOpen) updateMenuPlacement();
              setIsMenuOpen(!isMenuOpen);
              setMenuView("main");
            }}
            aria-label="Audio settings"
          >
            <FiSettings />
          </button>

          {isMenuOpen && (
            <div className={`cap-dropdown-menu ${(forcePlacement || menuPlacement) === "down" ? "open-down" : "open-up"}`}>
              {menuView === "main" ? (
                <div className="cap-menu-view">
                  <button
                    type="button"
                    className="cap-menu-item has-submenu"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuView("speed");
                    }}
                  >
                    <span className="cap-menu-item-label">Speed</span>
                    <span className="cap-menu-item-value">
                      {getSpeedLabel(playbackRate)} <FiChevronRight style={{ marginLeft: 4 }} />
                    </span>
                  </button>

                  <div className="cap-menu-divider" />

                  <button
                    type="button"
                    className="cap-menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReload();
                    }}
                  >
                    Reload File
                  </button>
                </div>
              ) : (
                <div className="cap-menu-view">
                  <button
                    type="button"
                    className="cap-menu-header"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuView("main");
                    }}
                  >
                    <FiChevronLeft style={{ marginRight: 6 }} /> Speed
                  </button>

                  <div className="cap-menu-divider" />

                  <div className="cap-speeds-list">
                    {speeds.map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        className="cap-speed-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeedChange(speed);
                        }}
                      >
                        <span className={`cap-radio-circle ${playbackRate === speed ? "active" : ""}`}>
                          {playbackRate === speed && <span className="cap-radio-dot" />}
                        </span>
                        <span className="cap-speed-label">{getSpeedLabel(speed)}</span>
                      </button>
                    ))}
                  </div>

                  <div className="cap-menu-divider" />

                  <button
                    type="button"
                    className="cap-menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReload();
                    }}
                  >
                    Reload File
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
