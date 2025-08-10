// Web Story generation utilities for converting WordPress content to AMP-compliant stories

export interface StorySlide {
  id: string;
  type: 'title' | 'content' | 'image' | 'quote' | 'cta';
  content: {
    title?: string;
    subtitle?: string;
    text?: string;
    image?: string;
    imageAlt?: string;
    quote?: string;
    author?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    accentColor?: string;
    fontFamily: string;
    animation: string;
    duration: number;
    textAlign?: 'left' | 'center' | 'right';
  };
  layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
}

export interface StoryTemplate {
  id: string;
  name: string;
  category: string;
  config: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    animations: string[];
  };
}

export interface WordPressPostData {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  author: string;
}

export class WebStoryGenerator {
  private template: StoryTemplate;

  constructor(template: StoryTemplate) {
    this.template = template;
  }

  /**
   * Generate a complete Web Story from WordPress post data
   */
  generateStory(postData: WordPressPostData, options: {
    maxSlides?: number;
    includeTitle?: boolean;
    includeCTA?: boolean;
    ctaText?: string;
    ctaUrl?: string;
    customizations?: Partial<StoryTemplate['config']>;
  } = {}): StorySlide[] {
    const {
      maxSlides = 10,
      includeTitle = true,
      includeCTA = true,
      ctaText = 'Read Full Article',
      ctaUrl = '#',
      customizations = {}
    } = options;

    const slides: StorySlide[] = [];
    
    // Merge template config with customizations
    const config = { ...this.template.config, ...customizations };

    // 1. Title slide (if enabled)
    if (includeTitle) {
      slides.push(this.createTitleSlide(postData, config));
    }

    // 2. Content slides from post content
    const contentSlides = this.createContentSlides(postData, config, maxSlides - (includeTitle ? 1 : 0) - (includeCTA ? 1 : 0));
    slides.push(...contentSlides);

    // 3. CTA slide (if enabled)
    if (includeCTA) {
      slides.push(this.createCTASlide(postData, config, ctaText, ctaUrl));
    }

    return slides;
  }

  /**
   * Create title slide
   */
  private createTitleSlide(postData: WordPressPostData, config: StoryTemplate['config']): StorySlide {
    return {
      id: '1',
      type: 'title',
      content: {
        title: postData.title,
        subtitle: postData.excerpt || this.generateExcerpt(postData.content),
        image: postData.featuredImage,
      },
      style: {
        backgroundColor: config.backgroundColor,
        textColor: config.textColor,
        accentColor: config.accentColor,
        fontFamily: config.fontFamily,
        animation: this.getRandomAnimation(config.animations),
        duration: 6,
        textAlign: 'center',
      },
      layout: 'fill',
    };
  }

  /**
   * Create content slides from post content
   */
  private createContentSlides(postData: WordPressPostData, config: StoryTemplate['config'], maxSlides: number): StorySlide[] {
    const contentChunks = this.segmentContent(postData.content, maxSlides);
    const images = this.extractImages(postData.content);
    
    const slides: StorySlide[] = [];

    contentChunks.forEach((chunk, index) => {
      const slideId = (index + 2).toString(); // Start from 2 (after title slide)
      
      // Determine slide type based on content
      let slideType: StorySlide['type'] = 'content';
      if (chunk.isQuote) {
        slideType = 'quote';
      } else if (chunk.hasImage && images.length > 0) {
        slideType = 'image';
      }

      const slide: StorySlide = {
        id: slideId,
        type: slideType,
        content: {
          title: chunk.title,
          text: chunk.text,
          image: chunk.image || (images[index % images.length] || undefined),
          imageAlt: chunk.imageAlt,
          quote: chunk.isQuote ? chunk.text : undefined,
          author: chunk.isQuote ? postData.author : undefined,
        },
        style: {
          backgroundColor: this.getVariantColor(config.backgroundColor, index),
          textColor: config.textColor,
          accentColor: config.accentColor,
          fontFamily: config.fontFamily,
          animation: this.getRandomAnimation(config.animations),
          duration: this.calculateSlideDuration(chunk.text),
          textAlign: slideType === 'quote' ? 'center' : 'left',
        },
        layout: slideType === 'image' ? 'fill' : 'responsive',
      };

      slides.push(slide);
    });

    return slides.slice(0, maxSlides);
  }

