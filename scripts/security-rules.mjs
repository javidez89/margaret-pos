export function inspectFile(path, text) {
  const findings = [];
  const signatures = [
    ['clave privada', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ['token GitHub', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/],
    ['clave AWS', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
    ['clave Google', /\bAIza[0-9A-Za-z_-]{35}\b/],
    ['clave de pago real', /\bsk_live_[0-9A-Za-z]{16,}\b/],
  ];
  for (const [kind, regex] of signatures) if (regex.test(text)) findings.push({ path, kind });
  if (/\.(pem|key|p12|pfx|db|sqlite)$/.test(path) || /(^|\/)\.env($|\.(local|production)$)/.test(path)) findings.push({ path, kind: 'archivo privado versionado' });
  if (path.startsWith('.github/workflows/')) {
    for (const match of text.matchAll(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/gm)) if (!match[1].startsWith('./') && !/@[a-f0-9]{40}$/.test(match[1])) findings.push({ path, kind: 'acción sin commit fijado' });
    if (/pull_request_target\s*:|permissions:\s*write-all/.test(text)) findings.push({ path, kind: 'permisos o evento de riesgo' });
  }
  return findings;
}
