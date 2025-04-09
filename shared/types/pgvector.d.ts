declare module 'pgvector/drizzle-orm' {
  import { SQL } from 'drizzle-orm';
  
  export interface PgVectorConfig {
    dimensions: number;
  }
  
  export function vector(name: string, config: PgVectorConfig): any;
}