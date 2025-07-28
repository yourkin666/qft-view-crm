import { useState, useEffect } from 'react';

// 标准响应式断点
export const BREAKPOINTS = {
  // 移动端：480px以下
  mobile: 480,
  // 平板端：481px - 768px
  tablet: 768,
  // 桌面端：769px - 1200px
  desktop: 1200,
  // 大屏幕：1201px以上
  large: 1201,
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  deviceType: DeviceType;
  width: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLarge: false,
        deviceType: 'desktop',
        width: 1200,
      };
    }

    return getResponsiveState(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
};

// 根据宽度获取响应式状态
function getResponsiveState(width: number): ResponsiveState {
  const isMobile = width <= BREAKPOINTS.mobile;
  const isTablet = width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet;
  const isDesktop = width > BREAKPOINTS.tablet && width <= BREAKPOINTS.desktop;
  const isLarge = width > BREAKPOINTS.desktop;

  let deviceType: DeviceType;
  if (isMobile) deviceType = 'mobile';
  else if (isTablet) deviceType = 'tablet';
  else if (isLarge) deviceType = 'large';
  else deviceType = 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    deviceType,
    width,
  };
}

// 简化的移动端检测hook（向后兼容）
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
}; 