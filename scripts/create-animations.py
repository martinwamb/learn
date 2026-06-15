#!/usr/bin/env python3
"""
Generate Synfig .sif XML files for Jina the Giraffe mascot.
6 animation states rendered to WebM by render-animations.sh.

Coordinate system: -4 to 4 in x and y (0,0 = center).
Y axis: positive = UP.  Canvas: 480x480 px, 60px/unit.
"""
import os, math, textwrap

OUT = "/tmp/synfig-anim"
os.makedirs(OUT, exist_ok=True)

# ── colour palette ───────────────────────────────────────────────────────────
C = {
    "bg":       (0.22, 0.75, 0.62),   # teal
    "shadow":   (0.15, 0.55, 0.45),
    "body":     (0.97, 0.76, 0.22),   # giraffe yellow
    "spot":     (0.58, 0.32, 0.08),   # brown spots
    "hooves":   (0.30, 0.18, 0.05),
    "nose_tip": (0.82, 0.55, 0.25),
    "ear_in":   (0.98, 0.72, 0.78),   # pink inner ear
    "eye_w":    (1.00, 1.00, 1.00),
    "pupil":    (0.08, 0.04, 0.02),
    "shine":    (1.00, 1.00, 1.00),
    "mouth":    (0.55, 0.28, 0.06),
    "star":     (1.00, 0.92, 0.10),
    "star2":    (1.00, 0.55, 0.10),
    "green_bg": (0.20, 0.68, 0.45),
}

# ── XML helpers ──────────────────────────────────────────────────────────────
def vec(x, y):
    return f"<vector><x>{x:.4f}</x><y>{y:.4f}</y></vector>"

def color(r, g, b, a=1.0):
    return f"<color><r>{r:.4f}</r><g>{g:.4f}</g><b>{b:.4f}</b><a>{a:.4f}</a></color>"

def real(v):
    return f"<real value=\"{v:.6f}\"/>"

def boolean(v):
    return f"<bool value=\"{'true' if v else 'false'}\"/>"

def integer(v):
    return f"<integer value=\"{v}\"/>"

def param(name, content):
    return f"<param name=\"{name}\">{content}</param>"

def waypoint(time, interp, content):
    return (f'<waypoint time="{time}" before="{interp}" after="{interp}">'
            f'{content}</waypoint>')

def animated_vec(waypoints):
    wps = "".join(waypoint(t, ip, vec(x, y)) for t, ip, x, y in waypoints)
    return f'<animated type="vector">{wps}</animated>'

def animated_real(waypoints):
    wps = "".join(waypoint(t, ip, real(v)) for t, ip, v in waypoints)
    return f'<animated type="real">{wps}</animated>'

def animated_color(waypoints):
    wps = "".join(waypoint(t, ip, color(*c)) for t, ip, c in waypoints)
    return f'<animated type="color">{wps}</animated>'

# ── layer builders ───────────────────────────────────────────────────────────
def circle_layer(desc, col, ox, oy, radius,
                 origin_anim=None, radius_anim=None, amount=1.0):
    o = animated_vec(origin_anim) if origin_anim else vec(ox, oy)
    r = animated_real(radius_anim) if radius_anim else real(radius)
    return f"""
<layer type="circle" desc="{desc}">
  {param("z_depth", real(0))}
  {param("amount", real(amount))}
  {param("blend_method", integer(0))}
  {param("color", color(*col))}
  {param("origin", o)}
  {param("invert", boolean(False))}
  {param("radius", r)}
</layer>"""

def rect_layer(desc, col, x1, y1, x2, y2, origin_anim=None):
    if origin_anim:
        # rect doesn't animate easily — wrap in translate group instead
        pass
    return f"""
<layer type="rectangle" desc="{desc}">
  {param("z_depth", real(0))}
  {param("amount", real(1))}
  {param("blend_method", integer(0))}
  {param("color", color(*col))}
  {param("point1", vec(x1, y1))}
  {param("point2", vec(x2, y2))}
  {param("expand", real(0))}
  {param("invert", boolean(False))}
</layer>"""

def region_layer(desc, col, points):
    """Closed polygon filled region."""
    vlist = "".join(f"<vector><x>{x:.4f}</x><y>{y:.4f}</y></vector>" for x, y in points)
    return f"""
<layer type="region" desc="{desc}">
  {param("z_depth", real(0))}
  {param("amount", real(1))}
  {param("blend_method", integer(0))}
  {param("color", color(*col))}
  <param name="vertices"><static_list type="vector">{vlist}</static_list></param>
  {param("origin", vec(0, 0))}
  {param("invert", boolean(False))}
</layer>"""

