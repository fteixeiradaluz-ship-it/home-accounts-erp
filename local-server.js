import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Carregar variáveis de ambiente imediatamente no topo do arquivo
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    } else {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
    console.log('✅ Variáveis de ambiente (.env) carregadas com sucesso.');
  } catch (err) {
    console.warn('Aviso ao carregar .env:', err.message);
  }
}

import http from 'http';
import { parse as parseUrl } from 'url';

const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  const parsedUrl = parseUrl(req.url, true);
  const pathname = parsedUrl.pathname;

  req.query = parsedUrl.query || {};

  // Suporte a rotas da API em desenvolvimento local
  if (pathname.startsWith('/api/')) {
    let apiPath = pathname.substring(5);
    if (apiPath.endsWith('/')) apiPath = apiPath.slice(0, -1);
    
    const possibleFiles = [
      path.join(__dirname, 'api', `${apiPath}.js`),
      path.join(__dirname, 'api', apiPath, 'index.js')
    ];

    let targetFile = null;
    for (const f of possibleFiles) {
      if (fs.existsSync(f) && fs.statSync(f).isFile()) {
        targetFile = f;
        break;
      }
    }

    if (targetFile) {
      try {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const bodyStr = Buffer.concat(buffers).toString();
          if (bodyStr) {
            try {
              req.body = JSON.parse(bodyStr);
            } catch {
              req.body = bodyStr;
            }
          } else {
            req.body = {};
          }
        } else {
          req.body = {};
        }

        res.status = function(code) {
          res.statusCode = code;
          return res;
        };
        res.json = function(data) {
          if (!res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', 'application/json');
          }
          res.end(JSON.stringify(data));
          return res;
        };

        const fileUrl = 'file:///' + targetFile.replace(/\\/g, '/');
        const module = await import(fileUrl);
        const handler = module.default || module;
        
        await handler(req, res);
        return;
      } catch (err) {
        console.error(`Erro ao executar API ${pathname}:`, err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Erro interno no servidor local', details: err.message }));
        return;
      }
    }
  }

  // Arquivos estáticos (servidos a partir da pasta public)
  const publicDir = path.join(__dirname, 'public');
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(publicDir, filePath);

  if (!filePath.startsWith(publicDir)) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('File Not Found');
      } else {
        res.statusCode = 500;
        res.end(`Internal Server Error: ${err.code}`);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
