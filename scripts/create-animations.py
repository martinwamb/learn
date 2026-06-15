#!/usr/bin/env python3
"""
Generate Synfig .sif files for Jina the Giraffe.
Uses ONLY circle and rectangle layers — no group layers, no composites, no bline regions.
Each animation shares the same time-key set so waypoint merging is trivial.
"""
import os, math

OUT = "/tmp/synfig-anim"
os.makedirs(OUT, exist_ok=True)

# ── colours ───────────────────────────────────────────────────────────────────
def col(r, g, b, a=1.0):
    return f"<color><r>{r:.4f}</r><g>{g:.4f}</g><b>{b:.4f}</b><a>{a:.4f}</a></color>"

BODY   = col(0.97, 0.76, 0.22)
SPOT   = col(0.58, 0.32, 0.08)
HOOVES = col(0.30, 0.18, 0.05)
NOSE   = col(0.90, 0.62, 0.30)
EAR_IN = col(0.98, 0.72, 0.78)
EYE_W  = col(1.00, 1.00, 1.00)
PUPIL  = col(0.08, 0.04, 0.02)
SHINE  = col(1.00, 1.00, 1.00)
BG     = col(0.22, 0.75, 0.62)
SHADOW = col(0.12, 0.52, 0.42)
STAR_Y = col(1.00, 0.92, 0.10)
STAR_O = col(1.00, 0.55, 0.10)
MOUTH  = col(0.40, 0.18, 0.04)

# ── XML primitives ─────────────────────────────────────────────────────────────
def V(x, y):
    return f"<vector><x>{x:.5f}</x><y>{y:.5f}</y></vector>"

def circle_xml(desc, color, ox, oy, r, orig_wps=None, rad_wps=None, amount=1.0):
    """
    orig_wps : list[(time_str, x, y)]  → animated origin
    rad_wps  : list[(time_str, r)]     → animated radius
    """
    if orig_wps:
        body = "".join(
            f'<waypoint time="{t}" before="linear" after="linear">{V(x,y)}</waypoint>'
            for t, x, y in orig_wps)
        o = f'<animated type="vector">{body}</animated>'
    else:
        o = V(ox, oy)

    if rad_wps:
        body = "".join(
            f'<waypoint time="{t}" before="linear" after="linear">'
            f'<real value="{rv:.5f}"/></waypoint>'
            for t, rv in rad_wps)
        rv_xml = f'<animated type="real">{body}</animated>'
    else:
        rv_xml = f'<real value="{r:.5f}"/>'

    return (f'<layer type="circle" desc="{desc}">'
            f'<param name="z_depth"><real value="0.0"/></param>'
            f'<param name="amount"><real value="{amount:.2f}"/></param>'
            f'<param name="blend_method"><integer value="0"/></param>'
            f'<param name="color">{color}</param>'
            f'<param name="origin">{o}</param>'
            f'<param name="invert"><bool value="false"/></param>'
            f'<param name="radius">{rv_xml}</param>'
            f'</layer>')

def rect_xml(desc, color, x1, y1, x2, y2, p1_wps=None, p2_wps=None):
    """
    p1_wps : list[(time_str, x, y)]  → animated point1
    p2_wps : list[(time_str, x, y)]  → animated point2
    """
    if p1_wps:
        body = "".join(
            f'<waypoint time="{t}" before="linear" after="linear">{V(x,y)}</waypoint>'
            for t, x, y in p1_wps)
        p1 = f'<animated type="vector">{body}</animated>'
    else:
        p1 = V(x1, y1)

    if p2_wps:
        body = "".join(
            f'<waypoint time="{t}" before="linear" after="linear">{V(x,y)}</waypoint>'
            for t, x, y in p2_wps)
        p2 = f'<animated type="vector">{body}</animated>'
    else:
        p2 = V(x2, y2)

    return (f'<layer type="rectangle" desc="{desc}">'
            f'<param name="z_depth"><real value="0.0"/></param>'
            f'<param name="amount"><real value="1.0"/></param>'
            f'<param name="blend_method"><integer value="0"/></param>'
            f'<param name="color">{color}</param>'
            f'<param name="point1">{p1}</param>'
            f'<param name="point2">{p2}</param>'
            f'<param name="expand"><real value="0.0"/></param>'
            f'<param name="invert"><bool value="false"/></param>'
            f'</layer>')

