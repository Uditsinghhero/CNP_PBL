import { C, bg, footer, kicker, metric, note } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "QUALITY BASED VIDEO STREAMING", C.lime);
  ctx.addText(slide, { x: 54, y: 104, w: 760, h: 150, text: "AI-Driven Adaptive DASH Streaming for Enhanced Video QoS", fontSize: 50, color: C.paper, bold: true, typeface: ctx.fonts.title });
  note(slide, ctx, "A real MPEG-DASH demo where browser QoS telemetry feeds a Random Forest bitrate controller, applies video quality through dash.js, and logs evidence for analysis.", 58, 270, 680, 76, C.slate, 20);
  metric(slide, ctx, 58, 408, 220, "logged playback samples", "177", C.gold);
  metric(slide, ctx, 306, 408, 220, "average AI confidence", "0.882", C.cyan);
  metric(slide, ctx, 554, 408, 220, "quality switches recorded", "12", C.coral);
  ctx.addShape(slide, { x: 880, y: 114, w: 280, h: 390, fill: "#0E1E30", line: ctx.line(C.cyan, 1) });
  ["Video", "DASH", "QoS", "AI", "Player"].forEach((t, i) => {
    ctx.addShape(slide, { x: 926 + (i % 2) * 112, y: 162 + Math.floor(i / 2) * 106, w: 86, h: 58, fill: i === 3 ? C.lime : "#152A41", line: ctx.line(i === 3 ? C.lime : C.slate, 1) });
    ctx.addText(slide, { x: 926 + (i % 2) * 112, y: 178 + Math.floor(i / 2) * 106, w: 86, h: 22, text: t, fontSize: 16, color: i === 3 ? C.ink : C.paper, bold: true, align: "center", valign: "middle" });
  });
  note(slide, ctx, "Project stack: FFmpeg + Flask + dash.js + Scikit-learn", 884, 532, 310, 44, C.slate, 16);
  footer(slide, ctx, 1, "Source: README.md, results/qos_summary.csv");
  return slide;
}
