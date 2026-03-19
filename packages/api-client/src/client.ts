import type { z } from 'zod';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.getToken) {
      const token = await this.config.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T>(path: string, schema?: z.ZodType<T>): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.config.baseUrl}${path}`, { headers });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new ApiError(res.status, error.error?.code ?? 'UNKNOWN', error.error?.message ?? res.statusText);
    }

    const json = await res.json();
    if (schema) {
      return schema.parse(json.data);
    }
    return json.data as T;
  }

  async post<T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new ApiError(res.status, error.error?.code ?? 'UNKNOWN', error.error?.message ?? res.statusText);
    }

    const json = await res.json();
    if (schema) {
      return schema.parse(json.data);
    }
    return json.data as T;
  }

  async put<T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new ApiError(res.status, error.error?.code ?? 'UNKNOWN', error.error?.message ?? res.statusText);
    }

    const json = await res.json();
    if (schema) {
      return schema.parse(json.data);
    }
    return json.data as T;
  }

  async delete(path: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new ApiError(res.status, error.error?.code ?? 'UNKNOWN', error.error?.message ?? res.statusText);
    }
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
