import {
    config,
    type TargetThreadType,
} from '../config.js'
import { ThreadType } from "zca-js";

const SHOPEE_SHORT_LINK_REGEX = [
    /https:\/\/s\.shopee\.vn\/[A-Za-z0-9]+/i,
]