import './App.css';
import { Button, Modal, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { useForm  } from 'react-hook-form';
import apiService from './apiService'; 
import EmployeeTable from './EmployeeTable';
import EmployeeForm from './EmpoyeeForm';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [ file , setFile ] = useState(null);
  const [countries, setCountries] = useState({});
  const [countrydropdown, setCountryDropdown] = useState([]);
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
      setCountryDropdown(response.data);
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
  };

  const handleCancel = () => {
    reset();
    setIsModalVisible(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (record) => {
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
    // var birthDate = payload.birthDate;
    // var birthDateISO = new Date(birthDate + 'T00:00:00').toISOString();
    // payload.append('birthDate', birthDateISO);
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
            <RegisterForm register={handleRegister} />
          ) : (
            <LoginForm login={handleLogin} showRegisterForm={() => setShowRegisterForm(true)} />
          )}
        </div>
      ) : (
      <div className="Table-container">
        <h2>Employee Management</h2>
        <div className="add-button-container">
          <Button type="primary" onClick={showModal}>Add</Button>
          <Button type="primary" onClick={handleLogout}>Logout</Button>
        </div>
        <EmployeeTable
            data={data}
            columns={columns}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
      </div>
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

function LoginForm({ login, showRegisterForm }) {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    login({email,password});
  };

  return (
    <form className='limitedwidth mx-auto' onSubmit={onSubmit}>
      <h2>Login</h2>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Username or Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Login</button>
      <button type="button" className="btn btn-secondary" onClick={showRegisterForm}>Register</button>
    </form>
  );
}

function RegisterForm({ register }) {

  const { handleSubmit } = useForm();

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

  const onSubmit = (e) => {
    register({email, password, confirmpassword});
  };

  return (
    <form className='limitedwidth mx-auto' onSubmit={handleSubmit(onSubmit)}>
      <h2>Register</h2>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Username or Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Confirm Password"
          value={confirmpassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Register</button>
    </form>
  );
}

export default App;
