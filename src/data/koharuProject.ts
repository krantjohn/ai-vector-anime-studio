import koharuJson from './koharuProject.json';
import { ProjectData } from '../types/anime';

export function createKoharuProject(): ProjectData {
  return koharuJson as unknown as ProjectData;
}
