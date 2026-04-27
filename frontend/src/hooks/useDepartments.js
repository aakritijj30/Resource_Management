import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '../api/departmentApi';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then(res => res.data),
  });
}
