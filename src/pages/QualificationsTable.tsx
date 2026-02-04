import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {ArrowUpDown, ChevronDown, MoreHorizontal} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {useEffect, useState} from "react";
import {useQualificationApi} from "@/hooks/useQualificationApi.ts";
import { QualificationFormModal } from "@/components/QualificationFormModal";

export type Qualification = {
  id: string
  skill: string
}

export function QualificationsTable() {
  const {fetchQualifications, createQualification, updateQualification, deleteQualification, loading, error} = useQualificationApi();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{id?: string, skill: string} | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchQualifications().then((data) => setQualifications(data || [])).catch((err) => console.error(err));
  }, [fetchQualifications]);

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({});

  // Compute selectedRowId from rowSelection and table
  const columns: ColumnDef<Qualification>[] = [
    {
      id: "select",
      header: ({table}) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => {
            // Only allow single selection for the whole page
            if (value) {
              const firstRow = table.getRowModel().rows[0];
              if (firstRow) {
                table.resetRowSelection();
                firstRow.toggleSelected(true);
              }
            } else {
              table.resetRowSelection();
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({row, table}) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            if (value) {
              // Single select: clear all, then select this
              table.resetRowSelection();
              row.toggleSelected(true);
            } else {
              row.toggleSelected(false);
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({row}) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "skill",
      header: ({column}) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Skill
            <ArrowUpDown/>
          </Button>
        )
      },
      cell: ({row}) => <div>{row.getValue("skill")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => {
        const qualification = row.original
        return (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(qualification.id)}
                >
                  Copy Qualification ID
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => {
                  setModalInitialData(qualification);
                  setModalOpen(true);
                }}>Edit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]


  const table = useReactTable({
    data: qualifications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Compute selectedRowId from rowSelection and table
  const selectedIndexes = Object.keys(rowSelection);
  let selectedRowId: string | null = null;
  if (selectedIndexes.length === 1) {
    const idx = Number(selectedIndexes[0]);
    const row = table.getRowModel().rows[idx];
    selectedRowId = row ? row.original.id : null;
  }

  // Modal logic
  const handleCreate = () => {
    setModalInitialData(null);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setModalInitialData(null);
  };
  const handleModalSubmit = async (data: { id?: string; skill: string }) => {
    setActionLoading(true);
    try {
      if (data.id) {
        await updateQualification(data.id, { skill: data.skill });
      } else {
        await createQualification({ skill: data.skill });
      }
      const refreshed = await fetchQualifications();
      setQualifications(refreshed || []);
      handleModalClose();
    } finally {
      setActionLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedRowId) return;
    setActionLoading(true);
    setDeleteError(null);
    try {
      await deleteQualification(selectedRowId);
      const refreshed = await fetchQualifications();
      setQualifications(refreshed || []);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete qualification.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading qualifications...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="w-full">
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {deleteError}
        </div>
      )}
      <div className="flex items-center py-4 gap-2">
        <Button onClick={handleCreate} variant="default">Create Qualification</Button>
        <Button onClick={handleDelete} variant="destructive" disabled={!selectedRowId || actionLoading}>Delete Selected</Button>
        <Input
          placeholder="Filter by skill..."
          value={(table.getColumn("skill")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("skill")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={selectedRowId === row.original.id ? "bg-muted" : ""}
                  style={{ cursor: "pointer" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <QualificationFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={modalInitialData}
        loading={actionLoading}
      />
    </div>
  )
}