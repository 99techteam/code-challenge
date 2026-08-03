import type {
  AuditLogFilters,
  TroubleLogFilters,
  TroubleLogInput,
} from "../domain/observability";
import { AppError } from "../errors";
import { ObservabilityRepository } from "../repositories/observability.repository";

export class ObservabilityService {
  public constructor(
    private readonly repository: ObservabilityRepository,
  ) {}

  public listAuditLogs(filters: AuditLogFilters) {
    return this.repository.listAuditLogs(filters);
  }

  public getAuditLog(id: number) {
    const log = this.repository.findAuditLogById(id);

    if (!log) {
      throw new AppError(
        404,
        "AUDIT_LOG_NOT_FOUND",
        "Audit log was not found",
      );
    }

    return log;
  }

  public recordTrouble(input: TroubleLogInput): void {
    this.repository.writeTroubleLog(input);
  }

  public listTroubleLogs(filters: TroubleLogFilters) {
    return this.repository.listTroubleLogs(filters);
  }

  public getTroubleLog(id: number) {
    const log = this.repository.findTroubleLogById(id);

    if (!log) {
      throw new AppError(
        404,
        "TROUBLE_LOG_NOT_FOUND",
        "Trouble log was not found",
      );
    }

    return log;
  }
}
