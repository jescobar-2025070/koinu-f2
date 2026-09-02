import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reports/report.service';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class ReportController {
  private readonly reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  private requireUser(req: Request): string {
    if (!req.user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, {
        message: 'Autenticación requerida.',
        statusCode: 401,
      });
    }
    return req.user.id;
  }

  preliminary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const report = await this.reportService.generatePreliminary(req.params.periodId, userId);
      res.status(200).json({ report });
    } catch (error) {
      next(error);
    }
  };

  final = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.requireUser(req);
      const { reportData, generadoEn } = await this.reportService.getFinal(
        req.params.periodId,
        userId,
      );
      res.status(200).json({ report: reportData, generadoEn });
    } catch (error) {
      next(error);
    }
  };
}