def canvas_xml(end_time, fps, layers):
    return (f'<?xml version="1.0" encoding="UTF-8"?>'
            f'<canvas version="1.2" width="480" height="480" '
            f'fps="{fps}" begin-time="0" end-time="{end_time}" '
            f'bgcolor="0 0 0 1"><name>Jina the Giraffe</name>'
            + "".join(layers) + '</canvas>')

# ── Animation builder ────────────────────────────────────────────────────────
#
# Each clip passes per-keyframe offset lists where every list shares the SAME
# time strings — element-wise addition, no interpolation needed.
#
# body_ofs  : [(t, dx, dy), ...]  applied to body circle + body spots
# head_ofs  : [(t, dx, dy), ...]  added ON TOP of body_ofs for head parts
# ear_l_ofs : [(t, dx, dy), ...]  added ON TOP of body_ofs for left ear
# ear_r_ofs : [(t, dx, dy), ...]  added ON TOP of body_ofs for right ear
# blink     : [(t, r), ...]       eye-white radius animation (independent timing)
# stars     : bool                animated star burst

# Giraffe base positions (1 unit = 60 px, canvas ±4 units):
HX, HY = 0.0, 2.18   # head centre
BX, BY = 0.0, -1.05  # body centre

def giraffe(
    end_time, fps,
    body_ofs=None,
    head_ofs=None,
    ear_l_ofs=None,
    ear_r_ofs=None,
    blink=None,
    stars=False,
):
    bo = body_ofs or []
    ho = head_ofs or []

    def merge(a, b):
        """Element-wise sum of two same-length offset lists."""
        if not a and not b:
            return []
        base = a if a else [(t, 0.0, 0.0) for t, dx, dy in b]
        extra = b if b else [(t, 0.0, 0.0) for t, dx, dy in a]
        return [(base[i][0],
                 base[i][1] + extra[i][1],
                 base[i][2] + extra[i][2])
                for i in range(len(base))]

    body_combined  = bo
    head_combined  = merge(bo, ho)
    ear_l_combined = merge(bo, ear_l_ofs or [])
    ear_r_combined = merge(bo, ear_r_ofs or [])

    def orig(bx, by, ofs):
        if not ofs:
            return None
        return [(t, bx+dx, by+dy) for t, dx, dy in ofs]

    def rect_anim(x1, y1, x2, y2, ofs):
        if not ofs:
            return None, None
        p1 = [(t, x1+dx, y1+dy) for t, dx, dy in ofs]
        p2 = [(t, x2+dx, y2+dy) for t, dx, dy in ofs]
        return p1, p2

    layers = []

    # ── background ──────────────────────────────────────────────────────────
    layers.append(rect_xml("BG", BG, -4, -4, 4, 4))

    # ── shadow ──────────────────────────────────────────────────────────────
    layers.append(circle_xml("Shadow", SHADOW, 0, -3.60, 0.88, amount=0.35))

    # ── stars ───────────────────────────────────────────────────────────────
    if stars:
        sc = [STAR_Y, STAR_O, STAR_Y, STAR_O, STAR_Y, STAR_O]
        for i in range(6):
            a = math.pi/6 + math.pi/3*i
            sr = 1.22 + 0.22*(i % 2)
            sx = sr * math.cos(a)
            sy = sr * math.sin(a) - 0.30
            grow = [("0s", 0.0), ("0.18s", 0.23), ("1.60s", 0.23), ("1.90s", 0.0)]
            layers.append(circle_xml(f"Star{i}", sc[i], sx, sy, 0.0, rad_wps=grow))

    # ── legs (static) ───────────────────────────────────────────────────────
    W = 0.27
    for i, (cx, ytop, yleg, yhoof) in enumerate([
        (-0.55, -1.52, -3.08, -3.42),
        ( 0.06, -1.52, -3.08, -3.42),
        (-0.80, -1.55, -2.98, -3.32),
        ( 0.32, -1.55, -2.98, -3.32),
    ]):
        layers.append(rect_xml(f"Leg{i}",  BODY,   cx-W, ytop, cx+W, yleg))
        layers.append(rect_xml(f"Hoof{i}", HOOVES, cx-W, yleg, cx+W, yhoof))

    # ── body ────────────────────────────────────────────────────────────────
    layers.append(circle_xml("Body", BODY, BX, BY, 1.18,
                             orig_wps=orig(BX, BY, body_combined)))

    # ── neck (static) ───────────────────────────────────────────────────────
    layers.append(rect_xml("Neck", BODY, -0.28, -0.25, 0.28, 1.50))

    # ── body spots ──────────────────────────────────────────────────────────
    for i, (sx, sy, sr) in enumerate([
        (-0.56, -0.68, 0.23), (0.50, -1.00, 0.19),
        ( 0.06, -0.32, 0.15), (-0.28, -1.55, 0.17),
        ( 0.60, -1.70, 0.13),
    ]):
        layers.append(circle_xml(f"Spot{i}", SPOT, sx, sy, sr,
                                orig_wps=orig(sx, sy, body_combined)))

    # ── neck spots (static) ─────────────────────────────────────────────────
    for i, (sx, sy, sr) in enumerate([(-0.16, 0.38, 0.10), (0.18, 0.72, 0.09)]):
        layers.append(circle_xml(f"NeckSpot{i}", SPOT, sx, sy, sr))

    # ── ears ────────────────────────────────────────────────────────────────
    for ename, ex, ey, e_ofs in [
        ("EarL", -0.55, 2.65, ear_l_combined),
        ("EarR",  0.55, 2.65, ear_r_combined),
    ]:
        ea = orig(ex, ey, e_ofs)
        layers.append(circle_xml(f"{ename}Outer", BODY,   ex, ey, 0.27, orig_wps=ea))
        layers.append(circle_xml(f"{ename}Inner", EAR_IN, ex, ey, 0.15, orig_wps=ea))

    # ── head ────────────────────────────────────────────────────────────────
    def H(desc, color, rx, ry, r, rad_wps=None, amount=1.0):
        ox, oy = HX+rx, HY+ry
        return circle_xml(desc, color, ox, oy, r,
                         orig_wps=orig(ox, oy, head_combined),
                         rad_wps=rad_wps, amount=amount)

    layers.append(H("Head",    BODY,  0.00,  0.00, 0.72))
    layers.append(H("CheekL",  BODY, -0.40, -0.22, 0.30))
    layers.append(H("CheekR",  BODY,  0.40, -0.22, 0.30))
    layers.append(H("Muzzle",  NOSE,  0.00, -0.46, 0.32))
    layers.append(H("NostrilL",SPOT, -0.13, -0.48, 0.08))
    layers.append(H("NostrilR",SPOT,  0.13, -0.48, 0.08))

    # mouth rect animated with head
    MX1, MY1 = HX-0.17, HY-0.64
    MX2, MY2 = HX+0.17, HY-0.56
    mp1, mp2 = rect_anim(MX1, MY1, MX2, MY2, head_combined)
    layers.append(rect_xml("Mouth", MOUTH, MX1, MY1, MX2, MY2,
                           p1_wps=mp1, p2_wps=mp2))

    # ── eyes (with optional blink) ───────────────────────────────────────────
    pupil_blink = [(t, rv * 0.56) for t, rv in blink] if blink else None
    for side, ex_rel in [("L", -0.28), ("R", 0.28)]:
        layers.append(H(f"Eye{side}White", EYE_W, ex_rel,       0.18, 0.18, rad_wps=blink))
        layers.append(H(f"Eye{side}Pupil", PUPIL, ex_rel+0.04,  0.18, 0.10, rad_wps=pupil_blink))
        layers.append(H(f"Eye{side}Shine", SHINE, ex_rel+0.08,  0.24, 0.04))

    # ── ossicones ───────────────────────────────────────────────────────────
    for side, ocx in [("L", -0.35), ("R", 0.35)]:
        op1, op2 = rect_anim(
            ocx-0.07, HY+0.55, ocx+0.07, HY+0.82,
            head_combined)
        layers.append(rect_xml(f"Ossicone{side}", SPOT,
                               ocx-0.07, HY+0.55, ocx+0.07, HY+0.82,
                               p1_wps=op1, p2_wps=op2))
        tip_ox, tip_oy = HX+ocx, HY+0.88
        layers.append(circle_xml(f"OssiconeTip{side}", SPOT,
                                tip_ox, tip_oy, 0.10,
                                orig_wps=orig(tip_ox, tip_oy, head_combined)))

    return canvas_xml(end_time, fps, layers)

