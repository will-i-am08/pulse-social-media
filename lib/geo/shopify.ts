const API_VERSION = '2025-01'

export class ShopifyClient {
  private shop: string
  private token: string

  constructor(shop: string, accessToken: string) {
    this.shop = shop.replace(/\/$/, '')
    this.token = accessToken
  }

  private async graphql(query: string, variables: Record<string, unknown> = {}) {
    const res = await fetch(
      `https://${this.shop}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      }
    )
    if (!res.ok) throw new Error(`Shopify API error ${res.status}: ${await res.text()}`)
    const json = await res.json() as { data: unknown; errors?: unknown[] }
    if (json.errors?.length) throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`)
    return json.data
  }

  async updateProductDescription(productId: string, descriptionHtml: string): Promise<void> {
    await this.graphql(
      `mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          userErrors { field message }
        }
      }`,
      { input: { id: productId, descriptionHtml } }
    )
  }

  async injectProductSchema(productId: string, jsonLd: object): Promise<void> {
    await this.graphql(
      `mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          userErrors { field message }
        }
      }`,
      {
        input: {
          id: productId,
          metafields: [{
            namespace: 'seo',
            key: 'json_ld',
            type: 'json',
            value: JSON.stringify(jsonLd),
          }],
        },
      }
    )
  }

  async updateThemeAsset(themeId: string, key: string, value: string): Promise<void> {
    const res = await fetch(
      `https://${this.shop}/admin/api/${API_VERSION}/themes/${themeId}/assets.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asset: { key, value } }),
      }
    )
    if (!res.ok) throw new Error(`Shopify asset update error ${res.status}: ${await res.text()}`)
  }
}
