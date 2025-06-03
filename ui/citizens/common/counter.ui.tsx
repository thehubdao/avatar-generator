import { useEffect, useRef, useState } from "react";
import { TimeLeft } from "../../../interfaces/citizens.interface";

interface CounterProps {
  targetDate?: Date;
  onReachZero: () => void;
}

export default function Counter({ targetDate = new Date('2025-06-02T00:40:00.000Z'), onReachZero }: CounterProps) {
  const container = useRef<HTMLDivElement>(null);

  const [isTimeCalculated, setIsTimeCalculated] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const calculateTimeLeft = (): TimeLeft => {
    const difference = targetDate.getTime() - new Date().getTime();

    if (difference <= 0) {    
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      setIsTimeCalculated(true);

      // Stop timer when countdown finishes
      if (Object.values(newTimeLeft).every(val => val === 0)) {
        onReachZero();
        setIsTimeCalculated(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div ref={container} className={`relative flex flex-col justify-center`}>
      {isTimeCalculated &&
        <>
          <p className="absolute -top-2 sm:top-0 left-1/2 -translate-x-1/2 font-light text-xs xl:text-base">Minting live in</p>
          <div className={`relative w-full font-inter font-black text-white flex justify-center items-center scale-75`}>
            <div className="flex text-6xl sm:text-8xl">
              <p className="counterData">{timeLeft.days}D</p>
              <p className="counterData">{timeLeft.hours}H</p>
            </div>
            <div className="opacity-60 text-[28px] md:text-[46px] w-10 md:w-[70px]">
              <p className="counterData leading-[0.8]">{timeLeft.minutes < 10 ? '0' : ''}{timeLeft.minutes}</p>
              <p className="counterData leading-[0.8]">{timeLeft.seconds < 10 ? '0' : ''}{timeLeft.seconds}</p>
            </div>
          </div>
        </>
      }
    </div>
  )
}