def group_layer(desc, children, offset_anim=None, ox=0, oy=0,
                angle_anim=None, scale_anim=None):
    off = animated_vec(offset_anim) if offset_anim else vec(ox, oy)
    ang = animated_real(angle_anim) if angle_anim else real(0)
    sc  = animated_real(scale_anim) if scale_anim else real(1)
    inner = "".join(children)
    return f"""
<layer type="group" desc="{desc}">
  {param("z_depth", real(0))}
  {param("amount", real(1))}
  {param("blend_method", integer(0))}
  <param name="transformation">
    <composite type="transformation">
      <param name="offset">{off}</param>
      <param name="angle">{ang}</param>
      <param name="skew_angle">{real(0)}</param>
      <param name="scale">{vec(1 if scale_anim is None else 1, 1 if scale_anim is None else 1)}</param>
    </composite>
  </param>
  <param name="canvas"><canvas>{inner}</canvas></param>
  {param("time_dilation", real(1))}
  {param("time_offset", real(0))}
  {param("children_lock", boolean(False))}
  {param("outline_grow", real(0))}
</layer>"""

# ── reusable character parts ─────────────────────────────────────────────────
def bg_layer():
    return rect_layer("Background", C["bg"], -4, -4, 4, 4)

def shadow_layer():
    """Ellipse shadow on ground."""
    return circle_layer("Shadow", C["shadow"], 0.0, -3.1, 0.8,
                        radius_anim=[("0s","linear",0.8),("3s","linear",0.8)],
                        amount=0.5)

def legs():
    legs_list = [
        rect_layer("Leg FL", C["body"],   -0.55, -1.8, -0.25, -3.0),
        rect_layer("Leg FR", C["body"],    0.05, -1.8,  0.35, -3.0),
        rect_layer("Leg BL", C["body"],   -0.85, -1.7, -0.55, -2.85),
        rect_layer("Leg BR", C["body"],    0.35, -1.7,  0.65, -2.85),
        rect_layer("Hoof FL", C["hooves"],-0.55, -2.85,-0.25, -3.05),
        rect_layer("Hoof FR", C["hooves"], 0.05, -2.85, 0.35, -3.05),
        rect_layer("Hoof BL", C["hooves"],-0.85, -2.70,-0.55, -2.90),
        rect_layer("Hoof BR", C["hooves"], 0.35, -2.70, 0.65, -2.90),
    ]
    return "".join(legs_list)

def body():
    return circle_layer("Body", C["body"], 0.0, -1.2, 1.15)

def spots():
    s = [
        circle_layer("Spot1", C["spot"], -0.6, -0.8, 0.22),
        circle_layer("Spot2", C["spot"],  0.5, -1.1, 0.18),
        circle_layer("Spot3", C["spot"],  0.1, -0.4, 0.15),
        circle_layer("Spot4", C["spot"], -0.3, -1.6, 0.16),
        circle_layer("Spot5", C["spot"],  0.6, -1.8, 0.13),
        # neck spots
        circle_layer("Spot6", C["spot"], -0.18, 0.35, 0.11),
        circle_layer("Spot7", C["spot"],  0.20, 0.70, 0.10),
    ]
    return "".join(s)

def neck():
    return region_layer("Neck", C["body"], [
        (-0.38, -0.3), (0.38, -0.3),
        (0.28, 1.55), (-0.28, 1.55),
    ])

def ears(left_angle_anim=None, right_angle_anim=None):
    left_ear = group_layer("Ear L",
        [circle_layer("EarL outer", C["body"],    0, 0, 0.28),
         circle_layer("EarL inner", C["ear_in"],  0, 0, 0.15)],
        ox=-0.52, oy=2.58,
        angle_anim=left_angle_anim)
    right_ear = group_layer("Ear R",
        [circle_layer("EarR outer", C["body"],    0, 0, 0.28),
         circle_layer("EarR inner", C["ear_in"],  0, 0, 0.15)],
        ox=0.52, oy=2.58,
        angle_anim=right_angle_anim)
    return left_ear + right_ear

def ossicones():
    return (
        rect_layer("OssiconeL", C["spot"], -0.44, 2.68, -0.32, 2.98) +
        rect_layer("OssiconeR", C["spot"],  0.32, 2.68,  0.44, 2.98) +
        circle_layer("OssiconeL tip", C["spot"], -0.38, 3.0, 0.1) +
        circle_layer("OssiconeR tip", C["spot"],  0.38, 3.0, 0.1)
    )

