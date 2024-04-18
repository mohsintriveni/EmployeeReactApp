import React from 'react';
import { Table, Button } from 'antd';

const EmployeeTable = ({ data, columns, showModal, handleLogout }) => {
  return (
    <div className="Table-container">
        <h2>Employee Management</h2>
        <div className="add-button-container">
          <Button type="primary" onClick={showModal}>Add</Button>
          <Button type="primary" onClick={handleLogout}>Logout</Button>
        </div>
    <Table dataSource={data} columns={columns}>
    </Table>
    </div>

  );
};

export default EmployeeTable;
