import axios from 'axios'

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export interface TodoTask {
  id: string
  title: string
  status: string
  importance: string
  createdDateTime: string
  lastModifiedDateTime: string
  body?: {
    content: string
  }
}

export interface TodoList {
  id: string
  displayName: string
  isOwner: boolean
  isShared: boolean
}

export class MicrosoftGraphService {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  async getTaskLists(): Promise<TodoList[]> {
    const response = await axios.get(`${GRAPH_API_BASE}/me/todo/lists`, {
      headers: this.getHeaders(),
    })
    return response.data.value
  }

  async getTasks(listId: string): Promise<TodoTask[]> {
    const response = await axios.get(
      `${GRAPH_API_BASE}/me/todo/lists/${listId}/tasks`,
      {
        headers: this.getHeaders(),
      }
    )
    return response.data.value
  }

  async getTask(listId: string, taskId: string): Promise<TodoTask> {
    const response = await axios.get(
      `${GRAPH_API_BASE}/me/todo/lists/${listId}/tasks/${taskId}`,
      {
        headers: this.getHeaders(),
      }
    )
    return response.data
  }

  async updateTask(
    listId: string,
    taskId: string,
    updates: Partial<TodoTask>
  ): Promise<TodoTask> {
    const response = await axios.patch(
      `${GRAPH_API_BASE}/me/todo/lists/${listId}/tasks/${taskId}`,
      updates,
      {
        headers: this.getHeaders(),
      }
    )
    return response.data
  }
}