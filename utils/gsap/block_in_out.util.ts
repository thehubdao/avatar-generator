import gsap from 'gsap';

export const translationInOutBlock = (
  elementReference: HTMLDivElement,
  duration: number,
  isOut?: boolean,
  fromRight?: boolean,
  handleComplete?: () => void
) => {
  if (!isOut) {
    return gsap.to(elementReference, {
      x: 0,
      ease: 'power1.out',
      duration,
      onComplete: () => handleComplete && handleComplete()
    })
  } else {
    return gsap.to(elementReference, {
      x: fromRight ? '100%' : '-100%',
      ease: 'power1.out',
      duration,
      onComplete: () => handleComplete && handleComplete()
    });
  }
}

export const fadeInOutBlock = (
  elementReference: HTMLDivElement,
  duration: number,
  isOut?: boolean,
  handleComplete?: () => void
) => {
  if (!isOut) {
    return gsap.to(elementReference, {
      opacity: 1,
      ease: 'power1.out',
      duration,
      onComplete: () => handleComplete && handleComplete()
    });
  } else {
    return gsap.to(elementReference, {
      opacity: 0,
      ease: 'power1.out',
      duration,
      onComplete: () => handleComplete && handleComplete()
    });
  }
}