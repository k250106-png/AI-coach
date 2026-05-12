/**
 * Report Routes
 */

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router = Router();

/**
 * POST /api/reports/generate
 * Generate comprehensive interview report from question metrics
 */
router.post('/generate', (req, res) => ReportController.generateReport(req, res));

/**
 * GET /api/reports/:sessionId
 * Get full report for a session
 */
router.get('/:sessionId', (req, res) => ReportController.getReport(req, res));

/**
 * POST /api/reports/:sessionId/export/pdf
 * Export report as PDF
 */
router.post('/:sessionId/export/pdf', (req, res) =>
  ReportController.exportPDF(req, res)
);

/**
 * POST /api/reports/:sessionId/email
 * Email report to candidate
 */
router.post('/:sessionId/email', (req, res) => ReportController.emailReport(req, res));

export default router;
