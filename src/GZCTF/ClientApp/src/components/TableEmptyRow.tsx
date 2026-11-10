import { Table } from '@mantine/core'
import { FC, ReactNode } from 'react'
import { Empty } from '@Components/Empty'

interface TableEmptyRowProps {
  colSpan: number
  description?: ReactNode
}

/**
 * Empty-state row for Mantine tables, so a table with no rows does not render
 * a bare header.
 */
export const TableEmptyRow: FC<TableEmptyRowProps> = ({ colSpan, description }) => (
  <Table.Tr>
    <Table.Td colSpan={colSpan}>
      <Empty description={description} />
    </Table.Td>
  </Table.Tr>
)
