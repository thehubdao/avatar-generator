import LogoAnimatedUI from "./SVG/logoAnimatedSVG.ui";

interface LoadingUIProps {
  colorPrimary?: string;
  colorSecundary?: string;
  loadingText?: string;
  errorText?: string;
  dataValidate: any; // This should be the data you want to validate, null if data is loading, undefined if there is an error, any other value if data is loaded
}

export default function LoadingUI({ colorPrimary = '#000000', colorSecundary = '#1AB3F4', loadingText = 'Loading', errorText = 'Error', dataValidate }: LoadingUIProps) {

  return (
    <div className={`${dataValidate != null ? 'hidden':''} fixed inset-0 w-full h-dvh flex flex-col justify-center items-center bg-gradient-to-b from-[#151515] to-[#0C0C0C]`}>
      {dataValidate === null &&
        <div className="w-14 h-14 mb-8">
          <LogoAnimatedUI colorPrimary={colorPrimary} colorSecundary={colorSecundary} />
        </div>
      }
      <h1 className="text-white flex">
        {dataValidate === null &&
          <>
            {loadingText}
            <div className="flex gap-1">
              <div className="citizen-loading__dot">.</div>
              <div className="citizen-loading__dot">.</div>
              <div className="citizen-loading__dot">.</div>
            </div>
          </>
        }
        {dataValidate === undefined && <>{errorText}</>}
      </h1>
      {dataValidate === null &&
        <div className={`citizen-loading__bar absolute left-0 bottom-0 w-1/2 h-px bg-gradient-to-r from-transparent to-[#1AB3F4]`} />
      }
    </div>
  )
}