import { get, post, put, del } from './index.js'

/**
 * 获取照片列表
 * @param {Object} params - 查询参数 { category, _page, _limit, _sort, _order }
 */
export function fetchPhotos(params = {}) {
  return get('/photos', params)
}

/**
 * 获取单张照片
 */
export function fetchPhoto(id) {
  return get(`/photos/${id}`)
}

/**
 * 新增照片
 */
export function createPhoto(data) {
  return post('/photos', data)
}

/**
 * 更新照片
 */
export function updatePhoto(id, data) {
  return put(`/photos/${id}`, data)
}

/**
 * 删除照片
 */
export function deletePhoto(id) {
  return del(`/photos/${id}`)
}

/**
 * 批量删除照片
 * @param {number[]} ids - 照片 ID 列表
 */
export function batchDeletePhotos(ids) {
  return post('/photos/batch-delete', { ids })
}
