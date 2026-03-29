export interface ArticleSchemaInput {
  url: string
  title: string
  description: string
  authorName: string
  publishedDate: string
  modifiedDate?: string
  imageUrl?: string
  organizationName: string
  organizationUrl: string
}

export interface ProductSchemaInput {
  url: string
  name: string
  description: string
  imageUrl?: string
  price?: number
  currency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  brandName?: string
}

export interface OrganizationSchemaInput {
  name: string
  url: string
  description?: string
  logoUrl?: string
  email?: string
  phone?: string
  address?: string
}

export function buildArticleSchema(input: ArticleSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.publishedDate,
    dateModified: input.modifiedDate || input.publishedDate,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: input.organizationName,
      url: input.organizationUrl,
    },
    ...(input.imageUrl ? { image: { '@type': 'ImageObject', url: input.imageUrl } } : {}),
  }
}

export function buildProductSchema(input: ProductSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(input.brandName ? { brand: { '@type': 'Brand', name: input.brandName } } : {}),
    ...(input.price !== undefined ? {
      offers: {
        '@type': 'Offer',
        price: input.price,
        priceCurrency: input.currency || 'USD',
        availability: `https://schema.org/${input.availability || 'InStock'}`,
        url: input.url,
      },
    } : {}),
  }
}

export function buildOrganizationSchema(input: OrganizationSchemaInput): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    ...(input.description ? { description: input.description } : {}),
    ...(input.logoUrl ? { logo: { '@type': 'ImageObject', url: input.logoUrl } } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { telephone: input.phone } : {}),
    ...(input.address ? { address: input.address } : {}),
  }
}

export function buildLlmsTxt(siteUrl: string, pages: Array<{ url: string; title: string; description: string }>): string {
  const host = siteUrl.replace(/\/$/, '')
  const lines = [
    `# ${host}`,
    `> This file follows the llms.txt standard to help AI assistants understand this site.`,
    ``,
    `## Pages`,
    ``,
    ...pages.map(p => `- [${p.title}](${p.url}): ${p.description}`),
  ]
  return lines.join('\n')
}

export function buildLlmsFullTxt(
  siteUrl: string,
  pages: Array<{ url: string; title: string; description: string; content: string }>
): string {
  const host = siteUrl.replace(/\/$/, '')
  const sections = [
    `# ${host} — Full Content Index`,
    ``,
    ...pages.flatMap(p => [
      `## ${p.title}`,
      `URL: ${p.url}`,
      p.description,
      ``,
      p.content,
      `---`,
      ``,
    ]),
  ]
  return sections.join('\n')
}
