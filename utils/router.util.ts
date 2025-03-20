import Router from "next/router";
import { PageLocation } from "../enums/common.enum";
import { UrlObject } from "url";
import { CitizensPageLocation } from "../enums/citizens/common.enum";

export async function GoToPage(url: PageLocation | CitizensPageLocation, params?: string) {
  const newRoute: UrlObject = {
    pathname: url,
    query: params
  }
  await Router.push(newRoute);
}