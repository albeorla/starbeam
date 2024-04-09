import {
    AuditLog,
    DomainEventPublisher,
    Permission,
    Role,
    User,
    UserActivatedEvent,
    UserLockedEvent,
    UserRoleAssignedEvent,
} from "../src/domain";

jest.mock("argon2", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

describe("User Entity", () => {
  let user: User;

  beforeAll(async () => {
    DomainEventPublisher.clear(); // Ensure no leftover subscribers from other tests
    user = await User.createUser(
      "unique-id",
      "test@example.com",
      "password123"
    );
  });

  test("User creation publishes UserCreatedEvent", async () => {
    const publishSpy = jest.spyOn(DomainEventPublisher, "publish");
    const newUser = await User.createUser(
      "unique-id-2",
      "test2@example.com",
      "password123"
    );
    expect(publishSpy).toHaveBeenCalled();
    publishSpy.mockRestore(); // Clean up mock after use
  });

  test("User activation triggers UserActivatedEvent", () => {
    const publishSpy = jest.spyOn(DomainEventPublisher, "publish");
    user.activateUser();
    expect(publishSpy).toHaveBeenCalledWith(expect.any(UserActivatedEvent));
    expect(user.getIsActive()).toBeTruthy();
    publishSpy.mockRestore();
  });

  test("Password update uses argon2 for hashing", async () => {
    await user.updatePassword("newPassword");
    expect(user.getPassword()).toBe("hashed_password");
  });

  let role: Role;

  beforeEach(async () => {
    // Reset user state before each test
    user = await User.createUser(
      "unique-id",
      "test@example.com",
      "securePassword"
    );
    role = new Role("role-id", "Contributor");
    jest.clearAllMocks(); // Clearing mocks to avoid test leaks
  });

  test("Locking user triggers UserLockedEvent and changes state", () => {
    const publishSpy = jest.spyOn(DomainEventPublisher, "publish");

    user.lockUser();

    expect(publishSpy).toHaveBeenCalledWith(expect.any(UserLockedEvent));
    expect(user.getIsLocked()).toBeTruthy();
  });

  test("Adding a role to user triggers UserRoleAssignedEvent", () => {
    const publishSpy = jest.spyOn(DomainEventPublisher, "publish");
    user.addRole(role);

    expect(publishSpy).toHaveBeenCalledWith(expect.any(UserRoleAssignedEvent));
    expect(user.getRoles()).toContain(role);
  });

  test("Recording unsuccessful login attempts eventually locks the user", () => {
    for (let i = 0; i < 5; i++) {
      user.recordLoginAttempt(false);

      // Should still be unlocked after 4 failed attempts
      expect(user.getIsLocked()).toBeFalsy();
    }

    // The 5th attempt should trigger locking
    user.recordLoginAttempt(false);
    expect(user.getIsLocked()).toBeTruthy();
  });

  test("Successful login resets failedLoginAttempts and updates lastLoginAt", () => {
    // Simulate failed attempts
    user.recordLoginAttempt(false);
    user.recordLoginAttempt(false);

    expect(user.getFailedLoginAttempts()).toBeGreaterThan(0);

    const nowBeforeLoginAttempt = new Date();
    user.recordLoginAttempt(true);

    expect(user.getFailedLoginAttempts()).toBe(0);
    expect(user.getLastLoginAt()).toBeDefined();
    expect(user.getLastLoginAt()!.getTime()).toBeGreaterThanOrEqual(
      nowBeforeLoginAttempt.getTime()
    );
  });

  test("equals", async () => {
    expect(
      user.equals(
        await User.createUser("unique-id", "test@example.com", "password123")
      )
    ).toBe(true);
  });

  test("getIsActive", () => {
    expect(user.getIsActive()).toBe(false);
  });

  test("getIsLocked", () => {
    expect(user.getIsLocked()).toBe(false);
  });

  test("getRoles", () => {
    expect(user.getRoles()).toEqual([]);
    user.addRole(role);
    expect(user.getRoles()).toEqual([role]);
  });

  test("getFailedLoginAttempts", () => {
    expect(user.getFailedLoginAttempts()).toBe(0);
    user.recordLoginAttempt(false);
    expect(user.getFailedLoginAttempts()).toBe(1);
  });

  test("getLastLoginAt", () => {
    expect(user.getLastLoginAt()).toBeNull();
    user.recordLoginAttempt(true);
    expect(user.getLastLoginAt()).toBeDefined();
    expect(user.getLastLoginAt()!.getTime()).toBeLessThanOrEqual(
      new Date().getTime()
    );
  });

  test('getPassword', () => {
    expect(user.getPassword()).toBe("hashed_password");
  });

  test('getId', () => {
    expect(user.getId()).toBe("unique-id");
  });

  test('getEmail', () => {
    expect(user.getEmail()).toBe("test@example.com");
  });

  test('getAuditLogs', () => {
    expect(user.getAuditLogs()).toEqual([]);
    user.recordLoginAttempt(false);
    expect(user.getAuditLogs()).toHaveLength(1);
  });

  test('getCreatedAt', () => {
    expect(user.getCreatedAt()).toBeDefined();
  });

  test('getUpdatedAt', () => {
    expect(user.getUpdatedAt()).toBeDefined();
  });

});

describe("AuditLog Entity", () => {
    let auditLog: AuditLog;
    beforeAll(() => {
        auditLog = new AuditLog("unique-id", "user-id", "action", "details");
    });

    test('getId', () => {
        expect(auditLog.getId()).toBe("unique-id");
    });

    test('getUserId', () => {
        expect(auditLog.getUserId()).toBe("user-id");
    });

    test('getAction', () => {
        expect(auditLog.getAction()).toBe("action");
    });

    test('getDetails', () => {
        expect(auditLog.getDetails()).toBe("details");
    });

    test('getCreatedAt', () => {
        expect(auditLog.getCreatedAt()).toBeDefined();
    });
});


describe("Role Entity", () => {
    let role: Role;
    role = new Role("role-id", "Contributor");
  
    test('getName', () => {
      expect(role.getName()).toBe("Contributor");
    });
  
    test('assignPermission', () => {
      role.assignPermission(new Permission("permission-id"));
      expect(role.getPermissions().length).toBe(1);
    });
  
    test('removePermission', () => {
      role.removePermission(new Permission("permission-id"));
      expect(role.getPermissions().length).toBe(0);
    });
  
    test('getPermissions', () => {
      expect(role.getPermissions().length).toBe(0);
    });
  
    test('equals', () => {
      expect(role.equals(new Role("role-id", "Contributor"))).toBe(true);
    });
  });
  
