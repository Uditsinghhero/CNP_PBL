import { C, bg, footer, kicker, title, note } from "./common.mjs";

export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "DEMO SCRIPT + NEXT STEPS", C.gold);
  title(slide, ctx, "The project is ready to demonstrate as a controlled QoS experiment.");
  const demo = [
    "Start Flask server and open the dashboard",
    "Play the generated DASH stream",
    "Switch network profile from stable to poor/lossy",
    "Show AI lowering bitrate before buffer collapse",
    "Disable AI to compare normal dash.js ABR",
    "Run analyze_results.py to produce graphs",
  ];
  demo.forEach((d, i) => {
    ctx.addShape(slide, { x: 82, y: 232 + i * 54, w: 34, h: 34, fill: i < 4 ? C.lime : C.gold, line: ctx.line() });
    ctx.addText(slide, { x: 82, y: 238 + i * 54, w: 34, h: 18, text: String(i + 1), fontSize: 15, color: C.ink, bold: true, align: "center", typeface: ctx.fonts.mono });
    ctx.addText(slide, { x: 132, y: 236 + i * 54, w: 520, h: 24, text: d, fontSize: 19, color: C.paper, typeface: ctx.fonts.body });
  });
  ctx.addShape(slide, { x: 760, y: 232, w: 360, h: 252, fill: "#102236", line: ctx.line(C.cyan, 1) });
  ctx.addText(slide, { x: 792, y: 262, w: 300, h: 28, text: "Future improvements", fontSize: 26, color: C.cyan, bold: true, typeface: ctx.fonts.title });
  note(slide, ctx, "Train on real network traces\nAdd VMAF/SSIM quality scoring\nCompare ML vs BOLA/throughput ABR\nDeploy local dash.js fallback\nExport richer per-profile reports", 792, 318, 290, 128, C.paper, 18);
  note(slide, ctx, "Core achievement: real video packaging, real playback, live QoS telemetry, AI quality prediction, and result generation are connected end to end.", 82, 592, 920, 48, C.slate, 19);
  footer(slide, ctx, 9, "Source: README.md demo script and project implementation");
  return slide;
}
