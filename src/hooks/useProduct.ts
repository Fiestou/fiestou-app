import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Product } from '@/types/product';

const fetchProduct = async (id: string) => {
  const { data } = await axios.get<Product>(`/api/products/${id}`);
  return data;
};

export function useProduct(id?: string) {
  return useQuery(['product', id], () => fetchProduct(id!), {
    enabled: !!id,
    staleTime: 1000 * 60, // 1 min
  });
}

// Exemplo de mutation para atualizar produto
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation(
    (payload: Partial<Product> & { id: string }) =>
      axios.put(`/api/products/${payload.id}`, payload).then(r => r.data),
    {
      onSuccess: (data) => qc.setQueryData(['product', data.id], data),
    }
  );
}
