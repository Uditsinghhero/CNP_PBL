import { C, bg, footer, kicker, title, metric, note } from "./common.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  kicker(slide, ctx, "RESULTS", C.lime);
  title(slide, ctx, "Logged sessions show adaptive decisions under constrained network conditions.", true);
  metric(slide, ctx, 58, 198, 166, "samples", "177", C.gold, true);
  metric(slide, ctx, 240, 198, 166, "avg throughput", "2.199", C.cyan, true);
  metric(slide, ctx, 422, 198, 166, "avg buffer", "10.255s", C.lime, true);
  metric(slide, ctx, 604, 198, 166, "avg latency", "72.928ms", C.coral, true);
  metric(slide, ctx, 786, 198, 166, "low-buffer events", "63", C.gold, true);
  metric(slide, ctx, 968, 198, 166, "avg confidence", "0.882", C.cyan, true);
  await ctx.addImage(slide, { path: "C:/Users/acer/OneDrive/Desktop/CNP PBL/results/bandwidth_vs_time.png", x: 86, y: 348, w: 500, h: 200, fit: "contain", alt: "Bandwidth vs time result graph" });
  await ctx.addImage(slide, { path: "C:/Users/acer/OneDrive/Desktop/CNP PBL/results/bitrate_vs_time.png", x: 674, y: 348, w: 500, h: 200, fit: "contain", alt: "Selected bitrate vs time result graph" });
  note(slide, ctx, "Quality selection changes as measured throughput varies, while AI confidence remains high on average.", 86, 574, 930, 30, C.muted, 17);
  footer(slide, ctx, 8, "Source: results/qos_summary.csv, results/bandwidth_vs_time.png, results/bitrate_vs_time.png");
  return slide;
}
