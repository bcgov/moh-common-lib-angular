import { Base } from './base';

describe('Base', () => {
  it('should create an instance', () => {
    const base = new Base();
    expect(base).toBeTruthy();
  });

  it('should assign a non-empty objectId on creation', () => {
    const base = new Base();
    expect(base.objectId).toBeTruthy();
    expect(base.objectId.length).toBeGreaterThan(0);
  });

  it('should assign a UUID-format objectId', () => {
    const base = new Base();
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidPattern.test(base.objectId)).toBe(true);
  });

  it('should assign unique objectIds to separate instances', () => {
    const a = new Base();
    const b = new Base();
    expect(a.objectId).not.toEqual(b.objectId);
  });
});
