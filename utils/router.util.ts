import Router from "next/router";
import {PageLocation} from "../enums/common.enum";
import {UrlObject} from "url";

export async function GoToPage(url: PageLocation, params?: string) {
  const newRoute: UrlObject = {
    pathname: url,
    query: params
  }
  await Router.push(newRoute);
}