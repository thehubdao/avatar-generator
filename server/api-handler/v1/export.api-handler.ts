import {NextApiRequest, NextApiResponse} from "next";
import {ApiResponse} from "../../../interfaces/api.interface";
import {RequestResponse} from "../request.api-handler";
import {DefaultApiResponse} from "../../enums/api.enum";

export async function GetApiHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const {combination} = req.query;
  
  // const browser = await chromium.puppeteer.launch({
  //   args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
  //   defaultViewport: chromium.defaultViewport,
  //   executablePath: await chromium.executablePath,
  //   headless: true,
  //   ignoreHTTPSErrors: true,
  // });
  //
  // const page = await browser.newPage();
  // await page.setViewport({
  //   height: 480,
  //   width: 480
  // });
  
  console.log(req.query.path);
  
  return RequestResponse(res, "Successful", true, DefaultApiResponse.GetSuccess);
}