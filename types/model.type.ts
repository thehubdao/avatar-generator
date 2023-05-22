import {SkinnedMesh} from "three";
import {TextureTone} from "../utils/texture.util";

export type MaterialFunction = (obj: SkinnedMesh, tone?: TextureTone) => void;