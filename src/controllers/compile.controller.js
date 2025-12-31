const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const TIMEOUT_MS = Number(process.env.LATEX_TIMEOUT_MS || 15000);
const MAX_LOG_BYTES = 4096;

function wrapIfPartial(src) {
  if (/\\documentclass\b/.test(src)) return src;
  return `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\begin{document}\n${src}\n\\end{document}`;
}

function guardGlyphToUnicode(src) {
  const hasGuard = /\\ifdefined\\pdfgentounicode/.test(src);
  const hasGlyphInput = /(^|\n)\s*\\input\s*\{?\s*glyphtounicode(\.tex)?\}?/i.test(src);
  const hasPdfGen = /(^|\n)\s*\\pdfgentounicode\s*=\s*1\b/.test(src);
  if (hasGuard || (!hasGlyphInput && !hasPdfGen)) {
    return src;
  }
  let modified = src
    .replace(/(^|\n)\s*\\input\s*\{?\s*glyphtounicode(\.tex)?\}?\s*(?=\n|$)/gi, '$1')
    .replace(/(^|\n)\s*\\pdfgentounicode\s*=\s*1\s*(?=\n|$)/g, '$1');

  const guardBlock = '\n% guarded glyphtounicode for pdfTeX only\n' +
    '\\ifdefined\\pdfgentounicode\n' +
    '\\input glyphtounicode.tex\n' +
    '\\pdfgentounicode=1\n' +
    '\\fi\n';

  if (/\\documentclass\b/.test(modified)) {
    modified = modified.replace(/(\\documentclass[^\n]*\n)/, `$1${guardBlock}`);
  } else {
    modified = guardBlock + modified;
  }
  return modified;
}

async function makeTempDir() {
  const base = path.join(os.tmpdir(), 'latex-');
  return await fsp.mkdtemp(base);
}

async function safeRmDir(dir) {
  try {
    await fsp.rm(dir, { recursive: true, force: true });
  } catch (_) {}
}

exports.compileLatex = async function compileLatex(req, res) {
  try {
    if (typeof req.body !== 'string') {
      const ct = req.headers['content-type'] || 'none';
      const cl = req.headers['content-length'] || 'unknown';
      try { console.error(`[compile] 415 Unsupported content type ct=${ct} len=${cl}`); } catch (_) {}
      return res.status(415).json({ message: 'Unsupported content type. Use text/plain.', received: { contentType: ct, contentLength: cl } });
    }
    const raw = req.body;
    if (!raw || !raw.trim()) {
      try { console.error('[compile] 422 Empty LaTeX source'); } catch (_) {}
      return res.status(422).json({ message: 'Empty LaTeX source.' });
    }
    if (raw.indexOf('\u0000') !== -1) {
      try { console.error('[compile] 400 Invalid input: contains binary data'); } catch (_) {}
      return res.status(400).json({ message: 'Invalid input: contains binary data.' });
    }

    const tmpDir = await makeTempDir();
    const texPath = path.join(tmpDir, 'main.tex');
    const outPdf = path.join(tmpDir, 'main.pdf');
  const content = wrapIfPartial(guardGlyphToUnicode(raw));
    await fsp.writeFile(texPath, content, 'utf8');

    const tectonicCmd = process.env.TECTONIC_PATH || 'tectonic';
    let args = ['-o', tmpDir];
    if (process.env.TECTONIC_FLAGS) {
      args = args.concat(process.env.TECTONIC_FLAGS.trim().split(/\s+/));
    }
    args.push('main.tex');
    const child = spawn(tectonicCmd, args, {
      cwd: tmpDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let timedOut = false;
    let responded = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch (_) {}
    }, TIMEOUT_MS);

    async function finalize(sendResponse) {
      if (responded || res.headersSent) {
        clearTimeout(timer);
        await safeRmDir(tmpDir);
        return;
      }
      responded = true;
      clearTimeout(timer);
      try {
        await sendResponse();
      } finally {
        await safeRmDir(tmpDir);
      }
    }

    child.stdout.on('data', (d) => { stdout = Buffer.concat([stdout, d]); });
    child.stderr.on('data', (d) => { stderr = Buffer.concat([stderr, d]); });

    child.on('error', async (err) => {
      await finalize(async () => {
        if (err && err.code === 'ENOENT') {
          try { console.error('[compile] 500 Tectonic not found'); } catch (_) {}
          res.status(500).json({ message: 'Tectonic is not installed on the server. Install it and ensure PATH or set TECTONIC_PATH to the full path of tectonic.' });
          return;
        }
        try { console.error(`[compile] 500 Failed to start compiler: ${err && err.message ? err.message : String(err)}`); } catch (_) {}
        res.status(500).json({ message: 'Failed to start compiler', log: String(err.message || err) });
      });
    });

    child.on('close', async (code) => {
      await finalize(async () => {
        try {
          if (timedOut) {
            try { console.error('[compile] 408 Compilation timed out'); } catch (_) {}
            res.status(408).json({ message: 'Compilation timed out after 15s.' });
            return;
          }
          if (code !== 0) {
            const logTail = stderr.length > MAX_LOG_BYTES ? stderr.slice(-MAX_LOG_BYTES).toString('utf8') : stderr.toString('utf8');
            try { console.error('[compile] 400 LaTeX compilation failed'); } catch (_) {}
            res.status(400).json({ message: 'LaTeX compilation failed', log: logTail });
            return;
          }

          const pdf = await fsp.readFile(outPdf);
          const magic = pdf.slice(0, 4).toString('ascii');
          if (pdf.length === 0 || magic !== '%PDF') {
            const logTail = stderr.length > MAX_LOG_BYTES ? stderr.slice(-MAX_LOG_BYTES).toString('utf8') : stderr.toString('utf8');
            try { console.error(`[compile] 400 Invalid PDF output len=${pdf.length} magic=${magic}`); } catch (_) {}
            res.status(400).json({ message: 'Compilation did not produce a valid PDF', log: logTail });
            return;
          }
          try { console.log(`[compile] PDF bytes: ${pdf.length}, magic: ${magic}`); } catch (_) {}
          res.status(200);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'inline; filename="output.pdf"');
          res.setHeader('Content-Length', String(pdf.length));
          res.end(pdf);
        } catch (e) {
          try { console.error(`[compile] 500 Internal error reading PDF: ${e && e.message ? e.message : String(e)}`); } catch (_) {}
          res.status(500).json({ message: 'Internal error reading compiled PDF', log: String(e.message || e) });
        }
      });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', log: String(err.message || err) });
  }
};
