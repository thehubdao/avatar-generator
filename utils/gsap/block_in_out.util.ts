import gsap from 'gsap'

export const moveHorizontalBlocks = (
  elementReference: HTMLDivElement,
  duration: number,
  position: 'right' | 'left',
  animationType: 'in' | 'out',
  thenFunction?: () => void
) => {
  const positionPibot = position === "right" ? 1 : -1

  if (animationType === 'in') {
    return gsap.from(elementReference, {
      x: positionPibot * elementReference.clientWidth,
      ease: 'power1.out',
      duration,
    }).then(() => { thenFunction && thenFunction() });
  } else {
    return gsap.to(elementReference, {
      x: positionPibot * elementReference.clientWidth,
      ease: 'power1.out',
      duration,
    }).then(() => { thenFunction && thenFunction() });
  }
}

export const moveVerticalBlocks = (
  elementReference: HTMLDivElement,
  duration: number,
  position: 'top' | 'bottom',
  animationType: 'in' | 'out',
  thenFunction?: () => void
) => {
  const positionPibot = position === "bottom" ? 1 : -1

  if (animationType === 'in') {
    return gsap.from(elementReference, {
      y: positionPibot * elementReference.clientWidth,
      ease: 'power1.out',
      duration,
    }).then(() => { thenFunction && thenFunction() });
  } else {
    return gsap.to(elementReference, {
      y: positionPibot * elementReference.clientWidth,
      ease: 'power1.out',
      duration,
    }).then(() => { thenFunction && thenFunction() });
  }
}

export const fadeBlock = (
  elementReference: HTMLDivElement,
  duration: number,
  thenFunction?: () => void
) => {
  return gsap.to(elementReference, {
    opacity: 0,
    ease: 'power1.out',
    duration,
  }).then(() => { thenFunction && thenFunction() });
}