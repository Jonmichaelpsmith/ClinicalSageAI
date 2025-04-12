import { 
  academicResources, 
  academicEmbeddings, 
  InsertAcademicResource, 
  InsertAcademicEmbedding, 
  AcademicResource,
  AcademicEmbedding
} from '@shared/schema';
import { db } from './db';
import { eq, like, and, desc, asc, or, inArray, sql, count } from 'drizzle-orm';

/**
 * Academic Knowledge Tracker Service
 * 
 * This service manages the storage and retrieval of academic resources and embeddings.
 * It provides functionality for tracking academic and regulatory literature,
 * embeddings, and semantic search capabilities.
 */
export class AcademicKnowledgeTracker {
  /**
   * Add a new academic resource to the knowledge base
   * 
   * @param resource Academic resource metadata to add
   * @returns The created resource with ID
   */
  async addResource(resource: InsertAcademicResource): Promise<AcademicResource> {
    try {
      const [newResource] = await db.insert(academicResources)
        .values({
          ...resource,
          uploadDate: new Date(),
          lastAccessed: new Date(),
          accessCount: 0
        })
        .returning();

      return newResource;
    } catch (error) {
      console.error('Failed to add academic resource:', error);
      throw new Error('Failed to add academic resource to the knowledge base');
    }
  }

