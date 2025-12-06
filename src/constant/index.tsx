export class Images {
  static WOW_ICON =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png';
  static RECOVER_ICON =
    'https://static.wixstatic.com/media/5dd8a0_f1cfa48314694a02ac85f2cf0700aee4~mv2.png';
}

export class Configs {
  static KEY_GOOGLE_RECAPTCHA = '6Lcd3iArAAAAAAUJI-22bSPgBrh6lmT2BEXu66Hb';
  static RECAPTCHA_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://www.wowlibre.com' 
    : 'http://localhost:8081';
}
