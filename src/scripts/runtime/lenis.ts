import Lenis from "lenis";

export function initLenis() {
  // 防止重复初始化
  if ((window as any).lenis) {
    (window as any).lenis.resize?.();
    (window as any).lenis.start?.();
    return;
  }

  // 创建 Lenis 实例
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
    anchors: {
      offset: -90,
    },
  });

  // 将实例挂载到全局 window 对象
  (window as any).lenis = lenis;

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}
