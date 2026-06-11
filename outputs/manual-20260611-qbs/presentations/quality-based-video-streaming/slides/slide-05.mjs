import { C, bg, footer, kicker, title, note, pill, arrow } from "./common.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "AI BITRATE PREDICTION", C.lime);
  title(slide, ctx, "The model translates seven network features into one safe quality level.");
  const features = ["throughput", "previous throughput", "buffer", "latency", "packet loss", "jitter", "current quality"];
  features.forEach((f, i) => pill(slide, ctx, 74 + (i % 2) * 220, 248 + Math.floor(i / 2) * 62, 186, 38, f, C.slate));
  ctx.addShape(slide, { x: 520, y: 286, w: 250, h: 146, fill: "#12263A", line: ctx.line(C.lime, 2) });
  ctx.addText(slide, { x: 548, y: 318, w: 194, h: 34, text: "Random Forest", fontSize: 30, color: C.lime, bold: true, align: "center", typeface: ctx.fonts.title });
  ctx.addText(slide, { x: 552, y: 366, w: 186, h: 40, text: "180 trees, max depth 8, balanced classes", fontSize: 15, color: C.paper, align: "center", typeface: ctx.fonts.body });
  arrow(slide, ctx, 468, 360, 516, 360, C.slate);
  arrow(slide, ctx, 774, 360, 822, 360, C.slate);
  const outputs = [["240p", "400k"], ["360p", "1000k"], ["720p", "2500k"], ["1080p", "6000k"]];
  outputs.forEach(([q, b], i) => {
    const y = 236 + i * 72;
    ctx.addShape(slide, { x: 848, y, w: 210, h: 48, fill: i === 1 ? C.cyan : "#102236", line: ctx.line(i === 1 ? C.cyan : C.slate, 1) });
    ctx.addText(slide, { x: 870, y: y + 9, w: 72, h: 22, text: q, fontSize: 20, color: i === 1 ? C.ink : C.paper, bold: true, typeface: ctx.fonts.title });
    ctx.addText(slide, { x: 962, y: y + 12, w: 64, h: 18, text: b, fontSize: 13, color: i === 1 ? C.ink : C.slate, typeface: ctx.fonts.mono });
  });
  note(slide, ctx, "Prediction returns quality label, bitrate, confidence, accuracy, and a human-readable reason such as low buffer or packet loss.", 76, 560, 930, 42, C.slate, 18);
  footer(slide, ctx, 5, "Source: ai_model.py");
  return slide;
}
