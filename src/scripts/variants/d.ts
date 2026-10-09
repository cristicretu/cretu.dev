/* Group D: camera, 3D and play. Each variant lives in its own d-*.ts file. */

import type { Variant } from '../field-kit';
import { dominoes } from './d-dominoes';
import { flock } from './d-flock';
import { globe } from './d-globe';
import { snake } from './d-snake';
import { timeline } from './d-timeline';
import { zoom } from './d-zoom';

export const groupD: Record<string, Variant> = { zoom, timeline, globe, snake, dominoes, flock };