  /**
   * Create CTA slide
   */
  private createCTASlide(postData: WordPressPostData, config: StoryTemplate['config'], ctaText: string, ctaUrl: string): StorySlide {
    return {
      id: 'cta',
      type: 'cta',
      content: {
        title: `Learn More About ${postData.title}`,
        subtitle: 'Continue reading the full article for more insights',
        buttonText: ctaText,
        buttonUrl: ctaUrl,
      },
      style: {
        backgroundColor: config.accentColor || config.backgroundColor,
        textColor: config.textColor,
        accentColor: config.backgroundColor,
        fontFamily: config.fontFamily,
        animation: 'zoom',
        duration: 5,
        textAlign: 'center',
      },
      layout: 'fill',
    };
  }

  /**
   * Segment content into manageable chunks for slides
   */
  private segmentContent(htmlContent: string, maxChunks: number): Array<{
    title?: string;
    text: string;
    image?: string;
    imageAlt?: string;
    hasImage: boolean;
    isQuote: boolean;
  }> {
    // Clean HTML content
    const cleanContent = this.cleanHTML(htmlContent);
    
    // Split content into paragraphs
    const paragraphs = cleanContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    const chunks: Array<{
      title?: string;
      text: string;
      image?: string;
      imageAlt?: string;
      hasImage: boolean;
      isQuote: boolean;
    }> = [];

    let currentChunk = '';
    let chunkWordCount = 0;
    const maxWordsPerSlide = 50;

    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/);
      const isHeading = this.isHeading(paragraph);
      const isQuote = this.isQuote(paragraph);
      const hasImage = this.hasImageInParagraph(paragraph);

