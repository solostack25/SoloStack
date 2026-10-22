// Inline script for <head>: applies the visitor's saved theme before first paint (no flash).
// Kept separate from lib/prefs.ts so the server layout can import it.
export const PREFS_KEY = "solostack:prefs";

export const THEME_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");if(p.theme)document.documentElement.dataset.theme=p.theme}catch(e){}`;
