import { get, post, put, del } from './index.js'

/**
 * 获取分类列表
 */
export function fetchCategories() {
  return get('/categories')
}

/**
 * 新增分类
 */
export function createCategory(data) {
  return post('/categories', data)
}

/**
 * 更新分类
 */
export function updateCategory(id, data) {
  return put(`/categories/${id}`, data)
}

/**
 * 删除分类
 */
export function deleteCategory(id) {
  return del(`/categories/${id}`)
}