  /**
   * Store embeddings for a specific academic resource
   * 
   * @param embedding Embedding data to store
   * @returns The created embedding with ID
   */
  async storeEmbedding(embedding: InsertAcademicEmbedding): Promise<AcademicEmbedding> {
    try {
      const [newEmbedding] = await db.insert(academicEmbeddings)
        .values({
          ...embedding,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return newEmbedding;
    } catch (error) {
      console.error('Failed to store embedding:', error);
      throw new Error('Failed to store academic resource embedding');
    }
  }

  /**
   * Get a specific academic resource by ID
   * 
   * @param id Resource ID
   * @returns The academic resource if found
   */
  async getResource(id: number): Promise<AcademicResource | undefined> {
    try {
      const resource = await db.query.academicResources.findFirst({
        where: eq(academicResources.id, id),
        with: {
          embeddings: true
        }
      });

      if (resource) {
        // Update access count and timestamp
        await db.update(academicResources)
          .set({
            lastAccessed: new Date(),
            accessCount: (resource.accessCount || 0) + 1
          })
          .where(eq(academicResources.id, id));
      }

      return resource;
    } catch (error) {
      console.error('Failed to get academic resource:', error);
      throw new Error('Failed to retrieve academic resource');
    }
  }

  /**
   * Get all academic resources with optional filtering
   * 
   * @param filter Optional filter parameters
   * @returns List of academic resources
   */
  async getTrackedResources(filter?: {
    type?: string;
    category?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ resources: AcademicResource[]; total: number }> {
    try {
      const whereClause = [];
      
      if (filter?.type) {
        whereClause.push(eq(academicResources.resourceType, filter.type));
      }
      
      if (filter?.category) {
        whereClause.push(eq(academicResources.category, filter.category));
      }
      
      if (filter?.query) {
        whereClause.push(
          or(
            like(academicResources.title, `%${filter.query}%`),
            like(academicResources.authors, `%${filter.query}%`),
            like(academicResources.summary, `%${filter.query}%`)
          )
        );
      }

      const conditions = whereClause.length > 0 ? and(...whereClause) : undefined;
      
      // Count total resources matching filter
      const totalCount = await db.select({ count: count() })
        .from(academicResources)
        .where(conditions)
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Get filtered resources
      const resources = await db.query.academicResources.findMany({
        where: conditions,
        orderBy: desc(academicResources.uploadDate),
        limit: filter?.limit || 100,
        offset: filter?.offset || 0
      });

      return {
        resources,
        total: Number(totalCount)
      };
    } catch (error) {
      console.error('Failed to get tracked resources:', error);
      throw new Error('Failed to retrieve academic resources');
    }
  }

  /**
   * Search academic knowledge base with semantic search
   * 
   * @param query Natural language query
   * @param similarityThreshold Minimum similarity score (0-1)
   * @param limit Maximum number of results
   * @returns List of matching resources with similarity scores
   */
  async searchKnowledge(
    query: string, 
    embedVector: number[],
    similarityThreshold: number = 0.7,
    limit: number = 10
  ): Promise<Array<AcademicResource & { similarity: number }>> {
    try {
      // Get embeddings with similarity scores above threshold
      const results = await db.execute(
        `SELECT e.*, r.*, 
         (e.vector <=> $1) as similarity
         FROM academic_embeddings e
         JOIN academic_resources r ON e.resource_id = r.id
         WHERE (e.vector <=> $1) < $2
         ORDER BY similarity ASC
         LIMIT $3`,
        [embedVector, 1 - similarityThreshold, limit]
      );

      // Map results and update access counts for retrieved resources
      const resourceIds = new Set<number>();
      const mappedResults = results.map((row: any) => {
        resourceIds.add(row.resource_id);
        return {
          id: row.resource_id,
          title: row.title,
          authors: row.authors,
          resourceType: row.resource_type,
          source: row.source,
          url: row.url,
          publishedDate: row.published_date,
          category: row.category,
          summary: row.summary,
          fullText: row.full_text,
          keyInsights: row.key_insights,
          tags: row.tags,
          uploadDate: row.upload_date,
          lastAccessed: row.last_accessed,
          accessCount: row.access_count,
          similarity: 1 - row.similarity
        };
      });

      // Update access counts in background
      if (resourceIds.size > 0) {
        const resourceIdArray = Array.from(resourceIds);
        db.update(academicResources)
          .set({
            lastAccessed: new Date(),
            accessCount: sql`${academicResources.accessCount} + 1`
          })
          .where(inArray(academicResources.id, resourceIdArray))
          .execute()
          .catch(err => console.error('Failed to update access counts:', err));
      }

      return mappedResults;
    } catch (error) {
      console.error('Failed to search knowledge base:', error);
      throw new Error('Failed to search academic knowledge base');
    }
  }

  /**
   * Delete an academic resource and its embeddings
   * 
   * @param id Resource ID to delete
   * @returns Success status
   */
  async deleteResource(id: number): Promise<boolean> {
    try {
      // Delete associated embeddings first (foreign key constraint)
      await db.delete(academicEmbeddings)
        .where(eq(academicEmbeddings.resourceId, id));
      
      // Then delete the resource
      const result = await db.delete(academicResources)
        .where(eq(academicResources.id, id))
        .returning({ id: academicResources.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Failed to delete academic resource:', error);
      throw new Error('Failed to delete academic resource');
    }
  }

  /**
   * Get statistical summary of academic knowledge base
   * 
   * @returns Summary statistics of the academic knowledge base
   */
  async getKnowledgeStats(): Promise<{
    totalResources: number;
    resourcesByType: Record<string, number>;
    resourcesByCategory: Record<string, number>;
    mostAccessedResources: Array<Pick<AcademicResource, 'id' | 'title' | 'accessCount'>>; 
    recentlyAddedResources: Array<Pick<AcademicResource, 'id' | 'title' | 'uploadDate'>>;
  }> {
    try {
      // Get total count
      const totalResult = await db.select({ count: count() })
        .from(academicResources)
        .execute();
      const totalResources = Number(totalResult[0]?.count || 0);
      
      // Get counts by type
      const typeResults = await db.select({
        type: academicResources.resourceType,
        count: count()
      })
      .from(academicResources)
      .groupBy(academicResources.resourceType)
      .execute();
      
      const resourcesByType: Record<string, number> = {};
      typeResults.forEach(r => {
        if (r.type) resourcesByType[r.type] = Number(r.count);
      });
      
      // Get counts by category
      const categoryResults = await db.select({
        category: academicResources.category,
        count: count()
      })
      .from(academicResources)
      .groupBy(academicResources.category)
      .execute();
      
      const resourcesByCategory: Record<string, number> = {};
      categoryResults.forEach(r => {
        if (r.category) resourcesByCategory[r.category] = Number(r.count);
      });
      
      // Get most accessed resources
      const mostAccessedResources = await db.select({
        id: academicResources.id,
        title: academicResources.title,
        accessCount: academicResources.accessCount
      })
      .from(academicResources)
      .orderBy(desc(academicResources.accessCount))
      .limit(5)
      .execute();
      
      // Get recently added resources
      const recentlyAddedResources = await db.select({
        id: academicResources.id,
        title: academicResources.title,
        uploadDate: academicResources.uploadDate
      })
      .from(academicResources)
      .orderBy(desc(academicResources.uploadDate))
      .limit(5)
      .execute();
      
      return {
        totalResources,
        resourcesByType,
        resourcesByCategory,
        mostAccessedResources,
        recentlyAddedResources
      };
    } catch (error) {
      console.error('Failed to get knowledge stats:', error);
      throw new Error('Failed to retrieve academic knowledge statistics');
    }
  }
}

export const academicKnowledgeTracker = new AcademicKnowledgeTracker();