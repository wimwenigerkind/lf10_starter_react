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
import {ArrowUpDown, ChevronDown, MoreHorizontal, Filter} from "lucide-react"

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
import {useEmployeeApi} from "@/hooks/useEmployeeApi.ts";
import {CreateEmployeeDialog, type EmployeeFormData} from "@/pages/createEmployeePage.tsx";
import {EditEmployeeDialog, type EditEmployeeFormData} from "@/pages/editEmployeePage.tsx";
import {useQualificationApi} from "@/hooks/useQualificationApi.ts";
import type {Qualification} from "@/pages/QualificationsTable.tsx";

export type Employee = {
  id: string
  firstName: string
  lastName: string
  phone: string;
  street: string;
  postcode: string;
  city: string;
  qualifications: string[];
}

// FIXME: split into multiple files

export function EmployeeTable() {
  const {fetchEmployees, deleteEmployee, createEmployee, addQualificationToEmployee, updateEmployee, loading, error} = useEmployeeApi();
  const {fetchQualifications, fetchEmployeesByQualification} = useQualificationApi()
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const [selectedQualification, setSelectedQualification] = useState<string | null>(null);

  const handleOpenEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const columns: ColumnDef<Employee>[] = [
    {
      id: "select",
      header: ({table}) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({row}) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
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
      accessorKey: "firstName",
      header: ({column}) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Name
            <ArrowUpDown/>
          </Button>
        )
      },
      cell: ({row}) => <div>{row.getValue("firstName")}</div>,
    },
    {
      accessorKey: "lastName",
      header: ({column}) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Name
            <ArrowUpDown/>
          </Button>
        )
      },
      cell: ({row}) => <div>{row.getValue("lastName")}</div>,
    },
    {
      accessorKey: "phone",
      header: ({column}) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Phone Number
            <ArrowUpDown/>
          </Button>
        )
      },
      cell: ({row}) => <div>{row.getValue("phone")}</div>,
    },
    {
      id: "address",
      accessorFn: row =>
        `${row.street}, ${row.postcode} ${row.city}`,
      header: ({column}) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address
          <ArrowUpDown/>
        </Button>
      ),
      cell: ({row}) => <div>{row.getValue("address")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => {
        const employee = row.original

        return (
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
                onClick={() => navigator.clipboard.writeText(employee.id)}
              >
                Copy Employee ID
              </DropdownMenuItem>
              <DropdownMenuSeparator/>
              <DropdownMenuItem onClick={() => handleOpenEditDialog(employee)}>
                Edit employee
              </DropdownMenuItem>
              <DropdownMenuItem>
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: filteredEmployees,
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

  const hasSelectedRow = table.getFilteredSelectedRowModel().rows.length > 0;

  const handleDelete = async () => {
    const idsToDelete = table
      .getFilteredSelectedRowModel()
      .rows
      .map(row => row.original.id);

    await Promise.all(idsToDelete.map(id => deleteEmployee(id)));

    setEmployees(prev =>
      prev.filter(employee => !idsToDelete.includes(employee.id))
    );
    setFilteredEmployees(prev =>
      prev.filter(employee => !idsToDelete.includes(employee.id))
    );
    setRowSelection({});
  };

  const handleCreateEmployee = async (formData: EmployeeFormData) => {
    const createdEmployee = await createEmployee(formData);
    if (createdEmployee) {
      await Promise.all(
        formData.qualifications.map(q =>
          addQualificationToEmployee(createdEmployee.id, q.skill)
        )
      );
      setEmployees(prev => [...prev, { ...createdEmployee, qualifications: formData.qualifications.map(q => q.skill) }]);
    }
  };

  const handleEditEmployee = async (formData: EditEmployeeFormData) => {
    if (selectedEmployee) {
      const updatedEmployee = await updateEmployee(selectedEmployee.id, formData);
      if (updatedEmployee) {
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp));
      }
    }
  };


  useEffect(() => {
    fetchEmployees().then((data) => {
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    }).catch((err) => console.error(err));
    fetchQualifications().then((data) => setQualifications(data || [])).catch((err) => console.error(err));
  }, [fetchEmployees, fetchQualifications]);

  const handleQualificationFilter = async (qualificationId: string | null) => {
    setSelectedQualification(qualificationId);
    if (qualificationId === null) {
      setFilteredEmployees(employees);
    } else {
      const data = await fetchEmployeesByQualification(qualificationId);
      const employeeIds = (data?.employees || []).map((e: { id: number }) => e.id.toString());
      setFilteredEmployees(employees.filter(emp => employeeIds.includes(emp.id.toString())));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading employees...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by first name..."
            value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("firstName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          {/* Qualification */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {qualifications.find(q => q.id === selectedQualification)?.skill || "Qualification"}
                <ChevronDown className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Qualification</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedQualification === null}
                onCheckedChange={() => handleQualificationFilter(null)}
              >
                All Qualifications
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {qualifications.map((qual) => (
                <DropdownMenuCheckboxItem
                  key={qual.id}
                  checked={selectedQualification === qual.id}
                  onCheckedChange={() => handleQualificationFilter(qual.id)}
                >
                  {qual.skill}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* RIGHT SIDE */}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create
        </Button>
      </div>

      <CreateEmployeeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateEmployee}
      />

      <EditEmployeeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditEmployee}
        employee={selectedEmployee}
      />

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
          {hasSelectedRow && (
            <Button
              onClick={handleDelete}
              variant="destructive"
            >
              Delete
            </Button>
          )}

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
    </div>
  )
}
