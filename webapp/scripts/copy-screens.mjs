/**
 * Copies the funnel's screens.json into webapp/data/ so the Profile → Data tab
 * can resolve question-id → human-readable label without runtime CORS calls.
 *
 * The source of truth is funnel/funnel-v2/screens.json; keeping a build-time
 * copy avoids drift while letting the webapp ship as a self-contained bundle.
 * Run automatically via `prebuild` and `predev` hooks in package.json.
 *
 * If the source is missing — for example a partial-tree deploy that does not
 * include the funnel/ directory — fail loudly with actionable guidance so the
 * cause isn't buried in a generic ENOENT trace.
 */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const src = resolve(__dirname, '../../funnel/funnel-v2/screens.json');
const dst = resolve(__dirname, '../public/data/screens.json');

if (!existsSync(src)) {
  console.error(`✗ copy-screens: source not found at ${src}`);
  console.error('  The webapp expects the funnel/ sibling directory to be present at build time.');
  console.error('  If deploying via Vercel, ensure the project clones the full repo (not just webapp/).');
  process.exit(1);
}

mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);

console.log(`✓ copied screens.json → webapp/public/data/screens.json`);
