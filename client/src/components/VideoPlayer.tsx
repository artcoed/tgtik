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
  const isAndroid = /android/i.test(navigator.userAgent);
  const [isVideoReady, setIsVideoReady] = useState(false);
  // Overlay показывается всегда, когда видео на паузе и готово
  const showOverlay = !playing && isVideoReady;

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
    console.log('[VideoPlayer] handlePlayPause:', {
      userAgent: navigator.userAgent,
      isAndroid,
      wasUserGesture,
      videoPaused: videoRef.current?.paused,
      playing,
      isVideoReady,
      eventType: e.type
    });
    if (!wasUserGesture) {
      if (videoRef.current) {
        videoRef.current.play().then(() => {
          setWasUserGesture(true);
          if (setIsFirstPlay) setIsFirstPlay(false);
        }).catch((err) => { console.log('[VideoPlayer] play() error:', err); });
      }
      return;
    }
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => { console.log('[VideoPlayer] play() error:', err); });
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
            autoPlay={false}
            onPointerDown={e => {
              console.log('[VideoPlayer] onPointerDown', { isVideoReady, wasUserGesture });
              if (isVideoReady) handlePlayPause(e);
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={handleEnded}
            onLoadStart={() => setIsVideoLoading(true)}
            onWaiting={() => setIsVideoLoading(true)}
            onCanPlay={() => {
              setIsVideoLoading(false);
              setIsVideoReady(true);
              if (onVideoReady) onVideoReady();
              if (shouldSeekRef.current && videoRef.current) {
                videoRef.current.currentTime = playedSeconds;
                lastSeekRef.current = playedSeconds;
                shouldSeekRef.current = false;
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
          {showOverlay && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                background: 'rgba(0,0,0,0.0)', // убираем черный фон
                borderRadius: 60,
                width: 120,
                height: 120,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                // Можно добавить легкую тень для видимости
                boxShadow: '0 2px 16px rgba(0,0,0,0.15)'
              }}
              onPointerDown={e => {
                if (videoRef.current) {
                  const fakeEvent = {
                    ...e,
                    currentTarget: videoRef.current,
                    target: videoRef.current
                  } as unknown as React.PointerEvent<HTMLVideoElement>;
                  handlePlayPause(fakeEvent);
                }
              }}
            >
              <img src={playIcon} alt="Play" style={{ width: 80, height: 80, opacity: 0.92 }} />
            </div>
          )}
        </>
      ) : null}
      {/* Loader is now handled by parent via isVideoLoading state */}
    </div>
  );
}