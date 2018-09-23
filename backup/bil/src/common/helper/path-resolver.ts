// tslint:disable-next-line:no-unnecessary-class
export class PathResolver {
    public static base = "./../";
    public static json = PathResolver.base + "json/";
    public static media = PathResolver.base + "media/";
    public static images = PathResolver.media + "images/";
    public static audio = PathResolver.media + "audio/";

    public static PATH_MAP = {
        COMMON_AUDIO: "../zeus_common/media/audio/",
        COMMON_IMAGE: "../zeus_common/media/images/",
        COMMON_JSON: "../zeus_common/data/",
        COMMON_LANG_AUDIO: "../common/media/audio/",
        COMMON_LANG_IMAGE: "../common/media/images/",
        COMMON_LANG_JSON: "../common/data/",
        EXPLORATION_COMMON_AUDIO: "./media/audio/",
        EXPLORATION_COMMON_IMAGE: "./media/images/",
        EXPLORATION_COMMON_JSON: "./data/",
        EXPLORATION_LANG_AUDIO: "./media/audio/",
        EXPLORATION_LANG_IMAGE: "./media/images/",
        EXPLORATION_LANG_JSON: "./data/",
        PLAYER_ASSET_AUDIO: PathResolver.audio,
        PLAYER_ASSET_IMAGE: PathResolver.images,
        PLAYER_ASSET_JSON: PathResolver.json
    };

    // Path resolver
    public static resolvePath(data: any, langName?: string): string {
        let _type = "";
        const url: string = data.url || "";

        if (PathResolver.PATH_MAP[data.type]) {
            _type += PathResolver.PATH_MAP[data.type];
        }
        _type += url;
        if (data.type === "EXPLORATION_LANG_AUDIO" && langName === "es") {
            _type = _type.split(".mp3").join("_es.mp3");
        }
        return _type;
    }
}
