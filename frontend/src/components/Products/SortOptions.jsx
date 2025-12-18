import React from 'react';
import { useSearchParams } from 'react-router-dom';

// Shadcn
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Icons
import { ArrowUpDown } from 'lucide-react';
// Data
import { sortPublic } from '@/lib/data/data';

const SortOptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== '' && value !== 'newest') {
      params.set('sortBy', value);
    } else {
      params.delete('sortBy');
    }

    // searchParams.set('sortBy', sortBy);
    setSearchParams(params);
  };
  return (
    <div className="mb-4 flex items-center justify-end">
      {/* <select
        id="sort"
        onChange={handleSortChange}
        value={searchParams.get('sortBy') || ''}
        className="border p-2 rounded-md focus:outline-none"
      >
        <option value="default">Default</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popularity">Popularity</option>
      </select> */}

      <Select
        value={searchParams.get('sortBy') || 'newest'}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-40 py-4">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent className="bg-white w-40">
          {sortPublic.map((s) => (
            <SelectItem key={s.value} className={'hover:bg-gray-100'} value={s.value}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortOptions;
