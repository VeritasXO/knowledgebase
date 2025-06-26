type AppFolioResponse<T> = { results: T[]; next_page_url: string | null };

/**
 * Base class for AppFolio API services
 * Handles authentication and common request functionality
 */
export abstract class AppFolioService {
  protected apiBaseUrl = "https://becovic.appfolio.com/api/v2/reports/";
  protected abstract reportName: string;
  private clientId: string | undefined;
  private clientSecret: string | undefined;

  constructor() {
    this.clientId = process.env.APPFOLIO_CLIENT_ID;
    this.clientSecret = process.env.APPFOLIO_CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "AppFolio API credentials not found in environment variables",
      );
    }
  }

  /**
   * Creates an authentication header from client ID and client secret
   */
  protected getAuthHeader(): string | undefined {
    if (!this.clientId || !this.clientSecret) {
      return undefined;
    }

    // Create API key from client ID and client secret using Base64 encoding
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString("base64");
    return `Basic ${credentials}`;
  }

  /**
   * Makes a request to the AppFolio API
   * @param url The URL to request. If null, uses the default URL for the report
   * @param body The request body
   */
  protected async makeApiRequest<T>(
    url: string | null,
    body: Record<string, unknown>,
  ): Promise<AppFolioResponse<T>> {
    try {
      const requestUrl = url || `${this.apiBaseUrl}${this.reportName}.json`;
      const authHeader = this.getAuthHeader();

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `AppFolio API error: ${response.status} - ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error making AppFolio API request:", error);
      throw error;
    }
  }

  /**
   * Fetches all pages of data from the AppFolio API
   * @param requestBody The body of the API request
   */
  protected async fetchAllPages<T>(
    requestBody: Record<string, unknown>,
  ): Promise<T[]> {
    let url: string | null = `${this.apiBaseUrl}${this.reportName}.json`;
    let allResults: T[] = [];

    try {
      do {
        const response: AppFolioResponse<T> = await this.makeApiRequest<T>(
          url,
          requestBody,
        );
        allResults = [...allResults, ...response.results];
        url = response.next_page_url;
      } while (url);

      console.log(
        `Fetched ${allResults.length} records for ${this.reportName}`,
      );
      return allResults;
    } catch (error) {
      console.error(`Error fetching data for ${this.reportName}:`, error);
      throw error;
    }
  }

  /**
   * Format a date object to YYYY-MM-DD format
   */
  public formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
