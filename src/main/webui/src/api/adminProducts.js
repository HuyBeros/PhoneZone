import { fetchApi } from './apiClient';

export async function fetchAllAdminProducts() {
  const data = [];
  let page = 0;
  let totalPages = 1;
  while (page < totalPages) {
    const result = await fetchApi(`/admin/products?page=${page}&size=200`);
    data.push(...result.data);
    totalPages = result.totalPages;
    page++;
  }
  return { data, total: data.length };
}
