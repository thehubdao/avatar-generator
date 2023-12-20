interface AGLoadingProps {
  loading?: boolean;
  transparency?: boolean;
  bgColor?: string;
}

export default function AGLoading({loading, bgColor, transparency}: AGLoadingProps) {
  return (
    <>
      {
        loading ?
          <div className={'fixed z-50 top-0 left-0 w-screen h-screen flex justify-center items-center' + (transparency ? ' bg-opacity-50 backdrop-blur-sm' : '')}
               style={{backgroundColor: `#${bgColor ?? "FFFFFF"}${transparency ? '80' : ''}`}}>
            <div className="leap-frog">
              <div className="leap-frog__dot"></div>
              <div className="leap-frog__dot"></div>
              <div className="leap-frog__dot"></div>
            </div>
          </div>: ''
      }
    </>
  );
}