// WordPress API client utilities for connecting to and fetching data from WordPress sites

export interface WordPressCredentials {
  username: string;
  applicationPassword?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  categories: number[];
  tags: number[];
  author: number;
  status: string;
  date: string;
  modified: string;
  link: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
    author?: Array<{
      name: string;
    }>;
    "wp:term"?: Array<Array<{
      name: string;
      taxonomy: string;
    }>>;
  };
}

export interface WordPressApiResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
}

export class WordPressApiClient {
  private baseUrl: string;
  private credentials: WordPressCredentials;

  constructor(siteUrl: string, credentials: WordPressCredentials) {
    this.baseUrl = this.normalizeUrl(siteUrl);
    this.credentials = credentials;
  }

  private normalizeUrl(url: string): string {
    // Ensure the URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Remove trailing slash
    url = url.replace(/\/$/, '');
    
    // Add wp-json/wp/v2 endpoint
    return `${url}/wp-json/wp/v2`;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.credentials.applicationPassword && this.credentials.username) {
      // Application password authentication (recommended)
      const credentials = btoa(`${this.credentials.username}:${this.credentials.applicationPassword}`);
      headers['Authorization'] = `Basic ${credentials}`;
    } else if (this.credentials.password && this.credentials.username) {
      // Basic authentication (less secure)
      const credentials = btoa(`${this.credentials.username}:${this.credentials.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }
    // OAuth2 would be handled differently, but not implemented in this example

    return headers;
  }

  /**
   * Test the connection to the WordPress site
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/posts?per_page=1`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        return {
          success: false,
          message: 'Authentication failed. Please check your credentials.',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          message: 'WordPress REST API not found. Please check the site URL.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: `Connection failed with status ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Connection successful!',
        data: {
          postsFound: Array.isArray(data) ? data.length : 0,
          siteReachable: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Fetch posts from the WordPress site
   */
  async fetchPosts(params: {
    page?: number;
    perPage?: number;
    status?: string;
    categories?: number[];
    tags?: number[];
    author?: number;
    search?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WordPressApiResponse<WordPressPost>> {
    const {
      page = 1,
      perPage = 10,
      status = 'publish',
      categories,
      tags,
      author,
      search,
      orderBy = 'date',
      order = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      status,
      orderby: orderBy,
      order,
      _embed: '1', // Include embedded data like featured images and authors
    });

    if (categories && categories.length > 0) {
      queryParams.append('categories', categories.join(','));
    }

    if (tags && tags.length > 0) {
      queryParams.append('tags', tags.join(','));
    }

    if (author) {
      queryParams.append('author', author.toString());
    }

    if (search) {
      queryParams.append('search', search);
    }

    try {
      const response = await fetch(`${this.baseUrl}/posts?${queryParams.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }

      const posts = await response.json();
      const total = parseInt(response.headers.get('X-WP-Total') || '0');
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

      return {
        data: posts,
        total,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Error fetching posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch a single post by ID
   */
  async fetchPost(postId: number): Promise<WordPressPost> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}?_embed=1`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch categories from the WordPress site
   */
  async fetchCategories(): Promise<Array<{ id: number; name: string; slug: string; count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/categories?per_page=100`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch tags from the WordPress site
   */
  async fetchTags(): Promise<Array<{ id: number; name: string; slug: string; count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/tags?per_page=100`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch authors from the WordPress site
   */
  async fetchAuthors(): Promise<Array<{ id: number; name: string; slug: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch authors: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching authors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or update a Web Story post on WordPress
   */
  async publishWebStory(story: {
    title: string;
    content: string;
    status?: 'publish' | 'draft';
    meta?: Record<string, any>;
  }): Promise<{ success: boolean; postId?: number; message: string }> {
    try {
      const postData = {
        title: story.title,
        content: story.content,
        status: story.status || 'draft',
        type: 'web-story', // Assumes Web Stories plugin is installed
        meta: story.meta || {},
      };

      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const createdPost = await response.json();

      return {
        success: true,
        postId: createdPost.id,
        message: 'Web Story published successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to publish Web Story: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get site information
   */
  async getSiteInfo(): Promise<{
    name: string;
    description: string;
    url: string;
    timezone: string;
    gmt_offset: number;
  }> {
    try {
      // Remove /wp/v2 from the base URL to get the root API endpoint
      const rootApiUrl = this.baseUrl.replace('/wp-json/wp/v2', '/wp-json');
      
      const response = await fetch(rootApiUrl, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch site info: ${response.status} ${response.statusText}`);
      }

      const siteInfo = await response.json();
      
      return {
        name: siteInfo.name || 'WordPress Site',
        description: siteInfo.description || '',
        url: siteInfo.url || '',
        timezone: siteInfo.timezone_string || 'UTC',
        gmt_offset: siteInfo.gmt_offset || 0,
      };
    } catch (error) {
      throw new Error(`Error fetching site info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Transform WordPress post data to our internal format
 */
export function transformWordPressPost(wpPost: WordPressPost) {
  return {
    wpPostId: wpPost.id.toString(),
    title: wpPost.title.rendered,
    content: wpPost.content.rendered,
    excerpt: wpPost.excerpt.rendered.replace(/<[^>]*>/g, ''), // Strip HTML tags
    featuredImage: wpPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
    categories: wpPost._embedded?.['wp:term']?.[0]?.filter(term => term.taxonomy === 'category').map(term => term.name) || [],
    tags: wpPost._embedded?.['wp:term']?.[1]?.filter(term => term.taxonomy === 'post_tag').map(term => term.name) || [],
    author: wpPost._embedded?.author?.[0]?.name || 'Unknown Author',
    status: wpPost.status,
    publishedAt: wpPost.status === 'publish' ? new Date(wpPost.date) : null,
    wpCreatedAt: new Date(wpPost.date),
    wpUpdatedAt: new Date(wpPost.modified),
  };
}

/**
 * Clean HTML content for Web Story use
 */
export function cleanContentForStory(htmlContent: string): string {
  // Remove script tags and their content
  let content = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Convert common HTML entities
  content = content.replace(/&nbsp;/g, ' ');
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#39;/g, "'");
  
  // Remove most HTML tags but keep basic formatting
  content = content.replace(/<(?!\/?(p|br|strong|b|em|i|ul|ol|li|h[1-6])\b)[^>]*>/gi, '');
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ');
  content = content.trim();
  
  return content;
}

/**
 * Extract images from WordPress post content
 */
export function extractImagesFromContent(htmlContent: string): string[] {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const images: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    images.push(match[1]);
  }
  
  return images;
}
