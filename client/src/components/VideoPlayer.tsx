import React, { useRef, useEffect, useState } from 'react';
import { Video as VideoType } from '../api/types';
import Loader from './Loader';
import playIcon from '../assets/playIcon2.svg';
import {baseUrl} from "../api/api";


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
  setIsFirstPlay?: React.Dispatch<React.SetStateAction<boolean>>;
  isFirstPlay?: boolean;
  setProgressNoTransition?: (v: boolean) => void;
  progressNoTransition?: boolean;
}

export default function VideoPlayer({ setProgress, videos, currentIndex, setCurrentIndex, fade, setIsVideoLoading, playing, setPlaying, muted = false, onVideoReady, playedSeconds = 0, onProgress, setIsFirstPlay, isFirstPlay, setProgressNoTransition, progressNoTransition }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSeekRef = useRef<number>(-1);
  const shouldSeekRef = useRef(false);
  const wasFirstPause = useRef(false);
  const playRequested = useRef(false);
  const [wasUserGesture, setWasUserGesture] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Video play error:', err);
        }
      });
    }
    setIsVideoLoading(true);
    lastSeekRef.current = -1;
    shouldSeekRef.current = false;
  }, [currentIndex, setIsVideoLoading]);

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

  const handlePlayPause = (e: React.PointerEvent<HTMLVideoElement>) => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!wasUserGesture) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setWasUserGesture(true);
        if (setIsFirstPlay) setIsFirstPlay(false);
        // Android костыль: сразу ставим playing=true, чтобы снять с паузы с первого клика
        if (isAndroid) {
          setPlaying(true);
          // Через 100мс проверяем, снялось ли с паузы, если нет — повторно play()
          setTimeout(() => {
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
            }
          }, 100);
        }
      }
      return;
    }
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setProgress(0);
    if (setProgressNoTransition) {
      setProgressNoTransition(true);
      setTimeout(() => setProgressNoTransition(false), 60);
    }
    // ... остальная логика (например, автопереход к следующему видео)
  };

  return (
    <div style={{
      transition: 'opacity 0.3s',
      opacity: fade ? 0 : 1,
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#000',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {videos[currentIndex]?.url ? (
        <>
          <video
            ref={videoRef}
            src={videos[currentIndex].url}
            width="100%"
            height="100%"
            playsInline={true}
            controls={false}
            crossOrigin="anonymous"
            muted={muted}
            poster={baseUrl + videos[currentIndex]?.previewUrl}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setProgress(videoRef.current.currentTime / videoRef.current.duration);
                if (onProgress) {
                  onProgress({ playedSeconds: videoRef.current.currentTime });
                }
              }
            }}
            autoPlay={wasUserGesture ? playing : false}
            onPointerDown={handlePlayPause}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={handleEnded}
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
              if (playing && videoRef.current && videoRef.current.paused) {
                videoRef.current.play().catch(() => {});
              }
              // Если пользователь кликнул play до готовности видео, включаем проигрывание сейчас
              if (playRequested.current) {
                setPlaying(true);
                playRequested.current = false;
                if (setIsFirstPlay) setIsFirstPlay(false);
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              background: '#000',
              cursor: 'pointer',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 84px)',
              transform: playing ? 'translate(-50%, -50%) scale(0.7)' : 'translate(-50%, -50%) scale(1)',
              opacity: playing ? 0 : 1,
              transition: 'opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1)',
              pointerEvents: 'none', // overlay не ловит клики
              zIndex: 2,
              width: 82,
              height: 82,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              touchAction: 'manipulation',
            }}
          >
            <img
              src={playIcon}
              alt="Play"
              style={{
                width: 82,
                height: 82,
                display: 'block',
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          </div>
        </>
      ) : null}
      {/* Loader is now handled by parent via isVideoLoading state */}
    </div>
  );
}