      // If it's a heading and we have content, finish current chunk
      if (isHeading && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          hasImage: false,
          isQuote: false,
        });
        currentChunk = '';
        chunkWordCount = 0;
      }

      // If adding this paragraph would exceed word limit, finish current chunk
      if (chunkWordCount + words.length > maxWordsPerSlide && currentChunk) {
        chunks.push({
          title: isHeading ? undefined : this.extractTitle(currentChunk),
          text: currentChunk.trim(),
          hasImage: false,
          isQuote: false,
        });
        currentChunk = '';
        chunkWordCount = 0;
      }

      // Add paragraph to current chunk
      if (currentChunk) {
        currentChunk += '\n\n';
      }
      currentChunk += paragraph;
      chunkWordCount += words.length;

      // If this is a quote or has an image, finish the chunk immediately
      if (isQuote || hasImage) {
        chunks.push({
          title: isHeading ? this.cleanHeadingText(paragraph) : undefined,
          text: isQuote ? this.cleanQuoteText(paragraph) : currentChunk.trim(),
          image: hasImage ? this.extractImageFromParagraph(paragraph) : undefined,
          imageAlt: hasImage ? this.extractImageAlt(paragraph) : undefined,
          hasImage,
          isQuote,
        });
        currentChunk = '';
        chunkWordCount = 0;
      }

      // Stop if we've reached max chunks
      if (chunks.length >= maxChunks) {
        break;
      }
    }

    // Add remaining content as final chunk
    if (currentChunk.trim() && chunks.length < maxChunks) {
      chunks.push({
        text: currentChunk.trim(),
        hasImage: false,
        isQuote: false,
      });
    }

    return chunks.slice(0, maxChunks);
  }

  /**
   * Clean HTML content for story use
   */
  private cleanHTML(html: string): string {
    // Remove script and style tags
    let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Convert HTML entities
    content = content.replace(/&nbsp;/g, ' ');
    content = content.replace(/&amp;/g, '&');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&#39;/g, "'");
    
    // Preserve line breaks and paragraphs
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<\/p>/gi, '\n\n');
    content = content.replace(/<p[^>]*>/gi, '');
    
    // Remove remaining HTML tags except for basic formatting
    content = content.replace(/<(?!\/?(strong|b|em|i|h[1-6]|blockquote|img)\b)[^>]*>/gi, '');
    
    // Clean up whitespace
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    content = content.trim();
    
    return content;
  }

  /**
   * Check if paragraph is a heading
   */
  private isHeading(text: string): boolean {
    return /^<h[1-6]|^#{1,6}\s/.test(text.trim());
  }

  /**
   * Check if paragraph is a quote
   */
  private isQuote(text: string): boolean {
    return /^<blockquote|^>/.test(text.trim()) || text.includes('<blockquote');
  }

  /**
   * Check if paragraph contains an image
   */
  private hasImageInParagraph(text: string): boolean {
    return /<img[^>]*src/i.test(text);
  }

  /**
   * Extract image URL from paragraph
   */
  private extractImageFromParagraph(text: string): string | undefined {
    const match = text.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    return match ? match[1] : undefined;
  }

  /**
   * Extract image alt text
   */
  private extractImageAlt(text: string): string | undefined {
    const match = text.match(/<img[^>]*alt=["']([^"']+)["'][^>]*>/i);
    return match ? match[1] : undefined;
  }

  /**
   * Clean heading text
   */
  private cleanHeadingText(text: string): string {
    return text.replace(/<\/?h[1-6][^>]*>/gi, '').replace(/^#{1,6}\s/, '').trim();
  }

  /**
   * Clean quote text
   */
  private cleanQuoteText(text: string): string {
    return text.replace(/<\/?blockquote[^>]*>/gi, '').replace(/^>\s?/, '').trim();
  }

  /**
   * Extract title from content chunk
   */
  private extractTitle(text: string): string | undefined {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return undefined;
    
    const firstLine = lines[0].trim();
    
    // If first line is short and followed by longer content, it's likely a title
    if (firstLine.length < 100 && lines.length > 1 && lines[1].length > firstLine.length) {
      return firstLine;
    }
    
    return undefined;
  }

  /**
   * Extract images from content
   */
  private extractImages(htmlContent: string): string[] {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images: string[] = [];
    let match;
    
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      images.push(match[1]);
    }
    
    return images;
  }

  /**
   * Generate excerpt from content if not provided
   */
  private generateExcerpt(content: string, maxLength: number = 160): string {
    const cleanContent = this.cleanHTML(content);
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let excerpt = '';
    for (const sentence of sentences) {
      if ((excerpt + sentence).length > maxLength) {
        break;
      }
      excerpt += sentence + '. ';
    }
    
    return excerpt.trim() || cleanContent.substring(0, maxLength) + '...';
  }

  /**
   * Get random animation from template animations
   */
  private getRandomAnimation(animations: string[]): string {
    return animations[Math.floor(Math.random() * animations.length)];
  }

  /**
   * Get variant of background color for visual variety
   */
  private getVariantColor(baseColor: string, index: number): string {
    // For gradient backgrounds, rotate through slight variations
    if (baseColor.includes('gradient')) {
      const variants = [
        baseColor,
        baseColor.replace('135deg', '45deg'),
        baseColor.replace('135deg', '225deg'),
        baseColor.replace('135deg', '315deg'),
      ];
      return variants[index % variants.length];
    }
    
    return baseColor;
  }

  /**
   * Calculate optimal slide duration based on text length
   */
  private calculateSlideDuration(text: string): number {
    const wordCount = text.trim().split(/\s+/).length;
    const baseTime = 3; // seconds
    const timePerWord = 0.1; // seconds per word for reading
    
    // Minimum 3 seconds, maximum 8 seconds
    return Math.min(Math.max(baseTime + (wordCount * timePerWord), 3), 8);
  }

  /**
   * Generate AMP HTML for the complete story
   */
  generateAMPHTML(slides: StorySlide[], metadata: {
    title: string;
    description: string;
    author: string;
    publisherName: string;
    publisherLogo: string;
    canonicalUrl: string;
  }): string {
    const ampHTML = `
<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <title>${this.escapeHTML(metadata.title)}</title>
  <link rel="canonical" href="${metadata.canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${this.escapeHTML(metadata.description)}">
  
  <!-- Web Stories specific meta -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${this.escapeHTML(metadata.title)}">
  <meta property="og:description" content="${this.escapeHTML(metadata.description)}">
  
  <!-- AMP boilerplate -->
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  
  <!-- AMP Web Story -->
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <script async custom-element="amp-story-auto-ads" src="https://cdn.ampproject.org/v0/amp-story-auto-ads-0.1.js"></script>
  
  <!-- JSON-LD structured data -->
  <script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "Article",
    "headline": "${this.escapeJSON(metadata.title)}",
    "description": "${this.escapeJSON(metadata.description)}",
    "author": {
      "@type": "Person",
      "name": "${this.escapeJSON(metadata.author)}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "${this.escapeJSON(metadata.publisherName)}",
      "logo": {
        "@type": "ImageObject",
        "url": "${metadata.publisherLogo}"
      }
    },
    "url": "${metadata.canonicalUrl}",
    "datePublished": "${new Date().toISOString()}"
  }
  </script>
</head>

<body>
  <amp-story standalone
            title="${this.escapeHTML(metadata.title)}"
            publisher="${this.escapeHTML(metadata.publisherName)}"
            publisher-logo-src="${metadata.publisherLogo}"
            poster-portrait-src="${slides[0]?.content.image || metadata.publisherLogo}">
    
    ${slides.map((slide, index) => this.generateSlideAMP(slide, index)).join('\n')}
    
    <!-- Auto ads (optional) -->
    <amp-story-auto-ads>
      <script type="application/json">
      {
        "ad-attributes": {
          "type": "doubleclick",
          "data-slot": "/30497360/a4a/amp_story_dfp_example"
        }
      }
      </script>
    </amp-story-auto-ads>
  </amp-story>
</body>
</html>`;

    return ampHTML.trim();
  }

  /**
   * Generate AMP HTML for individual slide
   */
  private generateSlideAMP(slide: StorySlide, index: number): string {
    const slideId = `slide-${slide.id}`;
    
    let slideContent = '';
    
    switch (slide.type) {
      case 'title':
        slideContent = this.generateTitleSlideAMP(slide);
        break;
      case 'content':
        slideContent = this.generateContentSlideAMP(slide);
        break;
      case 'image':
        slideContent = this.generateImageSlideAMP(slide);
        break;
      case 'quote':
        slideContent = this.generateQuoteSlideAMP(slide);
        break;
      case 'cta':
        slideContent = this.generateCTASlideAMP(slide);
        break;
      default:
        slideContent = this.generateContentSlideAMP(slide);
    }

    return `
    <amp-story-page id="${slideId}">
      <amp-story-grid-layer template="fill" style="background: ${slide.style.backgroundColor};">
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical">
        ${slideContent}
      </amp-story-grid-layer>
    </amp-story-page>`;
  }

  private generateTitleSlideAMP(slide: StorySlide): string {
    return `
        <div class="story-title-container" style="text-align: ${slide.style.textAlign || 'center'}; color: ${slide.style.textColor}; font-family: ${slide.style.fontFamily};">
          <h1 style="font-size: 2.5em; margin-bottom: 0.5em; line-height: 1.2;">
            ${this.escapeHTML(slide.content.title || '')}
          </h1>
          ${slide.content.subtitle ? `
          <p style="font-size: 1.2em; opacity: 0.9; line-height: 1.4;">
            ${this.escapeHTML(slide.content.subtitle)}
          </p>` : ''}
        </div>`;
  }

  private generateContentSlideAMP(slide: StorySlide): string {
    return `
        <div class="story-content-container" style="color: ${slide.style.textColor}; font-family: ${slide.style.fontFamily};">
          ${slide.content.title ? `
          <h2 style="font-size: 1.8em; margin-bottom: 1em; color: ${slide.style.accentColor || slide.style.textColor};">
            ${this.escapeHTML(slide.content.title)}
          </h2>` : ''}
          <div style="font-size: 1.1em; line-height: 1.6; text-align: ${slide.style.textAlign || 'left'};">
            ${this.escapeHTML(slide.content.text || '').replace(/\n/g, '<br>')}
          </div>
        </div>`;
  }

  private generateImageSlideAMP(slide: StorySlide): string {
    return `
        ${slide.content.image ? `
        <amp-img src="${slide.content.image}"
                 alt="${this.escapeHTML(slide.content.imageAlt || '')}"
                 layout="fill"
                 object-fit="cover">
        </amp-img>` : ''}
        <div class="story-image-overlay" style="background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: ${slide.style.textColor}; font-family: ${slide.style.fontFamily};">
          ${slide.content.title ? `
          <h2 style="font-size: 1.8em; margin-bottom: 0.5em;">
            ${this.escapeHTML(slide.content.title)}
          </h2>` : ''}
          ${slide.content.text ? `
          <p style="font-size: 1.1em; line-height: 1.5;">
            ${this.escapeHTML(slide.content.text)}
          </p>` : ''}
        </div>`;
  }

  private generateQuoteSlideAMP(slide: StorySlide): string {
    return `
        <div class="story-quote-container" style="text-align: center; color: ${slide.style.textColor}; font-family: ${slide.style.fontFamily};">
          <blockquote style="font-size: 1.5em; line-height: 1.4; margin: 0; font-style: italic;">
            "${this.escapeHTML(slide.content.quote || slide.content.text || '')}"
          </blockquote>
          ${slide.content.author ? `
          <cite style="display: block; margin-top: 1em; font-size: 1em; opacity: 0.8;">
            — ${this.escapeHTML(slide.content.author)}
          </cite>` : ''}
        </div>`;
  }

  private generateCTASlideAMP(slide: StorySlide): string {
    return `
        <div class="story-cta-container" style="text-align: center; color: ${slide.style.textColor}; font-family: ${slide.style.fontFamily};">
          <h2 style="font-size: 2em; margin-bottom: 0.5em;">
            ${this.escapeHTML(slide.content.title || '')}
          </h2>
          ${slide.content.subtitle ? `
          <p style="font-size: 1.2em; margin-bottom: 2em; opacity: 0.9;">
            ${this.escapeHTML(slide.content.subtitle)}
          </p>` : ''}
          ${slide.content.buttonUrl ? `
          <a href="${slide.content.buttonUrl}" 
             style="display: inline-block; background: ${slide.style.accentColor || slide.style.textColor}; color: ${slide.style.backgroundColor}; padding: 1em 2em; text-decoration: none; border-radius: 2em; font-weight: bold;">
            ${this.escapeHTML(slide.content.buttonText || 'Learn More')}
          </a>` : ''}
        </div>`;
  }

  /**
   * Escape HTML content
   */
  private escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Escape JSON content
   */
  private escapeJSON(str: string): string {
    return str.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }
}

