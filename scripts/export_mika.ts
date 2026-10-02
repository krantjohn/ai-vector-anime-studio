import { createMasterMikaBaseProject } from '../src/data/masterMikaProject';
import { ExporterEngine } from '../src/engine/exporter';
import * as fs from 'fs';
import * as path from 'path';

const project = createMasterMikaBaseProject();
const svg = ExporterEngine.generateStandaloneSvg(project, project.steps.length);
const outPath = path.resolve(__dirname, '../mika_rendered.svg');
fs.writeFileSync(outPath, svg, 'utf-8');
console.log('Successfully wrote mika_rendered.svg, size:', svg.length);
