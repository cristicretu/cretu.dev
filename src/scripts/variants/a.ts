/* Group A: tactile physics. The field as a material you can pour, ripple, pull, swallow,
   pop and slap. */

import type { Variant } from '../field-kit';
import { blackhole } from './a-blackhole';
import { bubbles } from './a-bubbles';
import { cloth } from './a-cloth';
import { jelly } from './a-jelly';
import { pond } from './a-pond';
import { sand } from './a-sand';

export const groupA: Record<string, Variant> = { sand, pond, cloth, blackhole, bubbles, jelly };
