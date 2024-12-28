import Image from "next/image";

export default function LogoTheHub() {
  return (
    <>
      <svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="xl:hidden">
        <path d="M31.597 15.0847C31.597 15.0847 27.914 12.4612 27.1804 11.1874C26.4469 9.91352 26.0106 5.42663 26.0106 5.42663C21.796 -1.80888 11.2767 -1.80888 7.07921 5.42663C7.07921 5.42663 6.64289 9.91352 5.90934 11.1874C5.17579 12.4612 1.47755 15.0847 1.47755 15.0847C-2.71989 22.3354 2.52357 31.3888 10.9356 31.3888C10.9356 31.3888 15.0549 29.5728 16.5392 29.5728C18.0234 29.5728 22.1427 31.3888 22.1427 31.3888C30.5548 31.3888 35.8154 22.3354 31.6008 15.0847H31.597ZM16.5354 25.8916C11.7758 25.8916 7.91946 22.0567 7.91946 17.3196C7.91946 12.5825 11.7739 8.74773 16.5354 8.74773C21.2968 8.74773 25.1513 12.5825 25.1513 17.3196C25.1513 22.0567 21.2968 25.8916 16.5354 25.8916Z" fill="url(#paint0_linear_2232_924)" />
        <defs>
          <linearGradient id="paint0_linear_2232_924" x1="16.5392" y1="-0.0004739" x2="16.5392" y2="31.3888" gradientUnits="userSpaceOnUse">
            <stop stop-color="#19D8F3" />
            <stop offset="1" stop-color="#197FF3" />
          </linearGradient>
        </defs>
      </svg>
      
      <Image
        src='/resources/images/the-hub-logo-white.svg'
        alt="the hub icon"
        width={182}
        height={32}
        className="hidden xl:block"
      />
    </>
  )
}