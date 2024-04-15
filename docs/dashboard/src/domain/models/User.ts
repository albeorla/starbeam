import argon2 from "argon2";
import { AuditLog } from "./AuditLog";
import { Role } from "./Role";
import {
  DomainEventPublisher,
  UserCreatedEvent,
  UserActivatedEvent,
  UserLockedEvent,
  UserRoleAssignedEvent,
} from "..";

export class User {
  private id: string;
  private email: string;
  private password: string | undefined;
  private isActive: boolean = false;
  private lastLoginAt: Date | null = null;
  private failedLoginAttempts: number = 0;
  private isLocked: boolean = false;
  private roles: Role[] = [];
  private auditLogs: AuditLog[] = [];
  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();

  // Make constructor private to force the use of the factory method for object creation
  private constructor(id: string, email: string) {
    this.id = id;
    this.email = email;
  }

  // Static factory method to handle async password hashing
  static async createUser(
    id: string,
    email: string,
    plainPassword: string
  ): Promise<User> {
    const user = new User(id, email);
    await user.hashAndSetPassword(plainPassword);
    // Emit a user created event after successful password hashing and object construction
    DomainEventPublisher.publish(new UserCreatedEvent(user.id));
    return user;
  }

  private async hashAndSetPassword(plainPassword: string): Promise<void> {
    this.password = await argon2.hash(plainPassword);
  }

  async updatePassword(newPlainPassword: string): Promise<void> {
    this.password = await argon2.hash(newPlainPassword);
    this.updatedAt = new Date();
  }

  activateUser(): void {
    if (!this.isLocked) {
      this.isActive = true;
      this.updatedAt = new Date();
      DomainEventPublisher.publish(new UserActivatedEvent(this.id));
    }
  }

  lockUser(): void {
    this.isLocked = true;
    this.updatedAt = new Date();
    DomainEventPublisher.publish(new UserLockedEvent(this.id));
  }

  addRole(role: Role): void {
    const roleNotAssigned = !this.roles.some((r) => r.equals(role));
    if (roleNotAssigned) {
      this.roles.push(role);
      this.updatedAt = new Date();
      DomainEventPublisher.publish(
        new UserRoleAssignedEvent(this.id, role.getId())
      );
    }
  }

  recordLoginAttempt(successful: boolean): void {
    const now = new Date();
    this.failedLoginAttempts = successful ? 0 : this.failedLoginAttempts + 1;
    if (successful) this.lastLoginAt = now;
    this.updatedAt = now;

    // Creating an audit log for the login attempt
    const action = successful ? "Login Successful" : "Login Failed";
    const auditLog = new AuditLog(this.id, action, new Date().toDateString());
    this.auditLogs.push(auditLog);

    if (!successful && this.failedLoginAttempts > 5) this.lockUser();
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }

  // add all getters and setters
  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string | undefined {
    return this.password;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getLastLoginAt(): Date | null {
    return this.lastLoginAt;
  }

  getFailedLoginAttempts(): number {
    return this.failedLoginAttempts;
  }

  getIsLocked(): boolean {
    return this.isLocked;
  }

  getRoles(): Role[] {
    return this.roles;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
