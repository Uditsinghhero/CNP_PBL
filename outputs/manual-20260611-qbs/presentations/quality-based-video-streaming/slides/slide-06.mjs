import { C, bg, footer, kicker, title, note, arrow } from "./common.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "RUNTIME CONTROL LOOP", C.gold);
  title(slide, ctx, "Every two seconds, playback evidence becomes a new quality decision.");
  const steps = [
    ["1", "Measure", "throughput, latency, buffer, loss, jitter"],
    ["2", "Predict", "POST /api/predict to Flask model"],
    ["3", "Apply", "dash.js quality set to selected index"],
    ["4", "Log", "append metrics and reason to CSV"],
  ];
  steps.forEach(([num, head, body], i) => {
    const x = 72 + i * 292;
    const y = 318;
    ctx.addShape(slide, { x, y, w: 220, h: 124, fill: "#102236", line: ctx.line(i === 1 ? C.lime : C.slate, 1) });
    ctx.addShape(slide, { x: x + 20, y: y + 22, w: 38, h: 38, fill: i === 1 ? C.lime : C.cyan, line: ctx.line() });
    ctx.addText(slide, { x: x + 20, y: y + 29, w: 38, h: 18, text: num, fontSize: 17, color: C.ink, bold: true, align: "center", typeface: ctx.fonts.mono });
    ctx.addText(slide, { x: x + 74, y: y + 22, w: 120, h: 26, text: head, fontSize: 22, color: C.paper, bold: true, typeface: ctx.fonts.title });
    ctx.addText(slide, { x: x + 74, y: y + 62, w: 120, h: 42, text: body, fontSize: 13, color: C.slate, typeface: ctx.fonts.body });
    if (i < 3) arrow(slide, ctx, x + 224, y + 62, x + 282, y + 62, C.gold);
  });
  ctx.addShape(slide, { x: 72, y: 500, w: 1056, h: 66, fill: "#132A42", line: ctx.line(C.gold, 1) });
  ctx.addText(slide, { x: 100, y: 518, w: 118, h: 28, text: "2s loop", fontSize: 26, color: C.gold, bold: true, typeface: ctx.fonts.title });
  note(slide, ctx, "AI enabled: dash.js auto ABR is disabled and the predicted level is applied. AI disabled: normal dash.js ABR is used for comparison.", 238, 520, 840, 24, C.paper, 16);
  footer(slide, ctx, 6, "Source: static/js/player.js controlLoop()");
  return slide;
}
