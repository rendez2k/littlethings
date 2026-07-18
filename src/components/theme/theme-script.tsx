import { APPEARANCE_STORAGE_KEY, DEFAULT_APPEARANCE } from '@/features/settings/appearance';

/**
 * Blocking, pre-hydration script that applies the persisted appearance to
 * `<html>` before first paint. This prevents a flash of the wrong theme or
 * palette. It is intentionally dependency-free and defensive.
 */
export function ThemeScript() {
  const script = `(function(){try{
    var KEY=${JSON.stringify(APPEARANCE_STORAGE_KEY)};
    var d=${JSON.stringify(DEFAULT_APPEARANCE)};
    var s=d;
    try{var raw=localStorage.getItem(KEY);if(raw){var p=JSON.parse(raw);s={
      theme:['system','light','dark','pastel'].indexOf(p.theme)>-1?p.theme:d.theme,
      palette:['lavender','sky','mint','peach','rose','lemon'].indexOf(p.palette)>-1?p.palette:d.palette,
      density:['comfortable','compact'].indexOf(p.density)>-1?p.density:d.density,
      reducedMotion:typeof p.reducedMotion==='boolean'?p.reducedMotion:d.reducedMotion
    };}}catch(e){}
    var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved=s.theme==='system'?(prefersDark?'dark':'light'):s.theme;
    var r=document.documentElement;
    r.setAttribute('data-theme',resolved);
    r.setAttribute('data-palette',s.palette);
    r.setAttribute('data-density',s.density);
    r.setAttribute('data-reduced-motion',String(s.reducedMotion));
  }catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}
