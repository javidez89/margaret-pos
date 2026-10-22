import { loadEnvironment, projectVersion } from './environment.mjs';
const config = await loadEnvironment('production');
const report = { environment: config.name, version: await projectVersion(), deploymentEnabled: config.deploymentEnabled === true, operationalReady: config.operationalReady === true, pending: config.pending };
console.log(JSON.stringify(report, null, 2));
if (!process.argv.includes('--report') && (!report.deploymentEnabled || !report.operationalReady)) process.exitCode = 2;
