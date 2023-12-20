import Head from "next/head";
import AGText from "../../../ui/common/ag-text.component";

export default function ApiInfo() {
  const url = 'https://avatar-generator-git-testing-dap-frontend.vercel.app/api/v1';
  
  return (
    <>
      <Head>
        <title>Api Documentation - V1</title>
      </Head>
      <div className="flex h-full justify-center bg-gray-600">
        <div className="w-2/3 h-full px-3 bg-white shadow-2xl">
          <div className="my-2">
            <br/><br/>
            <AGText type="th1">API Documentation - V1</AGText>
            
            <section>
              <AGText type="th1.5">Features</AGText>
              <AGText type="th2">GET</AGText>
              <AGText type="text" justText>
                Get list of feature types on certain campaign
              </AGText>
              <AGText type="link">{`${url}/features/{campaign}`}</AGText>
              <AGText type="th3">Input</AGText>
              <AGText type="text">- campaign</AGText>
              <AGText type="th3">Return Schema</AGText>
              <AGText type="code">{
                `{
  "success": boolean,
  "message": string,
  "data": string[]                
}`
              }
              </AGText>
              
            </section>

            <section>
              <AGText type="th1.5">Feature Options</AGText>
              <AGText type="th2">GET</AGText>
              <AGText type="text" justText>
                Get list of features options on certain campaign and filtered by feature type
              </AGText>
              <AGText type="link">{`${url}/featureOptions/{campaign}/{type}`}</AGText>
              <AGText type="th3">Input</AGText>
              <AGText type="text">- campaign</AGText>
              <AGText type="text">- type: feature type case sensitive (optional)</AGText>
              <AGText type="th3">Return Schema</AGText>
              <AGText type="code">{
                `{
  "success": boolean,
  "message": string,
  "data": {
    "id": string,
    "name": string,
    "type": string,
    "path": string,
    "thumb": string
  }[]                
}`
              }
              </AGText>

            </section>

            <section>
              <AGText type="th1.5">Accessories</AGText>
              <AGText type="th2">GET</AGText>
              <AGText type="text" justText>
                Get list of accessory types on certain campaign
              </AGText>
              <AGText type="link">{`${url}/accessories/{campaign}`}</AGText>
              <AGText type="th3">Input</AGText>
              <AGText type="text">- campaign</AGText>
              <AGText type="th3">Return Schema</AGText>
              <AGText type="code">{
                `{
  "success": boolean,
  "message": string,
  "data": string[]                
}`
              }
              </AGText>

            </section>

            <section>
              <AGText type="th1.5">Accessory Options</AGText>
              <AGText type="th2">GET</AGText>
              <AGText type="text" justText>
                Get list of accessory options on certain campaign and filtered by accessory type
              </AGText>
              <AGText type="link">{`${url}/accessoryOptions/{campaign}/{type}`}</AGText>
              <AGText type="th3">Input</AGText>
              <AGText type="text">- campaign</AGText>
              <AGText type="text">- type: accessory type case sensitive (optional)</AGText>
              <AGText type="th3">Return Schema</AGText>
              <AGText type="code">{
                `{
  "success": boolean,
  "message": string,
  "data": {
    "id": string,
    "name": string,
    "type": string,
    "path": string,
    "thumb": string
  }[]                
}`
              }
              </AGText>

            </section>
          </div>
        </div>
      </div>
    </>
  );
}