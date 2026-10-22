// Inline script for <head>: applies the visitor's saved style before first paint (no flash).
// Kept separate from lib/prefs.ts so the server layout can import it.
export const PREFS_KEY = "solostack:prefs";

const IDS = JSON.stringify(["stack", "editorial", "glass", "brutal", "playful"]);

export const THEME_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");if(${IDS}.indexOf(p.style)>-1)document.documentElement.dataset.style=p.style}catch(e){}`;
