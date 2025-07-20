import React, { useRef, useEffect } from 'react';
import { Video as VideoType } from '../api/types';
import Loader from './Loader';

interface VideoPlayerProps {
  setProgress: (v: number) => void;
  videos: VideoType[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  fade: boolean;
  setIsVideoLoading: (loading: boolean) => void;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  muted?: boolean;
  onVideoReady?: () => void;
  playedSeconds?: number;
  onProgress?: (state: { playedSeconds: number }) => void;
}

export default function VideoPlayer({ setProgress, videos, currentIndex, setCurrentIndex, fade, setIsVideoLoading, playing, setPlaying, muted = false, onVideoReady, playedSeconds = 0, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSeekRef = useRef<number>(-1);
  const shouldSeekRef = useRef(false);
  const [isMuted, setIsMuted] = React.useState(muted);
  const [isActuallyPlaying, setIsActuallyPlaying] = React.useState(false);

  useEffect(() => {
    setIsMuted(muted); // сбрасываем mute при смене видео
    setIsActuallyPlaying(false); // сбрасываем флаг при смене видео
  }, [muted, currentIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      // Не автозапускаем видео при первом показе (playing=false)
      if (playing) {
        videoRef.current.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Video play error:', err);
          }
        });
      }
    }
    setIsVideoLoading(true);
    lastSeekRef.current = -1;
    shouldSeekRef.current = false;
    setIsActuallyPlaying(false); // сбрасываем при смене видео
  }, [currentIndex, setIsVideoLoading, playing]);

  // Seek to playedSeconds when it changes (if different from current)
  useEffect(() => {
    if (
      videoRef.current &&
      typeof playedSeconds === 'number' &&
      Math.abs(videoRef.current.currentTime - playedSeconds) > 0.5 &&
      playedSeconds !== lastSeekRef.current
    ) {
      if (videoRef.current.readyState >= 1) {
        videoRef.current.currentTime = playedSeconds;
        lastSeekRef.current = playedSeconds;
        shouldSeekRef.current = false;
      } else {
        shouldSeekRef.current = true;
      }
    }
  }, [playedSeconds]);

  // Ставим/снимаем паузу у видео при изменении playing
  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      } else {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    }
  }, [playing]);

  // Управляем mute на самом элементе
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div style={{
      transition: 'opacity 0.3s',
      opacity: fade ? 0 : 1,
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#000'
    }}>
      {videos[currentIndex]?.url ? (
        <video
          ref={videoRef}
          src={videos[currentIndex].url}
          width="100%"
          height="100%"
          playsInline={true}
          controls={false}
          crossOrigin="anonymous"
          muted={isMuted}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setProgress(videoRef.current.currentTime / videoRef.current.duration);
              if (onProgress) {
                onProgress({ playedSeconds: videoRef.current.currentTime });
              }
            }
          }}
          autoPlay={false} // всегда false, чтобы не автозапускалось
          onClick={() => {
            if (videoRef.current) {
              if (!isActuallyPlaying) {
                setIsMuted(false); // включаем звук при первом клике
                videoRef.current.play().then(() => {
                  // setIsActuallyPlaying будет вызван в onPlay
                }).catch((err) => {
                  if (err.name !== 'AbortError') {
                    console.error('Video play error:', err);
                  }
                });
              } else {
                videoRef.current.pause();
                setIsActuallyPlaying(false);
                setPlaying(false);
              }
            }
          }}
          onPlay={() => {
            setIsActuallyPlaying(true);
            setPlaying(true);
          }}
          onPause={() => {
            setIsActuallyPlaying(false);
            setPlaying(false);
          }}
          onEnded={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.pause();
              setIsActuallyPlaying(false);
              setPlaying(false);
            }
          }}
          onLoadStart={() => setIsVideoLoading(true)}
          onWaiting={() => setIsVideoLoading(true)}
          onCanPlay={() => {
            setIsVideoLoading(false);
            if (onVideoReady) onVideoReady();
            if (shouldSeekRef.current && videoRef.current) {
              videoRef.current.currentTime = playedSeconds;
              lastSeekRef.current = playedSeconds;
              shouldSeekRef.current = false;
            }
            // Не автозапускаем видео
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            background: '#000',
            cursor: 'pointer',
          }}
        />
      ) : null}
      {/* Overlay pause icon */}
      {!isActuallyPlaying && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          {/* SVG pause icon */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="rgba(0,0,0,0.5)"/>
            <rect x="26" y="24" width="8" height="32" rx="3" fill="#fff"/>
            <rect x="46" y="24" width="8" height="32" rx="3" fill="#fff"/>
          </svg>
        </div>
      )}
      {/* Loader is now handled by parent via isVideoLoading state */}
    </div>
  );
}