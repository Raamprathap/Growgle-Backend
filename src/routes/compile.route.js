const express = require('express');
const router = express.Router();
const { compileLatex } = require('../controllers/compile.controller');

router.use((req, res, next) => {
	const ct = req.headers['content-type'] || 'none';
	const cl = req.headers['content-length'] || 'unknown';
	console.log(`[compile] ${req.method} ${req.originalUrl} ct=${ct} len=${cl}`);
	next();
});

router.options('/', (req, res) => res.sendStatus(204));

router.get('/', (req, res) => {
	res.setHeader('Allow', 'POST, OPTIONS');
	res.status(405).json({ message: 'Use POST with Content-Type: text/plain to compile LaTeX.' });
});

router.post('/', express.text({ type: ['text/plain', 'text/*', '*/*'], limit: '1mb' }), compileLatex);

module.exports = router;
