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

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && (typeof window !== 'undefined' && 'MSStream' in window === false);
}
function isLinux() {
  return true;
}

export default function VideoPlayer({ setProgress, videos, currentIndex, setCurrentIndex, fade, setIsVideoLoading, playing, setPlaying, muted = false, onVideoReady, playedSeconds = 0, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSeekRef = useRef<number>(-1);
  const shouldSeekRef = useRef(false);
  const isIOSDevice = isIOS();
  const isLinuxDevice = isLinux();
  const shouldMute = isIOSDevice || isLinuxDevice;
  const shouldPauseInitially = isIOSDevice || isLinuxDevice;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (shouldPauseInitially) {
        videoRef.current.pause();
        videoRef.current.muted = true;
        setPlaying(false);
      } else {
        videoRef.current.muted = false;
        videoRef.current.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Video play error:', err);
          }
        });
        setPlaying(true);
      }
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

  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        if (videoRef.current.paused) {
          if (shouldMute && videoRef.current.muted) {
            videoRef.current.muted = false;
          }
          videoRef.current.play().catch(() => {});
        }
      } else {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    }
  }, [playing, shouldMute]);

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
          muted={shouldMute}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setProgress(videoRef.current.currentTime / videoRef.current.duration);
              if (onProgress) {
                onProgress({ playedSeconds: videoRef.current.currentTime });
              }
            }
          }}
          autoPlay={playing}
          onClick={() => {
            if (videoRef.current) {
              if (playing) {
                videoRef.current.pause();
                setPlaying(false);
              } else {
                videoRef.current.play().catch((err) => {
                  if (err.name !== 'AbortError') {
                    console.error('Video play error:', err);
                  }
                });
                setPlaying(true);
              }
            }
          }}
          onEnded={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch((err) => {
                if (err.name !== 'AbortError') {
                  console.error('Video play error:', err);
                }
              });
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
            if (playing && videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
            }
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
      {/* Loader is now handled by parent via isVideoLoading state */}
    </div>
  );
}