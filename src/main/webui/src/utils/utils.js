export const fmt = n => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
export const discount = (p, o) => o ? `-${Math.round((1 - p / o) * 100)}%` : '';
