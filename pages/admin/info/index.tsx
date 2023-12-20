import {Component} from "react";
import Head from "next/head";
import Image from "next/image";
import AGText from "../../../ui/common/ag-text.component";
import {IFrameEvent} from "../../../enums/common.enum";

import replitAvatarIFramePic from '../../../public/resources/images/info/replitAvatarIFrame.jpg';
import {IFRAME_VALUES} from "../../../constants/common.constant";

interface InfoState {
  prodUrl: string;
}

export default class Info extends Component<undefined, InfoState> {
  constructor(props: undefined) {
    super(props);
    this.state = {
      prodUrl: 'https://avatar-generator-metagamehub.vercel.app/'
    };
  }

  render() {
    return (
      <>
        <Head>
          <title>Info</title>
        </Head>
        <div className="flex h-full justify-center bg-gray-600">
          <div className="w-2/3 h-full px-3 bg-white shadow-2xl">
            <div className="my-2">
              <AGText type='th1.5'>How to use</AGText>
              <AGText type='th1'>Avatar Generator</AGText>

              <section>
                <AGText type='th2'>IFrame Implementation:</AGText>
                <AGText type='text'>
                  In order to use Avatar Generator (AG) on an IFrame we use
                  <AGText type="link" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage">Window
                    PostMessage API</AGText>,
                  and a list of events
                  our AG handles in order to work properly inside an IFrame:
                </AGText>

                <AGText type="th2">Messages from IFrame</AGText>
                <dl>
                  <dt><AGText type="th3" mark="dash">Ready event:</AGText></dt>
                  <dd>
                    <AGText type='text'>
                      Event sent from AG, telling parent window the app is ready, the object sent through the
                      PostMessage:
                    </AGText>
                    <AGText type='code'>{
                      `{
  source: “${IFRAME_VALUES.Project}”,
  eventName: “${IFrameEvent.Ready}”
}`
                    }</AGText>
                    <AGText type='text'>
                      Should be receive on the parent window in order to subscribe to AG export event.
                    </AGText>
                  </dd>

                  <dt><AGText type="th3" mark="dash">Exported event:</AGText></dt>
                  <dd>
                    <AGText type="text">
                      Once parent window is subscribed and the export button is pressed, it will return the following
                      object with the export data:
                    </AGText>
                    <AGText type="code">
                      {
                        `{
  source: “${IFRAME_VALUES.Project}”,
  eventName: “${IFrameEvent.Exported}",
  data: {
    attributes: { id: string, val: string }[],
    attributesBase64: string,
    combination: number;
    model: Blob,
    picture: Blob,
  }
}`
                      }
                    </AGText>
                    <AGText type="text">We are in the process of adding the video.</AGText>
                  </dd>
                </dl>

                <AGText type="th2">Requests to IFrame</AGText>
                <dl>
                  <dt><AGText type="th3" mark="dash">Subscribe event:</AGText></dt>
                  <dd>
                    <AGText type="text">
                      Message expected on AG in order to allow exporting from the app, without this message the app
                      won’t send the exported event to the parent window.
                    </AGText>
                    <AGText type="code">
                      {
                        `{
  target: “${IFRAME_VALUES.Project}”,
  eventName: “${IFrameEvent.Subscribe}”
}`
                      }
                    </AGText>
                  </dd>

                  <dt><AGText type="th3" mark="dash">Change skin color event:</AGText></dt>
                  <dd>
                    <AGText type="text">
                      Message expected on AG in order to change avatar{"'"}s skin color.
                    </AGText>
                    <AGText type="code">
                      {
                        `{
  target: “${IFRAME_VALUES.Project}”,
  eventName: “${IFrameEvent.ChangeSkinColor}”,
  payload: string       // Hex color without #
}`
                      }
                    </AGText>
                  </dd>

                  <dt><AGText type="th3" mark="dash">Change feature/accessory event:</AGText></dt>
                  <dd>
                    <AGText type="text">
                      Message sent to AG in order to change a feature on the current avatar.
                    </AGText>
                    <AGText type="code">
                      {
                        `{
  target: “${IFRAME_VALUES.Project}”,
  eventName: “${IFrameEvent.ChangeFeature}”,
  payload: {
    id: string,       // Feature/Accessory type
    val: string,      // Feature/Accessory name
    detail?: string   // glb file Url
  }
}`
                      }
                    </AGText>
                    <AGText type="text">You can consult a list of features/accessories on the api.</AGText>
                  </dd>

                  <dt><AGText type="th3" mark="dash">Export event:</AGText></dt>
                  <dd>
                    <AGText type="text">
                      Message sent to AG in order to export current avatar (Triggers the Exported event from the
                      IFrame).
                    </AGText>
                    <AGText type="code">
                      {
                        `{
  target: “${IFRAME_VALUES.Project}”,
  eventName: “${IFrameEvent.Exported}”
}`
                      }
                    </AGText>
                  </dd>
                </dl>
                <br/>
                <AGText type="text">Example using this events can be found in this link:</AGText>
                <AGText type="text">
                  <AGText type="link" href="https://replit.com/@OswaldUnity/AvatarIFrame#script.js">
                    https://replit.com/@OswaldUnity/AvatarIFrame#script.js
                  </AGText>
                </AGText>
                <div className="flex justify-center my-2">
                  <Image width={640} height={487} src={replitAvatarIFramePic} layout="intrinsic"
                         alt="Replit Example"></Image>
                </div>
                <AGText type="text">You can clone this small project and test it on your own.</AGText>
              </section>

              <section>
                <AGText type="th2">URL Parameters:</AGText>
                <dl>
                  <dt><AGText type="th3" mark="bullet">Campaign:</AGText></dt>
                  <dd>
                    <AGText type="text">Right now our working campaign is “decentraland”.</AGText>
                    <AGText type="text">Link example:</AGText>
                    <AGText type="text">
                      <AGText type="link" href={this.state.prodUrl + '?campaign=decentraland'}>
                        {this.state.prodUrl + '?campaign=decentraland'}
                      </AGText>
                    </AGText>
                    <AGText type="text">
                      This link will show current decentraland implementation as well as start with a random set of
                      features on display avatar.
                    </AGText>
                  </dd>

                  <dt><AGText type="th3" mark="bullet">Background color:</AGText></dt>
                  <dd>
                    <AGText type="text">Change avatar canvas background color to a hex value.</AGText>
                    <AGText type="text">Link example:</AGText>
                    <AGText type="text">
                      <AGText type="link" href={this.state.prodUrl + '?bg=00FFFF'}>
                        {this.state.prodUrl + '?bg=00FFFF'}
                      </AGText>
                    </AGText>
                    <AGText type="text">
                      This link will show our base campaign implementation with a {'"'}#00FFFF{'"'} {'>'} {'"'}
                      <span style={{backgroundColor: '#00FFFF'}}>&nbsp;&nbsp;&nbsp;</span>{'"'}
                      background color.
                    </AGText>
                  </dd>

                  <dt><AGText type="th3" mark="bullet">Only view:</AGText></dt>
                  <dd>
                    <AGText type="text">Shows AG with only the view mode.</AGText>
                    <AGText type="text">Link example:</AGText>
                    <AGText type="text">
                      <AGText type="link" href={this.state.prodUrl + '?ov=true'}>
                        {this.state.prodUrl + '?ov=true'}
                      </AGText>
                    </AGText>
                    <AGText type="text">
                      This link will show our base campaign implementation with only the view mode.
                    </AGText>
                  </dd>

                  <dt><AGText type="th3" mark="bullet">Config:</AGText></dt>
                  <dd>
                    <AGText type="text">
                      We can also send pre-configuration of attributes to the web-app, sends through the
                      <strong>“config”</strong> parameter which receives the object list of attribute parameters as
                      base64 string.
                    </AGText>
                    <AGText type="text">Example attribute list created by the app:</AGText>
                    <AGText type="code">
                      {
                        `[
  {id: "campaign", val: "decentraland"},
  {id: "Chest", val: "Tshirt2"},
  {id: "Eyebrows", val: "Daz"},
  {id: "Eyes", val: "Cat"},
  {id: "Mouth", val: "Mouth7"},
  {id: "Legs", val: "Short"},
  {id: "Feet", val: "Running"}
]`
                      }
                    </AGText>
                    <AGText type="text">Attribute object list “stringify” and transformed to Base64:</AGText>
                    <AGText type="code" justText>
                      W3siaWQiOiJjYW1wYWlnbiIsInZhbCI6ImRlY2VudHJhbGFuZCJ9LHsiaWQiOiJDaGVzdCIsInZhbCI6IlRzaGlydDIifSx7ImlkIjoiRXllYnJvd3MiLCJ2YWwiOiJEYXoifSx7ImlkIjoiRXllcyIsInZhbCI6IkNhdCJ9LHsiaWQiOiJNb3V0aCIsInZhbCI6Ik1vdXRoNyJ9LHsiaWQiOiJMZWdzIiwidmFsIjoiU2hvcnQifSx7ImlkIjoiRmVldCIsInZhbCI6IlJ1bm5pbmcifV0
                    </AGText>
                    <AGText type="text">Link example using config parameter:</AGText>
                    <AGText type="code" justText>
                      {this.state.prodUrl + '?config=W3siaWQiOiJjYW1wYWlnbiIsInZhbCI6ImRlY2VudHJhbGFuZCJ9LHsiaWQiOiJDaGVzdCIsInZhbCI6IlRzaGlydDIifSx7ImlkIjoiRXllYnJvd3MiLCJ2YWwiOiJEYXoifSx7ImlkIjoiRXllcyIsInZhbCI6IkNhdCJ9LHsiaWQiOiJNb3V0aCIsInZhbCI6Ik1vdXRoNyJ9LHsiaWQiOiJMZWdzIiwidmFsIjoiU2hvcnQifSx7ImlkIjoiRmVldCIsInZhbCI6IlJ1bm5pbmcifV0'}
                    </AGText>
                    <AGText type="text">
                      Several values are under development so they may change, we are going to upload this information
                      in a much easier way to read page.
                    </AGText>
                    <AGText type="text">Once we have this page we will send it to you.</AGText>
                    <AGText type="text">Thank you very much for your attention.</AGText>
                  </dd>
                </dl>
              </section>

              <AGText type="end">end</AGText>
            </div>
          </div>
        </div>
      </>
    );
  }
}