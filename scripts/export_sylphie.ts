import { createSylphieProject } from '../src/data/sylphieProject';
import { ExporterEngine } from '../src/engine/exporter';
import * as fs from 'fs';
import * as path from 'path';

const project = createSylphieProject();
const svg = ExporterEngine.generateStandaloneSvg(project, project.steps.length);
const artifactsDir = path.resolve(__dirname, '../artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}
const outPath = path.resolve(artifactsDir, 'sylphie_rendered.svg');
fs.writeFileSync(outPath, svg, 'utf-8');
console.log('Successfully wrote sylphie_rendered.svg, size:', svg.length, 'path:', outPath);
