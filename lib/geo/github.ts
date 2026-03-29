import { Octokit } from '@octokit/rest'

export class GitHubClient {
  private octokit: Octokit
  private owner: string
  private repo: string
  private branch: string

  constructor(token: string, owner: string, repo: string, branch = 'main') {
    this.octokit = new Octokit({ auth: token })
    this.owner = owner
    this.repo = repo
    this.branch = branch
  }

  async upsertFile(path: string, content: string, message: string, targetBranch?: string): Promise<void> {
    const branch = targetBranch || this.branch
    let sha: string | undefined

    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch,
      })
      if (!Array.isArray(data) && 'sha' in data) sha = data.sha
    } catch {
      // File doesn't exist yet — sha stays undefined
    }

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    })
  }

  async createBranch(newBranch: string): Promise<void> {
    const { data: ref } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
    })
    await this.octokit.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${newBranch}`,
      sha: ref.object.sha,
    })
  }

  async openPR(head: string, title: string, body: string): Promise<string> {
    const { data } = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title,
      body,
      head,
      base: this.branch,
    })
    return data.html_url
  }
}
