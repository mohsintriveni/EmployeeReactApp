import './App.css';
import { Button, Modal, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { useForm  } from 'react-hook-form';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import apiService from './apiService'; 
import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmpoyeeForm';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [ file , setFile ] = useState(null);
  const [countries, setCountries] = useState({});
  const [states, setStates] = useState({});
  const [cities, setCities] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { reset } = useForm();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
 
  const handleFileChange = (file) => {
    setFile(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUser(null);
    message.success("Logged out successfully!")
  };

  const handleRegister = (userData) => {
    apiService.registerUser(userData)
    .then(response => {
      console.log(response);
      setShowRegisterForm(false);
      message.success("User added successfully!")
    })
    .catch(error => {
      console.error('Error registering user:', error);
    });
  }

  const handleLogin = (userData) => {
    apiService.loginUser(userData)
    .then(response => {
      message.success("User logged in successfully!")
      const token = response.message;
      setUser(userData);
      setLoggedIn(true);
      localStorage.setItem('token', token);
    })
    .catch(error => {
      console.error('Error logging in:', error);
      message.warning('Invalid Email/Password');
    });
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    };

    apiService.getAllEmployees()
      .then(response => {
        setData(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));

    apiService.getCountries()
    .then(response => {
      const countryMap = {};
      response.data.forEach(country => {
        countryMap[country.id] = country.countryName;
      });
      setCountries(countryMap);
    })
    .catch(error => console.error('Error fetching countries:', error));

    apiService.getAllCities()
    .then(response => {
      const cityMap = {};
      response.data.forEach(city => {
        cityMap[city.id] = city.cityName;
      });
      setCities(cityMap);
    })
    .catch(error => console.error('Error fetching cities:', error));

    apiService.getAllStates()
    .then(response => {
      const stateMap = {};
      response.data.forEach(state => {
        stateMap[state.id] = state.stateName;
      });
      setStates(stateMap);
    })

  }, []);

  const showModal = () => {
    setIsModalVisible(true);
    console.log(selectedEmployee)
  };

  const handleCancel = () => {
    reset();
    setIsModalVisible(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (record) => {
    console.log(record)

    setSelectedEmployee(record);
    showModal();
  };

  const onSubmit = async (formData) => {
    const payload = new FormData();
    payload.append('photo', file);
    payload.append('firstName', formData.firstName);
    payload.append('lastName', formData.lastName);
    payload.append('email', formData.email);
    payload.append('gender', formData.gender);
    payload.append('maritalStatus', formData.maritalStatus);
    payload.append('hobbies', formData.hobbies);
    payload.append('salary', formData.salary);
    payload.append('address', formData.address);
    payload.append('country', formData.country);
    payload.append('state', formData.state);
    payload.append('city', formData.city);
    payload.append('zipCode', formData.zipCode);
    payload.append('password', formData.password);

    if(selectedEmployee) {
      await apiService.updateEmployee(selectedEmployee.id , payload)
      .then(response => {
        apiService.getAllEmployees().then(res=>setData(res.data));
      });
    }
    else{
      apiService.addEmployee(payload).then(response => {
        apiService.getAllEmployees().then(res=>setData(res.data));
      });
    }  
       
    handleCancel();
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${record.firstName} ${record.lastName}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        apiService.deleteEmployee(record.id)
        .then(response => {
            message.success('Employee deleted successfully!');
            fetch('http://localhost:5055/api/Employees/get-all-employees')
            return apiService.getAllEmployees();
        })
        .then(updatedData => {
          setData(updatedData.data);
        })
        .catch(error => {
          console.error('Error deleting employee:', error);
          message.error('Failed to delete employee.');
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: id => countries[id],
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: id => states[id],
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: id => cities[id]
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <span>
          <Button type="primary" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="danger" onClick={() => handleDelete(record)}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="forms-container">
          {showRegisterForm ? (
            <RegisterForm handleRegister={handleRegister} />
          ) : (
            <LoginForm login={handleLogin} showRegisterForm={() => setShowRegisterForm(true)} />
          )}
        </div>
      ) : (
      
        <EmployeeTable
            data={data}
            columns={columns}
            showModal={showModal}
            handleLogout={handleLogout}
          />
      )}
      <EmployeeForm
        isVisible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={onSubmit}
        selectedEmployee={selectedEmployee}
        onFileChange={handleFileChange}
      />
    </div>
  );  
}

export default App;
