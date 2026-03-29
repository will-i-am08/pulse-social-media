export interface WPPost {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  link: string
}

export class WordPressClient {
  private baseUrl: string
  private authHeader: string

  constructor(siteUrl: string, username: string, appPassword: string) {
    this.baseUrl = siteUrl.replace(/\/$/, '') + '/wp-json/wp/v2'
    this.authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  }

  private async req(path: string, init: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    })
    if (!res.ok) throw new Error(`WordPress API error ${res.status}: ${await res.text()}`)
    return res.json()
  }

  async getPost(postId: number): Promise<WPPost> {
    return this.req(`/posts/${postId}`)
  }

  async updatePost(postId: number, content: string): Promise<void> {
    await this.req(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  }

  async injectSchema(postId: number, jsonLd: object): Promise<void> {
    const post = await this.getPost(postId)
    const scriptTag = `\n<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`
    // Remove existing ld+json block if present, then append
    const cleanContent = post.content.rendered.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    await this.updatePost(postId, cleanContent + scriptTag)
  }

  async uploadFile(filename: string, content: string, mimeType = 'text/plain'): Promise<string> {
    const res = await fetch(`${this.baseUrl}/media`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': mimeType,
      },
      body: content,
    })
    if (!res.ok) throw new Error(`WordPress media upload error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.source_url as string
  }
}
