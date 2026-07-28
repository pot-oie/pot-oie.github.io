export function initGlobalAudio() {
  const globalWin = window as Window & {
    __potGlobalAudioInstalled?: boolean;
  };
  if (globalWin.__potGlobalAudioInstalled) return;
  globalWin.__potGlobalAudioInstalled = true;

  const audio = document.getElementById(
    "pot-global-audio",
  ) as HTMLAudioElement;
  if (!audio) return;

  let currentId: string | null = null;
  let fadeTimer: any = null;
  const targetVolume = 0.4; // 默认最高音量

  // 工具：平滑淡入
  const fadeIn = () => {
    if (fadeTimer) clearInterval(fadeTimer);
    audio.volume = 0;
    audio.play();
    fadeTimer = setInterval(() => {
      if (audio.volume + 0.05 < targetVolume) {
        audio.volume += 0.05;
      } else {
        audio.volume = targetVolume;
        clearInterval(fadeTimer);
      }
    }, 50);
  };

  // 工具：平滑淡出并暂停
  const fadeOutAndPause = (callback?: () => void) => {
    if (fadeTimer) clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      if (audio.volume - 0.05 > 0) {
        audio.volume -= 0.05;
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeTimer);
        if (callback) callback();
      }
    }, 30);
  };

  // 广播当前状态给所有 UI 组件
  const broadcast = (state: "playing" | "paused" | "ended") => {
    window.dispatchEvent(
      new CustomEvent("pot:audio-state", {
        detail: { id: currentId, state },
      }),
    );
  };

  audio.addEventListener("play", () => broadcast("playing"));
  audio.addEventListener("pause", () => broadcast("paused"));
  audio.addEventListener("ended", () => broadcast("ended"));
  audio.addEventListener("timeupdate", () => {
    window.dispatchEvent(
      new CustomEvent("pot:audio-progress", {
        detail: {
          id: currentId,
          currentTime: audio.currentTime,
          duration: audio.duration,
        },
      }),
    );
  });

  // 接收任意组件的播放请求
  window.addEventListener("pot:play-request", (e: any) => {
    const { id, url, title, artist, cover } = e.detail;

    // 1. 点的是同一首歌
    if (currentId === id) {
      if (audio.paused) {
        fadeIn();
      } else {
        fadeOutAndPause();
      }
      return;
    }

    // 2. 切歌：淡出旧歌 -> 换源 -> 淡入新歌
    const playNewTrack = () => {
      audio.src = url;
      currentId = id;
      fadeIn();

      // 注册系统级 MediaSession (锁屏控制)
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title || "Unknown",
          artist: artist || "Unknown",
          artwork: cover
            ? [{ src: cover, sizes: "512x512", type: "image/webp" }]
            : [],
        });
        navigator.mediaSession.setActionHandler("play", fadeIn);
        navigator.mediaSession.setActionHandler("pause", () => {
          fadeOutAndPause();
        });
      }
    };

    if (!audio.paused && audio.src) {
      fadeOutAndPause(playNewTrack);
    } else {
      playNewTrack();
    }
  });

  // 接收进度条拖动请求
  window.addEventListener("pot:seek-request", (e: any) => {
    if (e.detail.id === currentId && audio.duration) {
      audio.currentTime = e.detail.percentage * audio.duration;
    }
  });

  // 接收音量调节请求
  window.addEventListener("pot:volume-request", (e: any) => {
    if (e.detail.id === currentId) {
      const vol = Math.max(0, Math.min(1, e.detail.volume));
      audio.volume = vol;
      // 覆盖默认最大音量，允许用户接管
      if (fadeTimer) clearInterval(fadeTimer);
    }
  });
}
