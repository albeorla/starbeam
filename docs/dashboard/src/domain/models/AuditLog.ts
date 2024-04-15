export class AuditLog {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly action: string,
    private details: string | null = null,
    private readonly createdAt: Date = new Date()
  ) {}

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getAction(): string {
    return this.action;
  }

  getDetails(): string | null {
    return this.details;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
