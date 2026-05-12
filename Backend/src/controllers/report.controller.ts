/**
 * Report Controller - Report Generation API
 */

import type { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  /**
   * Generate comprehensive interview report
   * POST /api/reports/generate
   */
  static async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, questions, language = 'en' } = req.body;

      if (!sessionId || !questions || !Array.isArray(questions)) {
        res.status(400).json({
          error: 'Missing or invalid required fields: sessionId, questions',
        });
        return;
      }

      const report = await ReportService.generateReport(questions, sessionId, language);

      res.status(200).json({
        success: true,
        report,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({
        error: 'Failed to generate report',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Get report with session data
   * GET /api/reports/:sessionId
   */
  static async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      // This would fetch from Firestore and generate report
      // For now, return placeholder
      res.status(200).json({
        success: true,
        message: 'Report endpoint - implement with session fetch',
        sessionId,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Export report as PDF
   * POST /api/reports/:sessionId/export/pdf
   */
  static async exportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      // This would generate PDF and send file
      // For now, return placeholder
      res.status(200).json({
        success: true,
        message: 'PDF export endpoint - implement with jsPDF',
        sessionId,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Email report to candidate
   * POST /api/reports/:sessionId/email
   */
  static async emailReport(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email address required' });
        return;
      }

      // This would use SendGrid/Resend to email report
      // For now, return placeholder
      res.status(200).json({
        success: true,
        message: 'Report email queued',
        email,
        sessionId,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
