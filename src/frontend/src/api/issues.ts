import { customFetch } from './fetcher'
import type { IssueFilter, IssueStatus } from '../issues'

export type { IssueFilter, IssueStatus } from '../issues'

export type IssueAuthor = {
  id: number
  display_name: string
}

export type IssueDetail = {
  id: number
  title: string
  description: string
  status: IssueStatus
  created_at: string
  updated_at: string
  created_by: IssueAuthor
}

type ApiResponse<T, TStatus extends number> = {
  data: T
  status: TStatus
  headers: Headers
}

export function listIssues(status: IssueFilter = 'all') {
  const query = new URLSearchParams({ status })
  return customFetch<ApiResponse<IssueDetail[], 200>>(`/api/issues/?${query}`, {
    method: 'GET',
  })
}

export function createIssue(title: string, description: string) {
  return customFetch<ApiResponse<IssueDetail, 201>>('/api/issues/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  })
}

export function updateIssue(
  id: number,
  fields: Pick<IssueDetail, 'title' | 'description'>,
) {
  return customFetch<ApiResponse<IssueDetail, 200>>(`/api/issues/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
}

export function deleteIssue(id: number) {
  return customFetch<ApiResponse<void, 204>>(`/api/issues/${id}/`, {
    method: 'DELETE',
  })
}

export function toggleIssueStatus(id: number) {
  return customFetch<ApiResponse<IssueDetail, 200>>(
    `/api/issues/${id}/toggle-status/`,
    { method: 'POST' },
  )
}
