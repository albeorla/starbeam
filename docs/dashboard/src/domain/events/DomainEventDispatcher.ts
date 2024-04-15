export interface DomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): string;
}

type EventHandler<T extends DomainEvent> = (event: T) => void;
type EventClass<T extends DomainEvent> = { new (...args: any[]): T; };

export class DomainEventPublisher {
    private static subscribers: Map<string, EventHandler<DomainEvent>[]> = new Map();

    static publish<T extends DomainEvent>(event: T): void {
        const eventName = event.constructor.name;
        const eventSubscribers = DomainEventPublisher.subscribers.get(eventName);
        eventSubscribers?.forEach(handler => handler(event));
    }

    static subscribe<T extends DomainEvent>(eventClass: EventClass<T>, handler: EventHandler<T>): void {
        const eventName = eventClass.name;
        const existingSubscribers = DomainEventPublisher.subscribers.get(eventName) || [];
        DomainEventPublisher.subscribers.set(eventName, [...existingSubscribers, handler as EventHandler<DomainEvent>]);
    }

    // Additional method for unsubscribing
    static unsubscribe<T extends DomainEvent>(eventClass: EventClass<T>, handler: EventHandler<T>): void {
        const eventName = eventClass.name;
        const eventSubscribers = DomainEventPublisher.subscribers.get(eventName);
        if (eventSubscribers) {
            const filteredHandlers = eventSubscribers.filter(subscriber => subscriber !== handler);
            if (filteredHandlers.length > 0) {
                DomainEventPublisher.subscribers.set(eventName, filteredHandlers);
            } else {
                DomainEventPublisher.subscribers.delete(eventName);
            }
        }
    }

    static clear(): void {
        DomainEventPublisher.subscribers.clear();
    }
}