# ══════════════════════════════════════════════════════════════════════════════
# Clip definitions — all offset lists within a clip share the same time keys
# ══════════════════════════════════════════════════════════════════════════════

def make_idle():
    T = ["0s", "0.75s", "1.5s", "2.25s", "3s"]
    DY = [0.00, 0.12, 0.00, -0.06, 0.00]
    body = [(T[i], 0.0, DY[i]) for i in range(5)]
    blink = [("0s",0.18),("2.38s",0.18),("2.46s",0.007),("2.54s",0.18),("3s",0.18)]
    # head_ofs=None → head follows body (merge adds zero extra)
    return giraffe("3s", 24, body_ofs=body, blink=blink)

def make_talking():
    T = ["0s","0.25s","0.5s","0.75s","1.0s","1.25s","1.5s","1.75s","2.0s"]
    BDY = [0.00, 0.07, 0.00, 0.07, 0.00, 0.07, 0.00, 0.07, 0.00]
    HDY = [0.00, 0.08, 0.00, 0.08, 0.00, 0.08, 0.00, 0.08, 0.00]
    ELX = [0.00,-0.12, 0.00, 0.12, 0.00,-0.12, 0.00, 0.12, 0.00]
    body  = [(T[i], 0.0, BDY[i]) for i in range(9)]
    head  = [(T[i], 0.0, HDY[i]) for i in range(9)]
    ear_l = [(T[i], ELX[i], 0.0) for i in range(9)]
    ear_r = [(T[i], -ELX[i], 0.0) for i in range(9)]
    return giraffe("2s", 24, body_ofs=body, head_ofs=head,
                   ear_l_ofs=ear_l, ear_r_ofs=ear_r)

