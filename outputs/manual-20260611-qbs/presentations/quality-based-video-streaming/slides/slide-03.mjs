import { C, bg, footer, kicker, title, note, arrow } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "SYSTEM ARCHITECTURE", C.cyan);
  title(slide, ctx, "The implementation closes the loop from playback telemetry to quality switching.");
  const nodes = [
    ["Input video", "sample.mp4 / dataset video", 60, 300, C.gold],
    ["FFmpeg DASH packager", "4-second segments + manifest.mpd", 290, 300, C.cyan],
    ["Flask server", "segments + prediction API + logging", 552, 300, C.lime],
    ["Browser player", "dash.js playback dashboard", 814, 300, C.coral],
    ["Result analysis", "QoS graphs + summary CSV", 1036, 300, C.gold],
  ];
  nodes.forEach(([h, b, x, y, color]) => {
    ctx.addShape(slide, { x, y, w: 170, h: 112, fill: "#102236", line: ctx.line(color, 1) });
    ctx.addText(slide, { x: x + 14, y: y + 18, w: 142, h: 24, text: h, fontSize: 18, color, bold: true, typeface: ctx.fonts.title });
    ctx.addText(slide, { x: x + 14, y: y + 54, w: 142, h: 40, text: b, fontSize: 13, color: C.paper, typeface: ctx.fonts.body });
  });
  [230, 492, 754, 976].forEach((x) => arrow(slide, ctx, x, 356, x + 42, 356, C.slate));
  ctx.addShape(slide, { x: 752, y: 448, w: 236, h: 96, fill: "#132A42", line: ctx.line(C.lime, 1) });
  ctx.addText(slide, { x: 774, y: 466, w: 190, h: 22, text: "Random Forest predictor", fontSize: 18, color: C.lime, bold: true, typeface: ctx.fonts.title });
  note(slide, ctx, "Inputs: throughput, previous throughput, buffer, latency, packet loss, jitter, current quality", 774, 496, 190, 44, C.paper, 12);
  arrow(slide, ctx, 870, 448, 870, 414, C.lime);
  footer(slide, ctx, 3, "Source: app.py, generate_dash.py, ai_model.py, static/js/player.js");
  return slide;
}
