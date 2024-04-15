import type { DomainEvent } from "./DomainEventDispatcher";

export class UserCreatedEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getAggregateId(): string {
    return this.userId;
  }
}

export class UserActivatedEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getAggregateId(): string {
    return this.userId;
  }
}

export class UserLockedEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getAggregateId(): string {
    return this.userId;
  }
}

export class UserRoleAssignedEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  private userId: string;
  private roleId: string;

  constructor(userId: string, roleId: string) {
    this.userId = userId;
    this.roleId = roleId;
  }

  getAggregateId(): string {
    return this.userId;
  }
}
