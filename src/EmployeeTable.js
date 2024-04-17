import React from 'react';
import { Table, Button } from 'antd';

const EmployeeTable = ({ data, columns, handleEdit, handleDelete }) => {
  return (
    <Table dataSource={data} columns={columns}>
    </Table>
  );
};

export default EmployeeTable;
