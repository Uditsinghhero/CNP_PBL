import { C, bg, footer, kicker, title, note, metric } from "./common.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  kicker(slide, ctx, "DASH ENCODING", C.coral);
  title(slide, ctx, "A real bitrate ladder lets the AI choose actual playable representations.", true);
  note(slide, ctx, "generate_dash.py uses FFmpeg to create a manifest and segmented .m4s streams at multiple resolutions.", 58, 214, 760, 50, C.muted, 19);
  const levels = [
    ["240p", "400 kbps", 142, C.coral],
    ["360p", "1000 kbps", 242, C.gold],
    ["720p", "2500 kbps", 382, C.cyan],
    ["1080p", "6000 kbps", 570, C.lime],
  ];
  levels.forEach(([q, br, h, color], i) => {
    const x = 120 + i * 235;
    ctx.addShape(slide, { x, y: 560 - h / 2, w: 155, h: h / 2, fill: color, line: ctx.line(C.ink, 1) });
    ctx.addText(slide, { x, y: 582, w: 155, h: 24, text: q, fontSize: 24, color: C.ink, bold: true, align: "center", typeface: ctx.fonts.title });
    ctx.addText(slide, { x, y: 612, w: 155, h: 20, text: br, fontSize: 14, color: C.muted, align: "center", typeface: ctx.fonts.mono });
  });
  metric(slide, ctx, 1030, 306, 170, "segment duration", "4 sec", C.cyan, true);
  metric(slide, ctx, 1030, 424, 170, "manifest", "MPD", C.coral, true);
  footer(slide, ctx, 4, "Source: generate_dash.py encoding ladder and media/dash outputs");
  return slide;
}
