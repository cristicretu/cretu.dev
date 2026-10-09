/* Group C: typographic and graphic. These change what the landing page is: a counter, a
   barcode, a heart monitor, a woven cloth, a receipt and a halftone print, all made of days. */

import type { Variant } from '../field-kit';
import { barcode } from './c-barcode';
import { ekg } from './c-ekg';
import { halftone } from './c-halftone';
import { loom } from './c-loom';
import { odometer } from './c-odometer';
import { receipt } from './c-receipt';

export const groupC: Record<string, Variant> = { odometer, barcode, ekg, loom, receipt, halftone };
