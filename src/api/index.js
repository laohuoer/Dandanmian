const BASE_URL = '/api'

/**
 * 通用请求封装
 */
async function request(url, options = {}) {
  const { data, ...rest } = options

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers
    },
    ...rest
  }

  if (data && !(data instanceof FormData)) {
    config.body = JSON.stringify(data)
  } else if (data instanceof FormData) {
    delete config.headers['Content-Type']
    config.body = data
  }

  const response = await fetch(BASE_URL + url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.error || error.message || '请求失败')
  }

  // DELETE 请求可能没有返回体
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null
  }

  return response.json()
}

export function get(url, params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val)
    }
  })
  const qs = query.toString()
  return request(qs ? `${url}?${qs}` : url)
}

export function post(url, data) {
  return request(url, { method: 'POST', data })
}

export function put(url, data) {
  return request(url, { method: 'PUT', data })
}

export function del(url) {
  return request(url, { method: 'DELETE' })
}

/**
 * 上传文件（FormData）
 */
export function upload(url, formData) {
  return request(url, {
    method: 'POST',
    data: formData
  })
}