def head(y_anim=None):
    y = 2.15
    anim = y_anim  # list of (time, interp, x, y) tuples for head group offset
    children = [
        circle_layer("Head", C["body"], 0, 0, 0.72),
        circle_layer("Cheek L", C["body"], -0.38, -0.22, 0.32),
        circle_layer("Cheek R", C["body"],  0.38, -0.22, 0.32),
        circle_layer("Muzzle", C["nose_tip"], 0, -0.42, 0.32),
        circle_layer("Nostril L", C["spot"], -0.14, -0.45, 0.09),
        circle_layer("Nostril R", C["spot"],  0.14, -0.45, 0.09),
    ]
    return group_layer("Head", children,
                       offset_anim=anim if anim else None,
                       ox=0, oy=y)

def eyes(blink_anim_l=None, blink_anim_r=None,
         pupil_y_anim_l=None, pupil_y_anim_r=None):
    # Each eye: white + pupil + shine, grouped so we can scale for blink
    def make_eye(side, ex, blink, pupil_ya):
        white  = circle_layer(f"Eye{side} white",  C["eye_w"],  0,  0, 0.20)
        pupil_y = 0
        pupil = circle_layer(f"Eye{side} pupil", C["pupil"],
                             0, pupil_y, 0.11,
                             origin_anim=pupil_ya)
        shine  = circle_layer(f"Eye{side} shine",  C["shine"],  0.06, 0.07, 0.05)
        # scale y for blink
        sc = blink  # list of (time, interp, val) for y-scale
        # Hack: wrap in a group and use the scale.y via transformation
        # We'll animate amount for a simpler blink
        amount_layers = [white, pupil, shine]
        if blink:
            # Use a scale-y group
            inner = "".join(amount_layers)
            # Build scale animated as vec for transformation scale param
            sc_waypoints = "".join(
                f'<waypoint time="{t}" before="{ip}" after="{ip}">'
                f'{vec(1, v)}</waypoint>'
                for t, ip, v in blink
            )
            sc_anim = f'<animated type="vector">{sc_waypoints}</animated>'
            return f"""
<layer type="group" desc="Eye{side}">
  {param("z_depth", real(0))}
  {param("amount", real(1))}
  {param("blend_method", integer(0))}
  <param name="transformation">
    <composite type="transformation">
      <param name="offset">{vec(ex, 0)}</param>
      <param name="angle">{real(0)}</param>
      <param name="skew_angle">{real(0)}</param>
      <param name="scale">{sc_anim}</param>
    </composite>
  </param>
  <param name="canvas"><canvas>{inner}</canvas></param>
  {param("time_dilation", real(1))}
  {param("time_offset", real(0))}
  {param("children_lock", boolean(False))}
  {param("outline_grow", real(0))}
</layer>"""
        else:
            return group_layer(f"Eye{side}", amount_layers, ox=ex, oy=0)

    return make_eye("L", -0.30, blink_anim_l, pupil_y_anim_l) + \
           make_eye("R",  0.30, blink_anim_r, pupil_y_anim_r)

def mouth_smile(open_anim=None):
    """Simple smile using a region (arc approximated by polygon)."""
    def arc_points(cx, cy, rx, ry, a_start, a_end, n=8, open_h=0):
        pts = []
        for i in range(n + 1):
            a = a_start + (a_end - a_start) * i / n
            pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a) - open_h))
        return pts

    # Static smile for now — animate with different region files per state
    smile_pts = arc_points(0, -0.55, 0.22, 0.15, math.pi, 2 * math.pi)
    # close it
    smile_pts.append(smile_pts[0])
    return region_layer("Mouth", C["mouth"], smile_pts)

def mouth_open():
    """Wider open mouth for talking."""
    def arc_points(cx, cy, rx, ry, a_start, a_end, n=8):
        pts = []
        for i in range(n + 1):
            a = a_start + (a_end - a_start) * i / n
            pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
        return pts

    top = arc_points(0, -0.48, 0.24, 0.08, math.pi, 2*math.pi)
    bot = arc_points(0, -0.56, 0.22, 0.16, 0, math.pi)
    pts = top + bot[::-1]
    return region_layer("MouthOpen", C["mouth"], pts)

def stars(n=5, t_appear="0s"):
    """Burst of star circles for correct/celebrate."""
    s = []
    for i in range(n):
        angle = 2 * math.pi * i / n
        r = 1.0 + 0.3 * (i % 2)
        x = r * math.cos(angle)
        y = r * math.sin(angle) - 0.5
        col = C["star"] if i % 2 == 0 else C["star2"]
        s.append(circle_layer(f"Star{i}", col, x, y, 0.18,
                              radius_anim=[
                                  (t_appear, "linear", 0.0),
                                  (f"{float(t_appear[:-1])+0.2:.1f}s", "linear", 0.22),
                                  ("2s", "linear", 0.22),
                              ]))
    return "".join(s)

