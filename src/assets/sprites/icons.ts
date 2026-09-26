/**
 * Generic HUD icons, shared by every skin. Only the rows are shared — they are baked against the
 * active skin's char palette, so the same shapes take on each world's colors.
 *
 * Currency-flavored icons (`icon_credit`, `icon_core`) are NOT here; each skin supplies its own.
 */
export const SHARED_ICON_ROWS: Record<string, string[]> = {
  icon_heart: ['.oo.oo..', 'orRoRRo.', 'oRRRRRo.', 'oRRRRRo.', '.oRRRo..', '..oRo...', '...o....', '........'],
  icon_wave: ['........', 'r...r...', 'rr..rr..', 'rrr.rrr.', 'rrr.rrr.', 'rr..rr..', 'r...r...', '........'],
  icon_lock: ['..lll...', '.l...l..', '.l...l..', 'ooooooo.', 'oyyyyyo.', 'oyyoyyo.', 'oyyyyyo.', 'ooooooo.'],
  icon_sound_on: ['....l...', '...ll.l.', 'llll.l.l', 'llll.l.l', 'llll.l.l', '...ll.l.', '....l...', '........'],
  icon_sound_off: ['....l...', '...ll...', 'llll.r.r', 'llll..r.', 'llll.r.r', '...ll...', '....l...', '........'],
  icon_pause: ['........', '.ll.ll..', '.ll.ll..', '.ll.ll..', '.ll.ll..', '.ll.ll..', '.ll.ll..', '........'],
  icon_speed1: ['........', '..l.....', '..ll....', '..lll...', '..lll...', '..ll....', '..l.....', '........'],
  icon_speed2: ['........', 'y...y...', 'yy..yy..', 'yyy.yyy.', 'yyy.yyy.', 'yy..yy..', 'y...y...', '........'],
  icon_star: ['...y....', '...y....', '.yyyyy..', '..yyy...', '..y.y...', '.y...y..', '........', '........'],
};
