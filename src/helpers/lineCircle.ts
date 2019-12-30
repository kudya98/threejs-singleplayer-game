// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export function lineCircle(x1, y1, x2, y2, xc, yc, rc) {
    const ac = [xc - x1, yc - y1]
    const ab = [x2 - x1, y2 - y1]
    const ab2 = dot(ab, ab)
    const acab = dot(ac, ab)
    let t = acab / ab2
    t = t < 0 ? 0 : t
    t = t > 1 ? 1 : t
    const h = [ab[0] * t + x1 - xc, ab[1] * t + y1 - yc]
    const h2 = dot(h, h)
    return h2 <= rc * rc
}

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1]
}
