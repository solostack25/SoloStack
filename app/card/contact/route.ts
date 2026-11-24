// vCard for "Save my contact" on /card. Phones open it straight into the add-contact sheet.
const VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "N:Ali;Travis;;;",
  "FN:Travis Ali",
  "ORG:SoloStack Labs",
  "TEL;TYPE=CELL,VOICE:+13215069546",
  "EMAIL;TYPE=INTERNET,WORK:travis@solostack.us",
  "URL;TYPE=WORK:https://solostack.us",
  "URL:https://siqa.us",
  "ADR;TYPE=WORK:;;;Houston;TX;;USA",
  "NOTE:Tapped from my SoloStack Labs card.",
  "END:VCARD",
  "",
].join("\r\n");

export const dynamic = "force-static";

export function GET() {
  return new Response(VCARD, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'inline; filename="Travis-Ali.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
