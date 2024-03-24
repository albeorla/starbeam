import {
    DomainEventPublisher,
    Role,
    User,
    UserActivatedEvent,
    UserLockedEvent,
    UserRoleAssignedEvent,
} from "../src/domain";

jest.mock('argon2', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
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

});

describe("User Entity - Extended Tests", () => {
  let user: User;
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

});