# ── canvas wrapper ───────────────────────────────────────────────────────────
def canvas(end_time, fps, layers):
    inner = "".join(layers)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<canvas version="1.2" width="480" height="480" fps="{fps}" begin-time="0" end-time="{end_time}" bgcolor="0 0 0 1">
  <name>Jina the Giraffe</name>
{inner}
</canvas>"""

# ── full character stack (base, no anim params) ──────────────────────────────
def giraffe_base(head_offset=None, body_offset=None,
                 blink_l=None, blink_r=None,
                 pupil_ya_l=None, pupil_ya_r=None,
                 ear_la=None, ear_ra=None,
                 use_open_mouth=False,
                 show_stars=False):

    head_children = [
        circle_layer("Head", C["body"], 0, 0, 0.72),
        circle_layer("Cheek L", C["body"], -0.38, -0.22, 0.32),
        circle_layer("Cheek R", C["body"],  0.38, -0.22, 0.32),
        circle_layer("Muzzle", C["nose_tip"], 0, -0.42, 0.32),
        circle_layer("Nostril L", C["spot"], -0.14, -0.45, 0.09),
        circle_layer("Nostril R", C["spot"],  0.14, -0.45, 0.09),
        eyes(blink_l, blink_r, pupil_ya_l, pupil_ya_r),
        mouth_open() if use_open_mouth else mouth_smile(),
    ]
    head_grp = group_layer("Head group", head_children,
                            offset_anim=head_offset,
                            ox=0, oy=2.15)

    body_children = [
        bg_layer(),
        shadow_layer(),
        legs(),
        neck(),
        body(),
        spots(),
        ears(ear_la, ear_ra),
        ossicones(),
        head_grp,
    ]
    if show_stars:
        body_children.insert(1, stars(6, "0s"))

    if body_offset:
        return group_layer("Giraffe", body_children,
                           offset_anim=body_offset)
    return "".join(body_children)

# ══════════════════════════════════════════════════════════════════════════════
# Animation definitions
# ══════════════════════════════════════════════════════════════════════════════

def make_idle():
    """3s loop: gentle body bob + slow blink at 2.5s."""
    body_bob = [
        ("0s",   "linear", 0, 0),
        ("0.75s","linear", 0, 0.07),
        ("1.5s", "linear", 0, 0),
        ("2.25s","linear", 0, -0.04),
        ("3s",   "linear", 0, 0),
    ]
    blink = [
        ("0s",    "linear", 1.0),
        ("2.4s",  "linear", 1.0),
        ("2.5s",  "linear", 0.05),
        ("2.6s",  "linear", 1.0),
        ("3s",    "linear", 1.0),
    ]
    return canvas("3s", 24, [giraffe_base(body_offset=body_bob,
                                          blink_l=blink, blink_r=blink)])

def make_talking():
    """2s loop: mouth alternates open/closed, ears wiggle."""
    body_bob = [
        ("0s",   "linear", 0, 0),
        ("0.5s", "linear", 0, 0.04),
        ("1s",   "linear", 0, 0),
        ("1.5s", "linear", 0, 0.04),
        ("2s",   "linear", 0, 0),
    ]
    ear_l = [
        ("0s",   "linear", 5.0),
        ("0.4s", "linear",-5.0),
        ("0.8s", "linear", 5.0),
        ("1.2s", "linear",-5.0),
        ("1.6s", "linear", 5.0),
        ("2s",   "linear", 5.0),
    ]
    ear_r = [
        ("0s",   "linear",-5.0),
        ("0.4s", "linear", 5.0),
        ("0.8s", "linear",-5.0),
        ("1.2s", "linear", 5.0),
        ("1.6s", "linear",-5.0),
        ("2s",   "linear",-5.0),
    ]
    # Alternate open/closed mouth via two versions — use open mouth throughout
    # and animate the head up/down slightly (talking rhythm)
    head_bob = [
        ("0s",   "linear", 0, 0),
        ("0.25s","linear", 0, 0.05),
        ("0.5s", "linear", 0, 0),
        ("0.75s","linear", 0, 0.05),
        ("1s",   "linear", 0, 0),
        ("1.25s","linear", 0, 0.05),
        ("1.5s", "linear", 0, 0),
        ("1.75s","linear", 0, 0.05),
        ("2s",   "linear", 0, 0),
    ]
    return canvas("2s", 24, [giraffe_base(
        body_offset=body_bob,
        head_offset=head_bob,
        ear_la=ear_l, ear_ra=ear_r,
        use_open_mouth=True)])

def make_thinking():
    """2s loop: pupils look up, tail-ear twitch, slight head tilt."""
    pupil_up_l = [
        ("0s",   "linear", 0, 0.0),
        ("0.6s", "linear", 0, 0.06),
        ("1.6s", "linear", 0, 0.06),
        ("2s",   "linear", 0, 0.0),
    ]
    pupil_up_r = pupil_up_l[:]
    ear_l = [
        ("0s",  "linear", 0),
        ("0.5s","linear",-8),
        ("1s",  "linear", 0),
        ("1.5s","linear",-8),
        ("2s",  "linear", 0),
    ]
    head_tilt = [
        ("0s",   "linear", 0,  0),
        ("0.8s", "linear", 0.1,0.05),
        ("1.6s", "linear", 0,  0),
        ("2s",   "linear", 0,  0),
    ]
    return canvas("2s", 24, [giraffe_base(
        head_offset=head_tilt,
        pupil_ya_l=pupil_up_l,
        pupil_ya_r=pupil_up_r,
        ear_la=ear_l)])

def make_correct():
    """2s one-shot: jump up + stars appear."""
    body_jump = [
        ("0s",   "linear", 0, 0),
        ("0.3s", "linear", 0, 0.6),
        ("0.7s", "linear", 0, 0),
        ("0.9s", "linear", 0, 0.25),
        ("1.1s", "linear", 0, 0),
        ("2s",   "linear", 0, 0),
    ]
    blink_happy = [
        ("0s",  "linear", 1.0),
        ("0.1s","linear", 0.08),
        ("0.2s","linear", 1.0),
        ("2s",  "linear", 1.0),
    ]
    return canvas("2s", 24, [giraffe_base(
        body_offset=body_jump,
        blink_l=blink_happy, blink_r=blink_happy,
        show_stars=True)])

def make_wrong():
    """2s one-shot: gentle head shake."""
    head_shake = [
        ("0s",   "linear",  0,   0),
        ("0.2s", "linear", -0.3, 0),
        ("0.5s", "linear",  0.3, 0),
        ("0.8s", "linear", -0.2, 0),
        ("1.1s", "linear",  0.1, 0),
        ("1.4s", "linear",  0,   0),
        ("2s",   "linear",  0,   0),
    ]
    blink_sad = [
        ("0s",  "linear", 1.0),
        ("0.15s","linear",0.08),
        ("0.3s","linear", 1.0),
        ("1.8s","linear", 1.0),
        ("1.9s","linear", 0.08),
        ("2s",  "linear", 1.0),
    ]
    return canvas("2s", 24, [giraffe_base(
        head_offset=head_shake,
        blink_l=blink_sad, blink_r=blink_sad)])

def make_celebrate():
    """3s one-shot: big jump, bounce, stars."""
    body_cel = [
        ("0s",   "linear", 0,  0),
        ("0.4s", "linear", 0,  0.9),
        ("0.8s", "linear", 0, -0.1),
        ("1.1s", "linear", 0,  0.4),
        ("1.4s", "linear", 0,  0),
        ("1.7s", "linear", 0,  0.15),
        ("2.0s", "linear", 0,  0),
        ("3s",   "linear", 0,  0),
    ]
    blink_cel = [
        ("0s",  "linear", 1.0),
        ("0.05s","linear",0.05),
        ("0.15s","linear",1.0),
        ("0.9s","linear", 1.0),
        ("0.95s","linear",0.05),
        ("1.05s","linear",1.0),
        ("3s",  "linear", 1.0),
    ]
    ear_party_l = [
        ("0s",   "linear",  0),
        ("0.2s", "linear",-20),
        ("0.5s", "linear", 15),
        ("0.8s", "linear",-10),
        ("1.2s", "linear",  5),
        ("1.5s", "linear",  0),
        ("3s",   "linear",  0),
    ]
    ear_party_r = [(t, i, -v) for t, i, v in ear_party_l]
    return canvas("3s", 24, [giraffe_base(
        body_offset=body_cel,
        blink_l=blink_cel, blink_r=blink_cel,
        ear_la=ear_party_l, ear_ra=ear_party_r,
        show_stars=True)])

# ── write all files ──────────────────────────────────────────────────────────
animations = {
    "idle":      make_idle,
    "talking":   make_talking,
    "thinking":  make_thinking,
    "correct":   make_correct,
    "wrong":     make_wrong,
    "celebrate": make_celebrate,
}

for name, fn in animations.items():
    path = os.path.join(OUT, f"{name}.sif")
    xml = fn()
    with open(path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  wrote {path}")

print(f"\nAll {len(animations)} SIF files written to {OUT}/")
