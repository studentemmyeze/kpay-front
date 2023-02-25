import { Neo4jdatePipe } from './neo4jdate.pipe';

describe('Neo4jdatePipe', () => {
  it('create an instance', () => {
    const pipe = new Neo4jdatePipe();
    expect(pipe).toBeTruthy();
  });
});
