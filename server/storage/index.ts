/**
 * Database Storage Implementation
 *
 * Main storage class that aggregates all domain-specific storage implementations.
 */

import { ArticleTagsStorage } from "@server/storage/article-tags-storage";
import { ArticlesStorage } from "@server/storage/articles-storage";
import { GoogleStorage } from "@server/storage/google";
import { SettingsStorage } from "@server/storage/settings";
import { UserStorage } from "@server/storage/users";

export class DatabaseStorage {
  user: UserStorage;
  settings: SettingsStorage;
  google: GoogleStorage;
  articles: ArticlesStorage;
  articleTags: ArticleTagsStorage;

  constructor() {
    // Initialize all the specific storage implementations
    this.user = new UserStorage();
    this.settings = new SettingsStorage();
    this.google = new GoogleStorage();
    this.articles = new ArticlesStorage();
    this.articleTags = new ArticleTagsStorage();
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
