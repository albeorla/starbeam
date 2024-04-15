// Permission.ts
export class Permission {
  constructor(private readonly name: string) {}

  getName(): string {
    return this.name;
  }

  equals(other: Permission): boolean {
    return this.name === other.getName();
  }
}
