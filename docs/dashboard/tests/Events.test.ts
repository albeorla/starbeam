import {
  DomainEventPublisher,
  PermissionAssignedToRoleEvent,
  PermissionRemovedFromRoleEvent,
  Role,
  User,
  UserActivatedEvent,
  UserCreatedEvent,
  UserLockedEvent,
  UserRoleAssignedEvent,
} from "../src/domain";

describe("UserEvents", () => {
  let user: User;
  let userActivatedEvent: UserActivatedEvent;
  let userCreatedEvent: UserCreatedEvent;
  let userLockedEvent: UserLockedEvent;
  let userRoleAssignedEvent: UserRoleAssignedEvent;

  beforeAll(async () => {
    user = await User.createUser("unique-id", "user-id", "action");
    userActivatedEvent = new UserActivatedEvent("unique-id");
    userCreatedEvent = new UserCreatedEvent("unique-id");
    userLockedEvent = new UserLockedEvent("unique-id");
    userRoleAssignedEvent = new UserRoleAssignedEvent("unique-id", "user-id");
  });

  test("UserActivatedEvent", () => {
    expect(userActivatedEvent.getAggregateId()).toBe("unique-id");
  });

  test("UserCreatedEvent", () => {
    expect(userCreatedEvent.getAggregateId()).toBe("unique-id");
  });

  test("UserLockedEvent", () => {
    expect(userLockedEvent.getAggregateId()).toBe("unique-id");
  });

  test("UserRoleAssignedEvent", () => {
    expect(userRoleAssignedEvent.getAggregateId()).toBe("unique-id");
  });
});

describe("RoleEvents", () => {
  let role: Role;
  let permissionAssignedEvent: PermissionAssignedToRoleEvent;
  let permissionRemovedEvent: PermissionRemovedFromRoleEvent;

  beforeAll(() => {
    role = new Role("unique-id", "role-id");
    permissionAssignedEvent = new PermissionAssignedToRoleEvent(
      "unique-id",
      "role-id"
    );
    permissionRemovedEvent = new PermissionRemovedFromRoleEvent(
      "unique-id",
      "role-id"
    );
  });

  test("PermissionAssignedToRoleEvent", () => {
    expect(permissionAssignedEvent.getAggregateId()).toBe("unique-id");
  });

  test("PermissionRemovedFromRoleEvent", () => {
    expect(permissionRemovedEvent.getAggregateId()).toBe("unique-id");
  });
});

describe("DomainEventDispatcher", () => {
  let domainEventPublisher: DomainEventPublisher;
  let user: User;
  let userCreatedEvent: UserCreatedEvent;
  let userActivatedEvent: UserActivatedEvent;
  let userLockedEvent: UserLockedEvent;
  let userRoleAssignedEvent: UserRoleAssignedEvent;

  beforeAll(async () => {
    domainEventPublisher = new DomainEventPublisher();
    user = await User.createUser("unique-id", "user-id", "action");
    userCreatedEvent = new UserCreatedEvent("unique-id");
    userActivatedEvent = new UserActivatedEvent("unique-id");
    userLockedEvent = new UserLockedEvent("unique-id");
    userRoleAssignedEvent = new UserRoleAssignedEvent("unique-id", "user-id");
  });

  test("UserCreatedEvent", () => {
    DomainEventPublisher.publish(userCreatedEvent);
    DomainEventPublisher.subscribe(
      UserCreatedEvent,
      (event: UserCreatedEvent) => {
        expect(event.getAggregateId()).toBe("unique-id");
      }
    );
  });

  test("UserActivatedEvent", () => {
    DomainEventPublisher.publish(userActivatedEvent);
    DomainEventPublisher.subscribe(
      UserActivatedEvent,
      (event: UserActivatedEvent) => {
        expect(event.getAggregateId()).toBe("unique-id");
      }
    );
  });

  test("UserLockedEvent", () => {
    DomainEventPublisher.publish(userLockedEvent);
    DomainEventPublisher.subscribe(
      UserLockedEvent,
      (event: UserLockedEvent) => {
        expect(event.getAggregateId()).toBe("unique-id");
      }
    );
  });

  test("UserRoleAssignedEvent", () => {
    DomainEventPublisher.publish(userRoleAssignedEvent);
    DomainEventPublisher.subscribe(
      UserRoleAssignedEvent,
      (event: UserRoleAssignedEvent) => {
        expect(event.getAggregateId()).toBe("unique-id");
      }
    );
  });

  test("PermissionAssignedToRoleEvent", () => {
    const permissionAssignedToRoleEvent = new PermissionAssignedToRoleEvent(
      "unique-id",
      "role-id"
    );
    DomainEventPublisher.publish(permissionAssignedToRoleEvent);
    DomainEventPublisher.subscribe(
      PermissionAssignedToRoleEvent,
      (event: PermissionAssignedToRoleEvent) => {
        expect(event.getAggregateId()).toBe("unique-id");
      }
    );
  });

  test("PermissionRemovedFromRoleEvent", () => {
    const permissionRemovedFromRoleEvent = new PermissionRemovedFromRoleEvent(
      "unique-id",
      "role-id"
    );
    DomainEventPublisher.publish(permissionRemovedFromRoleEvent);
    DomainEventPublisher.subscribe(
      PermissionRemovedFromRoleEvent,
      (event: PermissionRemovedFromRoleEvent) => {
        expect(event.getAggregateId()).toBe("unique-id");
      }
    );
  });

  test("unsubscribe", () => {
    DomainEventPublisher.unsubscribe(
      UserCreatedEvent,
      (event: UserCreatedEvent) => {
        expect(event.getAggregateId()).toBe("unique-id");
      }
    );
  });

  test("clear", () => {
    DomainEventPublisher.clear();
  });
});
