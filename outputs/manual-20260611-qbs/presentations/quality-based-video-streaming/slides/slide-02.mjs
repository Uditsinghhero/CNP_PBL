import { C, bg, footer, kicker, title, note } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "STREAMING PROBLEM", C.coral);
  title(slide, ctx, "Quality drops happen before a player can explain them.");
  note(slide, ctx, "The controller watches multiple QoS signals together instead of trusting bandwidth alone.", 58, 194, 720, 42, C.slate, 20);
  const cells = [
    ["Low throughput", "higher rebuffer risk", C.coral],
    ["Low buffer", "quality must step down early", C.gold],
    ["High RTT + jitter", "late segment arrival", C.cyan],
    ["Packet loss", "capacity estimate becomes unsafe", C.lime],
  ];
  cells.forEach((c, i) => {
    const x = 76 + (i % 2) * 520;
    const y = 300 + Math.floor(i / 2) * 132;
    ctx.addShape(slide, { x, y, w: 440, h: 92, fill: "#102236", line: ctx.line(c[2], 1) });
    ctx.addText(slide, { x: x + 22, y: y + 18, w: 220, h: 26, text: c[0], fontSize: 22, color: c[2], bold: true, typeface: ctx.fonts.title });
    ctx.addText(slide, { x: x + 22, y: y + 53, w: 330, h: 24, text: c[1], fontSize: 16, color: C.paper, typeface: ctx.fonts.body });
  });
  ctx.addShape(slide, { x: 858, y: 162, w: 320, h: 86, fill: "#0F2032", line: ctx.line(C.slate, 1) });
  ctx.addText(slide, { x: 884, y: 184, w: 268, h: 36, text: "QoS signals must become a quality decision", fontSize: 22, color: C.paper, bold: true, typeface: ctx.fonts.title, align: "center", valign: "middle" });
  footer(slide, ctx, 2, "Source: ai_model.py feature set and player.js telemetry loop");
  return slide;
}
