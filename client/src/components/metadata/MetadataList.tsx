import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosWithToken from '../../utils/axiosWithToken';
import { useTable, useSortBy, usePagination } from 'react-table';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Database, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Loader2
} from 'lucide-react';

interface MetadataItem {
  id: string;
  name: string;
  version: string;
  status: string;
  updated_at: string;
  created_by?: string;
  type?: string;
}

interface MetadataListProps { 
  assetType: string; 
  onSelect: (id: string) => void; 
}

export default function MetadataList({ assetType, onSelect }: MetadataListProps) {
  const [searchFilter, setSearchFilter] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['metadataList', assetType],
    queryFn: () => 
      axiosWithToken.get<MetadataItem[]>(`/api/metadata/${assetType}`)
        .then(res => res.data),
  });

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    
    if (!searchFilter.trim()) return data;
    
    const searchTerm = searchFilter.toLowerCase();
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm) || 
      item.version.toLowerCase().includes(searchTerm) ||
      (item.created_by && item.created_by.toLowerCase().includes(searchTerm))
    );
  }, [data, searchFilter]);

  // Define columns
  const columns = React.useMemo(() => [
    { 
      Header: 'Name',
      accessor: 'name' as const,
      Cell: ({ value }: { value: string }) => <span className="font-medium">{value}</span>
    },
    { 
      Header: 'Version',
      accessor: 'version' as const,
      Cell: ({ value }: { value: string }) => (
        <div className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs font-medium">
          v{value}
        </div>
      )
    },
    { 
      Header: 'Status',
      accessor: 'status' as const,
      Cell: ({ value }: { value: string }) => {
        let color;
        switch(value?.toLowerCase()) {
          case 'active':
            color = 'bg-green-100 text-green-800';
            break;
          case 'draft':
            color = 'bg-amber-100 text-amber-800';
            break;
          case 'archived':
            color = 'bg-gray-100 text-gray-800';
            break;
          default:
            color = 'bg-blue-100 text-blue-800';
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            {value}
          </span>
        );
      }
    },
    { 
      Header: 'Updated',
      accessor: 'updated_at' as const,
      Cell: ({ value }: { value: string }) => (
        <span className="text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
  ], []);

  // Set up react-table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            {assetType === 'forms' ? 'eCRF Forms' : 
             assetType === 'terminology' ? 'Controlled Terminology' : 
             assetType === 'datasets' ? 'Dataset Definitions' : 
             'Metadata Assets'}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[200px]"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
        <CardDescription>
          Browse and manage your clinical trial metadata
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
            <span>Loading metadata...</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <table {...getTableProps()} className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="px-4 py-3.5 text-left font-medium text-gray-700"
                        >
                          <div className="flex items-center">
                            {column.render('Header')}
                            <span className="ml-1">
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronUp className="h-4 w-4" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map(row => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="cursor-pointer hover:bg-gray-50 border-b last:border-0"
                        onClick={() => onSelect(row.original.id)}
                      >
                        {row.cells.map(cell => (
                          <td
                            {...cell.getCellProps()}
                            className="px-4 py-3"
                          >
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Rows per page</span>
                  <Select 
                    value={pageSize.toString()} 
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[5, 10, 20, 30, 40, 50].map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <span className="text-sm text-gray-700">
                  Page{" "}
                  <span className="font-medium">{pageIndex + 1}</span> of{" "}
                  <span className="font-medium">{pageOptions.length}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}