/**
 * Create a story generator with predefined template
 */
export function createStoryGenerator(templateId: string, templates: StoryTemplate[]): WebStoryGenerator {
  const template = templates.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template with ID ${templateId} not found`);
  }
  
  return new WebStoryGenerator(template);
}

/**
 * Optimize images for Web Stories
 */
export function optimizeImageForStory(imageUrl: string): {
  webpUrl?: string;
  fallbackUrl: string;
  dimensions?: { width: number; height: number };
} {
  // In a real implementation, this would:
  // 1. Convert to WebP format for better compression
  // 2. Resize to optimal dimensions (1080x1920 for portrait, etc.)
  // 3. Compress for faster loading
  // 4. Generate multiple sizes for different devices
  
  return {
    fallbackUrl: imageUrl,
    // webpUrl would be the optimized version
    // dimensions would be detected from the image
  };
}

/**
 * Validate AMP HTML
 */
export function validateAMPHTML(ampHTML: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation checks
  if (!ampHTML.includes('⚡') && !ampHTML.includes('amp')) {
    errors.push('Missing AMP attribute in html tag');
  }
  
  if (!ampHTML.includes('amp-story')) {
    errors.push('Missing amp-story component');
  }
  
  if (!ampHTML.includes('application/ld+json')) {
    warnings.push('Missing structured data (JSON-LD)');
  }
  
  // Check for required meta tags
  if (!ampHTML.includes('viewport')) {
    errors.push('Missing viewport meta tag');
  }
  
  if (!ampHTML.includes('canonical')) {
    warnings.push('Missing canonical URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
