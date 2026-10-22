import { projectVersion, validateReleaseTag } from './environment.mjs';
const version = await projectVersion();
if (process.argv[2]) validateReleaseTag(process.argv[2], version);
console.log(`Versión coherente: ${version}`);
