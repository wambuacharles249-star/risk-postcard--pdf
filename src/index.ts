import dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import { Contract, JsonRpcProvider, formatUnits } from 'ethers';
import fs from 'fs';
import path from 'path';
import CometAbi from './abi/Comet.json';
import { loadEnv } from './config';

async function main(): Promise<void> {
  const env = loadEnv();
  const program = new Command();
  program.option('-o, --out <file>', 'Output HTML file', 'out/postcard.html').parse(process.argv);
  const { out } = program.opts<{ out: string }>();

  if (!env.COMET_ADDRESS) throw new Error('COMET_ADDRESS not set');
  const provider = new JsonRpcProvider(env.RPC_URL);
  const comet = new Contract(env.COMET_ADDRESS, CometAbi as any, provider);

  const [name, util] = await Promise.all([
    comet.name().catch(() => 'Comet'),
    comet.getUtilization().catch(() => 0n)
  ]);
  const utilPct = (Number(formatUnits(util, 18)) * 100).toFixed(2);
  const numAssets = Number(await comet.numAssets().catch(() => 0));

  const rows: string[] = [];
  for (let i = 0; i < numAssets; i++) {
    const info = await comet.getAssetInfo(i);
    rows.push(`<tr><td>${i}</td><td>${info.asset}</td><td>${info.priceFeed}</td><td>${String(info.scale)}</td><td>${String(info.borrowCollateralFactor)}</td><td>${String(info.liquidateCollateralFactor)}</td><td>${String(info.liquidationFactor)}</td><td>${String(info.supplyCap)}</td></tr>`);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"/><style>body{font-family:system-ui;margin:24px}h1{margin:0 0 6px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e5e7eb;padding:6px;font-size:12px}small{color:#64748b}</style></head><body>
<h1>${name}</h1>
<small>COMET: ${env.COMET_ADDRESS}</small>
<h3>Utilization: ${utilPct}%</h3>
<table><thead><tr><th>#</th><th>asset</th><th>priceFeed</th><th>scale</th><th>borrowCF</th><th>liqCF</th><th>liqFactor</th><th>supplyCap</th></tr></thead><tbody>
${rows.join('\n')}
</tbody></table>
</body></html>`;

  const outPath = path.resolve(process.cwd(), out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log('Wrote', outPath);
}

main().catch((err) => { console.error(err); process.exit(1); }); 