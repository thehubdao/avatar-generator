import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setTakingPhoto } from '../../../store/citizensMetadataSlice';

export default function FlashUI() {
  const container = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();

  useGSAP(() => {
    gsap.to(container.current, { 
      opacity: 0, 
      duration: 0.2, 
      delay: 0.1,
      onComplete: () => {
        dispatch(setTakingPhoto(false));
      }
    });
  }, []);
  return (
    <div ref={container} className="absolute inset-0 w-dvw h-dvh bg-white pointer-events-none" />
  )
}