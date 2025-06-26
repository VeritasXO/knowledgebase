/**
 * Base Storage Implementation
 *
 * Provides common functionality for all storage implementations.
 */
import { db } from "@server/db";

export abstract class BaseStorage {
  protected db = db;
}
