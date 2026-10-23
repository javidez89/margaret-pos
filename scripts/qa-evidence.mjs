import { github } from './site.mjs';

const repository = 'javidez89/margaret-pos';
const workflow = '.github/workflows/validate.yml';
const requiredJobs = ['validate', 'security', 'qa-browser'];
const sha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);

export function assertQuality(candidate, evidence, run, commit, jobs) {
  if (candidate.environment !== 'production' || !sha(candidate.sourceTree) || !evidence ||
      !sha(evidence.commit) || evidence.sourceTree !== candidate.sourceTree || evidence.version !== candidate.version) {
    throw new Error('La producción debe corresponder al árbol y versión exactos validados en CI.');
  }
  if (String(run.id) !== String(evidence.workflowRun) || run.path !== workflow || run.event !== 'push' ||
      run.head_branch !== 'develop' || run.head_sha !== evidence.commit || run.status !== 'completed' ||
      run.conclusion !== 'success' || run.repository?.full_name !== repository ||
      run.head_repository?.full_name !== repository || commit.sha !== evidence.commit ||
      commit.tree?.sha !== candidate.sourceTree) {
    throw new Error('No existe evidencia de QA correcta de develop para este contenido.');
  }
  for (const name of requiredJobs) {
    const matches = (jobs.jobs || []).filter(job => job.name === name);
    if (matches.length !== 1 || matches[0].run_id !== run.id || matches[0].status !== 'completed' || matches[0].conclusion !== 'success') {
      throw new Error(`La evidencia no acredita el control obligatorio ${name}.`);
    }
  }
  return evidence;
}

export async function findQuality(candidate, reader = github) {
  if (candidate.environment !== 'production' || !sha(candidate.sourceTree)) throw new Error('Candidato de producción inválido.');
  const history = await reader('/actions/workflows/validate.yml/runs?branch=develop&event=push&per_page=100');
  for (const run of history.workflow_runs || []) {
    if (run.status !== 'completed' || run.conclusion !== 'success' || !sha(run.head_sha)) continue;
    const commit = await reader('/git/commits/' + run.head_sha);
    if (commit.tree?.sha !== candidate.sourceTree) continue;
    const evidence = { workflowRun: run.id, commit: run.head_sha, sourceTree: candidate.sourceTree, version: candidate.version };
    const jobs = await reader('/actions/runs/' + run.id + '/jobs?per_page=100');
    return assertQuality(candidate, evidence, run, commit, jobs);
  }
  throw new Error('Espera la validación de develop del mismo código antes de promover; no se requiere una URL pública de pruebas.');
}

export async function verifyQuality(candidate, reader = github) {
  const evidence = candidate.qa;
  if (!evidence || !sha(evidence.commit) || !/^[1-9]\d*$/.test(String(evidence.workflowRun))) throw new Error('El candidato no incluye evidencia de QA válida.');
  const [run, commit, jobs] = await Promise.all([
    reader('/actions/runs/' + evidence.workflowRun),
    reader('/git/commits/' + evidence.commit),
    reader('/actions/runs/' + evidence.workflowRun + '/jobs?per_page=100'),
  ]);
  return assertQuality(candidate, evidence, run, commit, jobs);
}
