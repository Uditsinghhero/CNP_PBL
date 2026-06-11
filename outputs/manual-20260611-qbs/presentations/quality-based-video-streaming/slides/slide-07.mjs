import { C, bg, footer, kicker, title, note } from "./common.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  kicker(slide, ctx, "DEMO DASHBOARD", C.cyan);
  title(slide, ctx, "The browser UI makes adaptive streaming observable and testable.", true);
  const items = [
    ["Video player", "plays the generated DASH manifest with dash.js"],
    ["AI toggle", "switches between ML control and normal dash.js ABR"],
    ["Network profiles", "stable, medium, poor, and lossy conditions"],
    ["Live charts", "throughput, bitrate, buffer, and latency"],
    ["Decision reason", "shows stable network, low buffer, limited throughput, or packet loss"],
    ["Session logging", "saves every decision for later result graphs"],
  ];
  items.forEach(([h, b], i) => {
    const x = 78 + (i % 3) * 372;
    const y = 248 + Math.floor(i / 3) * 142;
    ctx.addShape(slide, { x, y, w: 300, h: 104, fill: i === 1 ? "#DDF8EA" : "#FFFFFF", line: ctx.line(i === 1 ? C.lime : "#D2D8DE", 1) });
    ctx.addText(slide, { x: x + 18, y: y + 18, w: 260, h: 26, text: h, fontSize: 22, color: C.ink, bold: true, typeface: ctx.fonts.title });
    ctx.addText(slide, { x: x + 18, y: y + 54, w: 250, h: 34, text: b, fontSize: 14, color: C.muted, typeface: ctx.fonts.body });
  });
  note(slide, ctx, "This is a working project surface, not a static simulation.", 78, 582, 680, 30, C.muted, 18);
  footer(slide, ctx, 7, "Source: templates/index.html and static/js/player.js");
  return slide;
}
