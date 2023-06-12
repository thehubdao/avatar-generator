import {SkinnedMesh} from "three";
import {TextureTone} from "./texture.type";

export type MaterialFunction = (obj: SkinnedMesh, tone?: TextureTone) => void;