def make_thinking():
    T = ["0s","0.5s","1.0s","1.5s","2.0s"]
    BDY = [0.00, 0.04, 0.00, 0.04, 0.00]
    HDX = [0.00, 0.14, 0.00,-0.10, 0.00]
    ELX = [0.00,-0.10, 0.00, 0.08, 0.00]
    body  = [(T[i], 0.0,    BDY[i]) for i in range(5)]
    head  = [(T[i], HDX[i], 0.0)   for i in range(5)]
    ear_l = [(T[i], ELX[i], 0.0)   for i in range(5)]
    return giraffe("2s", 24, body_ofs=body, head_ofs=head, ear_l_ofs=ear_l)

def make_correct():
    T = ["0s","0.28s","0.55s","0.80s","1.05s","2.0s"]
    BDY = [0.00, 0.38, -0.08, 0.18, 0.00, 0.00]
    body  = [(T[i], 0.0, BDY[i]) for i in range(6)]
    blink = [("0s",0.18),("0.10s",0.007),("0.22s",0.18),("2.0s",0.18)]
    return giraffe("2s", 24, body_ofs=body, blink=blink, stars=True)

def make_wrong():
    T = ["0s","0.20s","0.45s","0.70s","1.00s","1.30s","2.0s"]
    HDX = [0.00,-0.34, 0.30,-0.22, 0.10, 0.00, 0.00]
    body  = [(t, 0.0, 0.0) for t in T]
    head  = [(T[i], HDX[i], 0.0) for i in range(7)]
    blink = [("0s",0.18),("0.12s",0.007),("0.24s",0.18),("2.0s",0.18)]
    return giraffe("2s", 24, body_ofs=body, head_ofs=head, blink=blink)

def make_celebrate():
    T = ["0s","0.30s","0.60s","0.90s","1.20s","1.50s","1.80s","2.10s","3.0s"]
    BDX = [0.00, 0.20,-0.20, 0.15,-0.15, 0.08,-0.08, 0.00, 0.00]
    BDY = [0.00, 0.12, 0.12, 0.08, 0.08, 0.04, 0.04, 0.00, 0.00]
    ELX = [0.00,-0.14, 0.12,-0.10, 0.08,-0.06, 0.04, 0.00, 0.00]
    body  = [(T[i], BDX[i], BDY[i]) for i in range(9)]
    ear_l = [(T[i], ELX[i], 0.0)   for i in range(9)]
    ear_r = [(T[i], -ELX[i], 0.0)  for i in range(9)]
    blink = [("0s",0.18),("0.08s",0.007),("0.20s",0.18),
             ("1.05s",0.18),("1.12s",0.007),("1.22s",0.18),("3.0s",0.18)]
    return giraffe("3s", 24, body_ofs=body,
                   ear_l_ofs=ear_l, ear_r_ofs=ear_r, blink=blink, stars=True)

# ── write ─────────────────────────────────────────────────────────────────────
clips = {
    "idle":      make_idle,
    "talking":   make_talking,
    "thinking":  make_thinking,
    "correct":   make_correct,
    "wrong":     make_wrong,
    "celebrate": make_celebrate,
}

for name, fn in clips.items():
    path = os.path.join(OUT, f"{name}.sif")
    content = fn()
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  wrote {path}  ({len(content)//1024} KB)")

print(f"\nAll {len(clips)} SIF files written to {OUT}/")
