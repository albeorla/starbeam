// Role.ts
import { DomainEventPublisher, PermissionAssignedToRoleEvent, PermissionRemovedFromRoleEvent } from "../events";
import { Permission } from "./Permission";


export class Role {
  private permissions: Permission[] = [];

  constructor(private readonly id: string, private name: string) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  assignPermission(permission: Permission): void {
    if (!this.permissions.some((p) => p.equals(permission))) {
      this.permissions.push(permission);
      DomainEventPublisher.publish(
        new PermissionAssignedToRoleEvent(this.id, permission.getName())
      );
    }
  }

  removePermission(permission: Permission): void {
    this.permissions = this.permissions.filter((p) => !p.equals(permission));
    DomainEventPublisher.publish(
      new PermissionRemovedFromRoleEvent(this.id, permission.getName())
    );
  }

  getPermissions(): Permission[] {
    return [...this.permissions];
  }

  equals(other: Role): boolean {
    return this.id === other.id;
  }
}
