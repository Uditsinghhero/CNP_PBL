import { C, bg, footer, kicker, title, note } from "./common.mjs";

export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, C.paper);
  kicker(slide, ctx, "NOVELTY", C.coral);
  title(slide, ctx, "Our new contribution is a hybrid ML + QoS-risk guard, not just another bitrate switch.", true);

  const headers = ["Existing method", "Decision basis", "Weakness", "What we added"];
  const widths = [220, 260, 285, 330];
  const x0 = 62;
  const y0 = 224;
  let x = x0;
  headers.forEach((h, i) => {
    ctx.addShape(slide, { x, y: y0, w: widths[i], h: 44, fill: C.ink, line: ctx.line(C.ink, 1) });
    ctx.addText(slide, { x: x + 12, y: y0 + 12, w: widths[i] - 24, h: 18, text: h, fontSize: 14, color: C.paper, bold: true, typeface: ctx.fonts.body });
    x += widths[i];
  });

  const rows = [
    ["Throughput ABR", "recent bandwidth estimate", "reactive; can over-upgrade during drops", "uses throughput trend plus risk cap"],
    ["Buffer ABR", "buffer occupancy", "ignores RTT, jitter, and packet loss", "scores multi-signal QoS risk"],
    ["dash.js default ABR", "player-side ABR rules", "less explainable in our demo", "logs confidence, risk, and reason"],
    ["Plain ML classifier", "model output only", "optimistic predictions can be unsafe", "guard holds/downshifts when risk is high"],
  ];
  rows.forEach((row, r) => {
    let cx = x0;
    row.forEach((cell, i) => {
      const fill = i === 3 ? "#DDF8EA" : "#FFFFFF";
      const line = i === 3 ? C.lime : "#D2D8DE";
      ctx.addShape(slide, { x: cx, y: y0 + 44 + r * 62, w: widths[i], h: 62, fill, line: ctx.line(line, 1) });
      ctx.addText(slide, { x: cx + 12, y: y0 + 58 + r * 62, w: widths[i] - 24, h: 34, text: cell, fontSize: i === 0 ? 15 : 13, color: C.ink, bold: i === 0, typeface: ctx.fonts.body });
      cx += widths[i];
    });
  });

  ctx.addShape(slide, { x: 94, y: 526, w: 1010, h: 74, fill: "#102236", line: ctx.line(C.coral, 1) });
  ctx.addText(slide, { x: 124, y: 548, w: 180, h: 24, text: "Novel methodology", fontSize: 20, color: C.coral, bold: true, typeface: ctx.fonts.title });
  note(slide, ctx, "Random Forest predicts quality; QoS-Risk Guard computes a 0-1 risk score from low buffer, throughput drop, high RTT, packet loss, and jitter, then caps unsafe upgrades or triggers downshift.", 330, 542, 720, 38, C.paper, 16);

  footer(slide, ctx, 10, "Source: updated ai_model.py PredictionResult risk_score and protection_action");
  return slide;
}
