import type { DomainEvent } from "./DomainEventDispatcher";

class PermissionAssignedToRoleEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  private readonly roleId: string;
  private readonly permissionName: string;

  constructor(roleId: string, permissionName: string) {
    this.roleId = roleId;
    this.permissionName = permissionName;
  }

  getAggregateId(): string {
    return this.roleId;
  }
}

class PermissionRemovedFromRoleEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  private readonly roleId: string;
  private readonly permissionName: string;

  constructor(roleId: string, permissionName: string) {
    this.roleId = roleId;
    this.permissionName = permissionName;
  }

  getAggregateId(): string {
    return this.roleId;
  }
}

export { PermissionAssignedToRoleEvent, PermissionRemovedFromRoleEvent };
