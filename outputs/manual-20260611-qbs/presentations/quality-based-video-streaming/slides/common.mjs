export const C = {
  ink: "#08111F",
  ink2: "#101C2C",
  paper: "#F6F2EA",
  paper2: "#EDE7DC",
  cyan: "#36D1DC",
  coral: "#FF6B5F",
  lime: "#B7F16A",
  gold: "#FFD166",
  slate: "#8EA3B8",
  muted: "#54677C",
  white: "#FFFFFF",
};

export function bg(slide, ctx, color = C.ink) {
  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 720, fill: color, line: ctx.line() });
}

export function footer(slide, ctx, n, source = "Source: local project files and generated results") {
  ctx.addText(slide, { x: 54, y: 676, w: 760, h: 20, text: source, fontSize: 10, color: C.slate, typeface: ctx.fonts.body });
  ctx.addText(slide, { x: 1172, y: 676, w: 54, h: 20, text: String(n).padStart(2, "0"), fontSize: 11, color: C.slate, typeface: ctx.fonts.mono, align: "right" });
}

export function kicker(slide, ctx, text, color = C.cyan) {
  ctx.addShape(slide, { x: 56, y: 42, w: 10, h: 10, fill: color, line: ctx.line(), name: "kicker-marker" });
  ctx.addText(slide, { x: 76, y: 35, w: 320, h: 24, text, fontSize: 12, color, bold: true, typeface: ctx.fonts.body, valign: "middle", name: "kicker-label" });
}

export function title(slide, ctx, text, dark = false) {
  ctx.addText(slide, { x: 54, y: 76, w: 820, h: 116, text, fontSize: 42, color: dark ? C.ink : C.paper, bold: true, typeface: ctx.fonts.title, insets: { left: 0, right: 0, top: 0, bottom: 0 } });
}

export function note(slide, ctx, text, x, y, w, h, color = C.slate, size = 18) {
  ctx.addText(slide, { x, y, w, h, text, fontSize: size, color, typeface: ctx.fonts.body, insets: { left: 0, right: 0, top: 0, bottom: 0 } });
}

export function metric(slide, ctx, x, y, w, label, value, color = C.cyan, dark = false) {
  ctx.addShape(slide, { x, y, w, h: 92, fill: dark ? C.paper : "#0F2032", line: ctx.line(color, 1) });
  ctx.addText(slide, { x: x + 18, y: y + 10, w: w - 36, h: 34, text: value, fontSize: 28, color, bold: true, typeface: ctx.fonts.title });
  ctx.addText(slide, { x: x + 18, y: y + 51, w: w - 36, h: 22, text: label, fontSize: 12, color: dark ? C.muted : C.slate, typeface: ctx.fonts.body });
}

export function pill(slide, ctx, x, y, w, h, text, color, fill = "#102236") {
  ctx.addShape(slide, { x, y, w, h, fill, line: ctx.line(color, 1) });
  ctx.addText(slide, { x: x + 14, y: y + 7, w: w - 28, h: h - 14, text, fontSize: 14, color, bold: true, valign: "middle", typeface: ctx.fonts.body });
}

export function arrow(slide, ctx, x1, y1, x2, y2, color = C.cyan) {
  const w = Math.max(1, x2 - x1);
  ctx.addShape(slide, { geometry: "line", x: x1, y: y1, w, h: y2 - y1, fill: "#00000000", line: ctx.line(color, 2) });
  ctx.addShape(slide, { x: x2 - 6, y: y2 - 5, w: 10, h: 10, fill: color, line: ctx.line(), geometry: "triangle" });
}
