# Risk Postcard (PDF)

Generate a one‑pager PDF: assets, factors, caps, utilization, and a “what changed” box.

## MVP
- Fetch market data and a prior snapshot
- HTML template + CSS → render to PDF
- Save to `out/risk-postcard.pdf`

## Dev
```bash
cp .env.example .env
RPC_URL=http://127.0.0.1:8545
COMET_ADDRESS=0xc3d688B66703497DAA19211EEdff47f25384cdc3
npm install
npm run build
```

## Next steps
- Add HTML template and a minimal renderer (Puppeteer/Playwright or wkhtmltopdf)
- Release with GitHub Actions artifact 